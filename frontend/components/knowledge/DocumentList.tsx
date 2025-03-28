import React from 'react';
import { Document } from '../../store/types/knowledgeTypes';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onSelect: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  selectedDocumentId: string | null;
}

// Helper function to get icon based on file type
const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'txt':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'docx':
    case 'doc':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

// Format file size to human-readable format
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  onSelect,
  onDelete,
  selectedDocumentId,
}) => {
  if (isLoading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700">No documents yet</h3>
        <p className="text-sm text-gray-500 mt-1">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow divide-y divide-gray-200">
      {documents.map((doc) => (
        <div 
          key={doc.filename}
          className={`flex items-center px-4 py-4 border-b sm:px-6 border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedDocumentId === doc.filename ? 'bg-[#e6f2fa] border-l-4 border-l-[#0e79b8]' : ''
          }`}
          onClick={() => onSelect(doc.filename)}
        >
          <div className="flex-shrink-0 mr-4">
            {getFileIcon(doc.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-indigo-600 truncate">{doc.title}</p>
            <div className="flex text-xs text-gray-500">
              <p className="truncate">{doc.filename}</p>
              <span className="mx-1">•</span>
              <p>{formatFileSize(doc.size)}</p>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(doc.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.filename);
              }}
              className="text-gray-400 hover:text-red-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
};

export default DocumentList; 