import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../store/AuthContext';

interface KnowledgeItem {
  id: string;
  title: string;
  type: 'pdf' | 'text' | 'url';
  size: string;
  date: Date;
}

const KnowledgeBasePage: React.FC = () => {
  const { principal } = useAuth();
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
    {
      id: '1',
      title: 'Company Handbook 2023',
      type: 'pdf',
      size: '2.4 MB',
      date: new Date(2023, 5, 15)
    },
    {
      id: '2',
      title: 'Product Documentation',
      type: 'text',
      size: '450 KB',
      date: new Date(2023, 7, 22)
    },
    {
      id: '3',
      title: 'Research Paper: Vector Databases',
      type: 'pdf',
      size: '1.8 MB',
      date: new Date(2023, 9, 3)
    },
    {
      id: '4', 
      title: 'FAQ Knowledge Base',
      type: 'url',
      size: '320 KB',
      date: new Date(2023, 10, 12)
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleToggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const handleDeleteSelected = () => {
    setIsDeleting(true);
    
    // Simulate deletion delay
    setTimeout(() => {
      setKnowledgeItems(knowledgeItems.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setIsDeleting(false);
    }, 1000);
  };
  
  const handleAddDocument = (title: string, type: 'pdf' | 'text' | 'url', size: string) => {
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title,
      type,
      size,
      date: new Date()
    };
    
    setKnowledgeItems([...knowledgeItems, newItem]);
    setShowAddModal(false);
  };
  
  // Function to get file type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'text':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'url':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };
  
  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Knowledge Base</h1>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">Principal: {principal.substring(0, 10)}...</div>
            {selectedItems.length > 0 ? (
              <button 
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            ) : (
              <button 
                onClick={() => setShowAddModal(true)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Knowledge Base List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {knowledgeItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Your knowledge base is empty</h2>
              <p className="text-gray-600 mb-6">Add documents to train your AI assistant</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-md hover:bg-indigo-700 transition"
              >
                Add Document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgeItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="flex items-center p-4">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">{item.size}</span>
                        <span className="mx-2 h-1 w-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs text-gray-500">
                          {item.date.toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleToggleSelect(item.id)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          selectedItems.includes(item.id) 
                            ? 'bg-indigo-600 border-indigo-600' 
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedItems.includes(item.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Document Modal */}
      {showAddModal && (
        <AddDocumentModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddDocument}
        />
      )}
    </AppLayout>
  );
};

// Add Document Modal Component
interface AddDocumentModalProps {
  onClose: () => void;
  onAdd: (title: string, type: 'pdf' | 'text' | 'url', size: string) => void;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pdf' | 'text' | 'url'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let size = '0 KB';
    
    if (type === 'pdf' && file) {
      size = formatFileSize(file.size);
      onAdd(title || file.name, type, size);
    } else if (type === 'url' && url) {
      size = '10 KB'; // Estimate for URL content
      onAdd(title || new URL(url).hostname, type, size);
    } else if (type === 'text' && text) {
      size = formatFileSize(new Blob([text]).size);
      onAdd(title || 'Text Document', type, size);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Add Document</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Document Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Enter a title for your document"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('pdf')}
                className={`p-3 border rounded-xl flex flex-col items-center ${
                  type === 'pdf' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">PDF</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType('text')}
                className={`p-3 border rounded-xl flex flex-col items-center ${
                  type === 'text' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs">Text</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType('url')}
                className={`p-3 border rounded-xl flex flex-col items-center ${
                  type === 'url' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-xs">URL</span>
              </button>
            </div>
          </div>
          
          {type === 'pdf' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload PDF
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                {file ? (
                  <div>
                    <p className="text-sm text-gray-800 mb-1">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-500 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PDF (max 10MB)</p>
                    <input
                      type="file"
                      accept=".pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {type === 'url' && (
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                placeholder="https://example.com"
                required={type === 'url'}
              />
            </div>
          )}
          
          {type === 'text' && (
            <div className="mb-4">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                rows={6}
                placeholder="Enter or paste text content here"
                required={type === 'text'}
              ></textarea>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg"
              disabled={(type === 'pdf' && !file) || (type === 'url' && !url) || (type === 'text' && !text)}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeBasePage; 