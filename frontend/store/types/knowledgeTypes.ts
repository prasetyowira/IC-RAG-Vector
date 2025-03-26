import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "declarations/backend/backend.did";

// Document type definition
export interface Document {
  filename: string;
  title: string;
  type: string;
  size: number;
  createdAt: Date;
}

// Pagination parameters
export interface PaginationParams {
  limit: number;
  offset: number;
}

// File upload parameters
export interface FileUploadParams {
  title: string;
  type: string;
  filename: string;
  content: Uint8Array;
}

// KnowledgeBase state
export interface KnowledgeState {
  documents: Document[];
  selectedDocumentId: string | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalDocuments: number;
  currentPage: number;
  pageSize: number;
}

// Actor type from backend service
export type BackendActor = ActorSubclass<_SERVICE>; 