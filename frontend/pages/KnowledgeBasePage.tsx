import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../store/AuthContext';
import { 
  fetchDocuments, 
  uploadDocument, 
  deleteDocument,
  selectDocuments,
  selectIsLoading,
  selectError,
  selectPaginationParams,
  setSelectedDocument,
  selectSelectedDocument,
  clearDocuments,
  resetPagination
} from '../store/knowledgeSlice';
import DocumentList from '../components/knowledge/DocumentList';
import FileUploader from '../components/knowledge/FileUploader';
import { AppDispatch } from '../store/store';
import { PaginationParams, FileUploadParams } from '../store/types/knowledgeTypes';

const KnowledgeBasePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { actor } = useAuth();
  
  // Redux state
  const documents = useSelector(selectDocuments);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const selectedDocument = useSelector(selectSelectedDocument);
  const { currentPage, pageSize, hasMore } = useSelector(selectPaginationParams);
  
  // Local state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Ref for the IntersectionObserver
  const observerRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch documents on initial load
  useEffect(() => {
    if (actor) {
      handleFetchDocuments(false);
    }
    
    return () => {
      // Clear documents when component unmounts
      dispatch(clearDocuments());
    };
  }, [actor]);
  
  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && actor) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, isLoading, actor, currentPage]);
  
  // Fetch documents with pagination
  const handleFetchDocuments = (append: boolean = false) => {
    if (!actor) return;
    
    const params: PaginationParams = {
      limit: pageSize,
      offset: append ? (currentPage - 1) * pageSize : 0
    };
    
    dispatch(fetchDocuments({ actor, params, append }));
  };
  
  // Load more documents for infinite scroll
  const handleLoadMore = () => {
    if (!actor || isLoading || !hasMore) return;
    
    const params: PaginationParams = {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize
    };
    
    dispatch(fetchDocuments({ actor, params, append: true }));
  };
  
  // Handle document selection
  const handleSelectDocument = (documentId: string) => {
    dispatch(setSelectedDocument(documentId));
  };
  
  // Handle document deletion
  const handleDeleteDocument = async (filename: string) => {
    if (!actor) return;
    
    try {
      await dispatch(deleteDocument({ actor, filename })).unwrap();
      setNotification({
        type: 'success',
        message: 'Document deleted successfully'
      });
      setShowDeleteConfirm(null);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: String(error)
      });
    }
  };
  
  // Handle upload success
  const handleUploadSuccess = () => {
    setNotification({
      type: 'success',
      message: 'Document uploaded successfully'
    });
    
    // Reset pagination and fetch fresh documents
    dispatch(resetPagination());
    handleFetchDocuments(false);
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Handle upload error
  const handleUploadError = (errorMessage: string) => {
    setNotification({
      type: 'error',
      message: errorMessage
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // Handle manual document upload
  const handleUploadDocument = async (params: FileUploadParams) => {
    if (!actor) return;
    
    try {
      await dispatch(uploadDocument({ actor, params })).unwrap();
      handleUploadSuccess();
    } catch (error) {
      handleUploadError(String(error));
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{notification.message}</span>
            <button
              className="ml-auto text-gray-500 hover:text-gray-700"
              onClick={() => setNotification(null)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Document</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteDocument(showDeleteConfirm);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-3/4 flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
              <p className="text-gray-600">
                Upload documents to enhance your AI assistant's knowledge
              </p>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}
            
            {/* Document List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Documents</h2>
              </div>
              
              <DocumentList
                documents={documents}
                isLoading={isLoading}
                onSelect={handleSelectDocument}
                onDelete={(documentId) => setShowDeleteConfirm(documentId)}
                selectedDocumentId={selectedDocument?.filename || null}
              />
              
              {/* Load More Observer - for infinite scroll */}
              {hasMore && (
                <div 
                  ref={observerRef} 
                  className="h-10 flex items-center justify-center"
                >
                  {isLoading && documents.length > 0 && (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                  )}
                </div>
              )}
              
              {/* End of list */}
              <div ref={listEndRef} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <FileUploader
              actor={actor}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              isUploading={isLoading}
            />
            
            {/* Selected Document Details */}
            {selectedDocument && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Document Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Title</span>
                    <span className="block text-sm text-gray-900">{selectedDocument.title}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Filename</span>
                    <span className="block text-sm text-gray-900 break-all">{selectedDocument.filename}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Type</span>
                    <span className="block text-sm text-gray-900">{selectedDocument.type.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Size</span>
                    <span className="block text-sm text-gray-900">
                      {(selectedDocument.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Uploaded</span>
                    <span className="block text-sm text-gray-900">
                      {new Date(selectedDocument.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="pt-3">
                    <button
                      onClick={() => setShowDeleteConfirm(selectedDocument.filename)}
                      className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none transition-colors"
                    >
                      Delete Document
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage; 