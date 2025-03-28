import React, { useState, useRef } from 'react';
import { BackendActor } from '../../store/types/knowledgeTypes';

// File type options
const FILE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF Document', mimeTypes: ['application/pdf'] },
  { value: 'text', label: 'Text File', mimeTypes: ['text/plain'] },
  { value: 'docs', label: 'Word Document', mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] }
];

// Flattened array of all accepted MIME types
const ACCEPTED_FILE_TYPES = FILE_TYPE_OPTIONS.flatMap(option => option.mimeTypes);

// Map MIME types to simple extensions
const MIME_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif'
};

interface FileUploaderProps {
  actor: BackendActor | null;
  onUploadSuccess: () => void;
  onUploadError: (error: string) => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  actor,
  onUploadSuccess,
  onUploadError,
  isUploading: externalIsUploading
}) => {
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [localIsUploading, setLocalIsUploading] = useState(false); // Local loading state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = externalIsUploading || localIsUploading;

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Check if file type is supported
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      onUploadError('File type not supported. Please upload PDF, TXT, DOC, DOCX.');
      return;
    }
    
    setFile(selectedFile);
    
    // Set default title from filename (without extension)
    const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
    setTitle(nameWithoutExt || selectedFile.name);
    
    // Set the file type based on MIME type
    for (const option of FILE_TYPE_OPTIONS) {
      if (option.mimeTypes.includes(selectedFile.type)) {
        setSelectedFileType(option.value);
        break;
      }
    }
    
    // Open the modal
    setShowModal(true);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSelectedFileType('');
    setShowModal(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !actor || !selectedFileType) {
      onUploadError('Please select a file and file type');
      return;
    }
    
    try {
      setLocalIsUploading(true);

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Get file extension from MIME type or use the selected type
      const fileType = selectedFileType;
      
      // Create unique filename to avoid collisions
      const timestamp = Date.now();
      const uniqueFilename = `${file.name.split('.')[0]}_${timestamp}.${MIME_TYPE_MAP[file.type] || fileType}`;
      
      // Call API
      const result = await actor.upload_file(
        fileType,
        title || file.name,
        uniqueFilename,
        uint8Array
      );
      
      if ('Err' in result) {
        throw new Error(JSON.stringify(result.Err));
      }
      
      // Reset form and notify parent
      resetForm();
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(String(error));
    } finally {
      setLocalIsUploading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-medium text-[#0e79b8] mb-4">Upload Document</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
            dragActive ? 'border-[#0e79b8] bg-[#e6f2fa]' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleInputChange}
          />
          
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-700">Drag & drop a file here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, TXT, DOC, DOCX</p>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden mx-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#0e79b8]">Add Document</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              {/* File Information */}
              {file && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-[#e6f2fa] rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0e79b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Document Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
                  placeholder="Enter a title for your document"
                />
              </div>
              
              {/* File Type Selection */}
              <div className="mb-6">
                <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-1">
                  File Type *
                </label>
                <select
                  id="fileType"
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
                  required
                >
                  <option value="">Select file type</option>
                  {FILE_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e79b8] text-sm font-medium"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0e79b8] text-white rounded-xl hover:bg-[#066aa4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e79b8] text-sm font-medium"
                  disabled={isUploading || !actor || !selectedFileType}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Upload Document'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploader; 