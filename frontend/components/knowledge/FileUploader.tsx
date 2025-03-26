import React, { useState, useRef } from 'react';
import { BackendActor } from '../../store/types/knowledgeTypes';

// Accepted file types
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif'
];

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
  isUploading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Check if file type is supported
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      onUploadError('File type not supported. Please upload PDF, TXT, DOC, DOCX, or images.');
      return;
    }
    
    setFile(selectedFile);
    
    // Set default title from filename (without extension)
    const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
    setTitle(nameWithoutExt || selectedFile.name);
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !actor) return;
    
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Get file extension from MIME type
      const fileType = MIME_TYPE_MAP[file.type] || 'unknown';
      
      // Create unique filename to avoid collisions
      const timestamp = Date.now();
      const uniqueFilename = `${file.name.split('.')[0]}_${timestamp}.${fileType}`;
      
      // Call API
      const result = await actor.upload_file(
        title || file.name,
        fileType,
        uniqueFilename,
        uint8Array
      );
      
      if ('Err' in result) {
        throw new Error(JSON.stringify(result.Err));
      }
      
      // Reset form and notify parent
      setFile(null);
      setTitle('');
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(String(error));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Drop Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
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
            accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif"
            onChange={handleInputChange}
          />
          
          {file ? (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Drag & drop a file here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, TXT, DOC, DOCX, JPG, PNG, GIF</p>
            </>
          )}
        </div>
        
        {/* Document Title */}
        {file && (
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter document title"
              required
            />
          </div>
        )}
        
        {/* Submit Button */}
        {file && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setTitle('');
              }}
              className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isUploading || !actor}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        )}
      </form>
    </div>
  );
};

export default FileUploader; 