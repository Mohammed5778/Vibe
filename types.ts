
export interface File {
  id: string;
  path: string;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  files: File[];
  githubUrl?: string;
}

export type AppView = 'desktop' | 'mobile';

export interface AppState {
  isInitializing: boolean;
  isAiLoading: boolean;
  projects: Project[];
  activeProjectId: string | null;
  activeFileId: string | null;
  error: string | null;
  isImportModalOpen: boolean;
  isNewProjectModalOpen: boolean;
  uploadedImageBase64: string | null;
  uploadedImageType: string | null;
  isApiKeyMissing: boolean;
}
