import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  selectDocuments,
  selectIsLoading,
  selectError
} from '../store/knowledgeSlice';

const KnowledgeBase: React.FC = () => {
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectDocuments);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('text');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsUploading(true);
    try {
      await dispatch(uploadDocument({ title, type, content })).unwrap();
      setTitle('');
      setContent('');
      setIsUploading(false);
    } catch (error) {
      console.error('Failed to upload document:', error);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteDocument(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  return (
    <div className="knowledge-base-container">
      <h2>Knowledge Base</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="upload-document-form">
        <h3>Upload New Document</h3>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="type">Document Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="website">Website</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document content"
              rows={5}
              required
            />
          </div>
          
          <button type="submit" disabled={isUploading || isLoading}>
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>
      
      <div className="documents-list">
        <h3>Your Documents</h3>
        {isLoading ? (
          <div className="loading">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">No documents found. Upload your first document!</div>
        ) : (
          <ul>
            {documents.map(doc => (
              <li key={doc.id} className="document-item">
                <div className="document-info">
                  <h4>{doc.title}</h4>
                  <p>Type: {doc.type}</p>
                  <p>Size: {formatFileSize(doc.size)}</p>
                  <p>Uploaded: {formatDate(doc.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export default KnowledgeBase; 