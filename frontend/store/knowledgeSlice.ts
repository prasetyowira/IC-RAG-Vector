import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { backend } from 'backend';
import { RootState } from './store';

// Type definitions
export interface Document {
  id: string;
  title: string;
  type: string;
  size: number;
  createdAt: number;
}

interface KnowledgeState {
  documents: Document[];
  selectedDocumentId: string | null;
  isLoading: boolean;
  error: string | null;
  collectionId: string;
}

// Initial state
const initialState: KnowledgeState = {
  documents: [],
  selectedDocumentId: null,
  isLoading: false,
  error: null,
  collectionId: "default"
};

// Async thunk for fetching documents from the backend canister
export const fetchDocuments = createAsyncThunk(
  'knowledge/fetchDocuments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { collectionId } = state.knowledge;
      
      // Call the ICP backend canister to get documents
      const response = await backend.list_documents(collectionId, [], []);
      
      if ('Err' in response) {
        throw new Error(JSON.stringify(response.Err));
      }
      
      // For now just return document IDs as we don't have full document metadata
      return response.Ok.map((docId: string) => ({
        id: docId,
        title: `Document ${docId}`,
        type: 'Unknown',
        size: 0,
        createdAt: Date.now()
      }));
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
  async (document: { title: string; type: string; content: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { collectionId } = state.knowledge;
      
      // Convert content to ByteBuf (Uint8Array)
      const encoder = new TextEncoder();
      const contentBytes = encoder.encode(document.content);
      
      // Call the ICP backend canister to upload document
      const response = await backend.upload_file(
        collectionId,
        document.title,
        contentBytes
      );
      
      if ('Err' in response) {
        throw new Error(JSON.stringify(response.Err));
      }
      
      // Return document info
      return {
        id: response.Ok,
        title: document.title,
        type: document.type,
        size: document.content.length,
        createdAt: Date.now()
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
  async (documentId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { collectionId } = state.knowledge;
      
      // Call the ICP backend canister to delete document
      const response = await backend.delete_document(collectionId, documentId);
      
      if ('Err' in response) {
        throw new Error(JSON.stringify(response.Err));
      }
      
      return documentId;
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
    },
    
    updateDocumentTitle: (state, action: PayloadAction<{ documentId: string; title: string }>) => {
      const document = state.documents.find(d => d.id === action.payload.documentId);
      if (document) {
        document.title = action.payload.title;
      }
    },
    
    setCollectionId: (state, action: PayloadAction<string>) => {
      state.collectionId = action.payload;
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
        state.documents = action.payload;
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
        state.documents.push(action.payload);
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
        state.documents = state.documents.filter(d => d.id !== action.payload);
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
  setCollectionId
} = knowledgeSlice.actions;

export const selectDocuments = (state: RootState) => state.knowledge.documents;
export const selectSelectedDocument = (state: RootState) => {
  const { selectedDocumentId, documents } = state.knowledge;
  return documents.find((document: Document) => document.id === selectedDocumentId) || null;
};
export const selectIsLoading = (state: RootState) => state.knowledge.isLoading;
export const selectError = (state: RootState) => state.knowledge.error;

export default knowledgeSlice.reducer; 