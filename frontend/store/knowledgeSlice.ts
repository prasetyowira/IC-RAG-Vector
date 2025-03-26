import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { DocMetadata } from 'declarations/backend/backend.did';
import { Document, PaginationParams, FileUploadParams, BackendActor, KnowledgeState } from './types/knowledgeTypes';

// Initial state
const initialState: KnowledgeState = {
  documents: [],
  selectedDocumentId: null,
  isLoading: false,
  error: null,
  hasMore: true,
  totalDocuments: 0,
  currentPage: 1,
  pageSize: 10
};

// Async thunk for fetching documents with pagination
export const fetchDocuments = createAsyncThunk(
  'knowledge/fetchDocuments',
  async ({actor, params, append = false}: {
    actor: BackendActor, 
    params: PaginationParams, 
    append?: boolean
  }, { rejectWithValue }) => {
    try {
      // Call the ICP backend canister to get documents
      const response = await actor.list_documents(
        [BigInt(params.limit)], 
        [BigInt(params.offset)]
      );
      
      if ('Err' in response) {
        throw new Error(JSON.stringify(response.Err));
      }
      
      // Transform the data
      const documents = response.Ok.map((doc: DocMetadata) => ({
        filename: doc.file_name,
        title: doc.title,
        type: doc.file_type[0] || 'unknown',
        size: Number(doc.file_size),
        createdAt: new Date(Number(doc.created_at) * 1000)
      }));
      
      return {
        documents,
        append,
        hasMore: documents.length === params.limit,
      };
    } catch (error) {
      const errorString = String(error);
      const match = errorString.match(/(SysTransient|CanisterReject), \+"([^\\"]+")/);
      const errorMessage = match ? match[2] : 'Failed to fetch documents';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for uploading a document
export const uploadDocument = createAsyncThunk(
  'knowledge/uploadDocument',
  async ({actor, params}: {
    actor: BackendActor, 
    params: FileUploadParams
  }, { rejectWithValue }) => {
    try {      
      // Call the ICP backend canister to upload document
      const response = await actor.upload_file(
        params.title,
        params.type,
        params.filename,
        params.content
      );
      
      if ('Err' in response) {
        throw new Error(JSON.stringify(response.Err));
      }
      
      // Return document info
      return {
        filename: params.filename,
        title: params.title,
        type: params.type,
        size: params.content.length,
        createdAt: new Date()
      };
    } catch (error) {
      const errorString = String(error);
      const match = errorString.match(/(SysTransient|CanisterReject), \+"([^\\"]+")/);
      const errorMessage = match ? match[2] : 'Failed to upload document';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for deleting a document
export const deleteDocument = createAsyncThunk(
  'knowledge/deleteDocument',
  async ({actor, filename}: {
    actor: BackendActor, 
    filename: string
  }, { rejectWithValue }) => {
    try {
      // Call the ICP backend canister to delete document
      const response = await actor.delete_document(filename);
      
      if ('Err' in response) {
        throw new Error(JSON.stringify(response.Err));
      }
      
      return filename;
    } catch (error) {
      const errorString = String(error);
      const match = errorString.match(/(SysTransient|CanisterReject), \+"([^\\"]+")/);
      const errorMessage = match ? match[2] : 'Failed to delete document';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState,
  reducers: {
    setSelectedDocument: (state, action: PayloadAction<string | null>) => {
      state.selectedDocumentId = action.payload;
    },
    
    clearDocuments: (state) => {
      state.documents = [];
      state.selectedDocumentId = null;
      state.currentPage = 1;
      state.hasMore = true;
    },
    
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMore = true;
    },
    
    updateDocumentTitle: (state, action: PayloadAction<{ documentId: string; title: string }>) => {
      const document = state.documents.find(d => d.filename === action.payload.documentId);
      if (document) {
        document.title = action.payload.title;
      }
    },
    
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.append) {
          state.documents = [...state.documents, ...action.payload.documents];
        } else {
          state.documents = action.payload.documents;
        }
        
        state.hasMore = action.payload.hasMore;
        
        if (action.payload.documents.length > 0) {
          state.currentPage++;
        }
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = [action.payload, ...state.documents];
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(d => d.filename !== action.payload);
        if (state.selectedDocumentId === action.payload) {
          state.selectedDocumentId = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and selectors
export const { 
  setSelectedDocument, 
  clearDocuments, 
  updateDocumentTitle,
  resetPagination,
  setPageSize
} = knowledgeSlice.actions;

// Selectors
export const selectDocuments = (state: RootState) => state.knowledge.documents;
export const selectSelectedDocument = (state: RootState) => {
  const { selectedDocumentId, documents } = state.knowledge;
  return documents.find((document) => document.filename === selectedDocumentId) || null;
};
export const selectIsLoading = (state: RootState) => state.knowledge.isLoading;
export const selectError = (state: RootState) => state.knowledge.error;
export const selectPaginationParams = (state: RootState) => ({
  currentPage: state.knowledge.currentPage,
  pageSize: state.knowledge.pageSize,
  hasMore: state.knowledge.hasMore
});

export default knowledgeSlice.reducer; 