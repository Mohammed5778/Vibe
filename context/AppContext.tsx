import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, Project, File } from '../types';
import { generateProjectFromPrompt } from '../services/geminiService';
import { importFromGitHub } from '../services/importService';
import JSZip from 'jszip';

declare global {
    interface Window {
        showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    }

    interface FileSystemHandle {
        kind: 'file' | 'directory';
        name: string;
    }

    interface FileSystemFileHandle extends FileSystemHandle {
        kind: 'file';
        getFile(): Promise<globalThis.File>;
    }

    interface FileSystemDirectoryHandle extends FileSystemHandle {
        kind: 'directory';
        values(): AsyncIterable<FileSystemHandle>;
    }
}

type Action =
  | { type: 'INITIALIZE_SUCCESS' }
  | { type: 'START_AI_GENERATION' }
  | { type: 'AI_GENERATION_SUCCESS'; payload: Project }
  | { type: 'AI_GENERATION_FAILURE'; payload: string }
  | { type: 'SELECT_PROJECT'; payload: string }
  | { type: 'SELECT_FILE'; payload: string }
  | { type: 'UPDATE_FILE_CONTENT'; payload: { fileId: string; content: string } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'RENAME_PROJECT'; payload: { projectId: string; newName: string } }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'RENAME_FILE'; payload: { fileId: string; newPath: string } }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'OPEN_IMPORT_MODAL' }
  | { type: 'CLOSE_IMPORT_MODAL' }
  | { type: 'OPEN_NEW_PROJECT_MODAL' }
  | { type: 'CLOSE_NEW_PROJECT_MODAL' }
  | { type: 'IMPORT_PROJECT_SUCCESS'; payload: Project }
  | { type: 'SET_UPLOADED_IMAGE'; payload: { base64: string; type: string } }
  | { type: 'CLEAR_UPLOADED_IMAGE' };

const initialState: AppState = {
  isInitializing: true,
  isAiLoading: false,
  projects: [],
  activeProjectId: null,
  activeFileId: null,
  error: null,
  isImportModalOpen: false,
  isNewProjectModalOpen: false,
  uploadedImageBase64: null,
  uploadedImageType: null,
};

const AppReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INITIALIZE_SUCCESS':
      return { ...state, isInitializing: false };
    case 'START_AI_GENERATION':
      return { ...state, isAiLoading: true, error: null };
    case 'AI_GENERATION_SUCCESS':
    case 'IMPORT_PROJECT_SUCCESS':
      const newProject = action.payload;
      const existingProjectIndex = state.projects.findIndex(p => p.id === newProject.id);
      const newProjects = [...state.projects];
      if (existingProjectIndex > -1) {
        newProjects[existingProjectIndex] = newProject;
      } else {
        newProjects.unshift(newProject);
      }
      return {
        ...state,
        isAiLoading: false,
        projects: newProjects,
        activeProjectId: newProject.id,
        activeFileId: newProject.files.find(f => f.path.toLowerCase().includes('index.html'))?.id || newProject.files[0]?.id || null,
      };
    case 'AI_GENERATION_FAILURE':
      return { ...state, isAiLoading: false, error: action.payload };
    case 'SELECT_PROJECT':
      const selectedProject = state.projects.find(p => p.id === action.payload);
      return {
        ...state,
        activeProjectId: action.payload,
        activeFileId: selectedProject?.files.find(f => f.path.toLowerCase().includes('index.html'))?.id || selectedProject?.files[0]?.id || null,
      };
    case 'SELECT_FILE':
      return { ...state, activeFileId: action.payload };
    case 'UPDATE_FILE_CONTENT': {
        const { fileId, content } = action.payload;
        if (!state.activeProjectId) return state;
        return {
            ...state,
            projects: state.projects.map(p => 
                p.id === state.activeProjectId 
                ? { ...p, files: p.files.map(f => f.id === fileId ? { ...f, content } : f) }
                : p
            )
        };
    }
    case 'DELETE_PROJECT':
      const remainingProjects = state.projects.filter(p => p.id !== action.payload);
      const newActiveProjectId = state.activeProjectId === action.payload ? (remainingProjects[0]?.id || null) : state.activeProjectId;
      const newActiveProject = remainingProjects.find(p => p.id === newActiveProjectId);
      return {
          ...state,
          projects: remainingProjects,
          activeProjectId: newActiveProjectId,
          activeFileId: newActiveProject?.files[0]?.id || null,
      };
    case 'RENAME_PROJECT': {
        const { projectId, newName } = action.payload;
        return {
            ...state,
            projects: state.projects.map(p => p.id === projectId ? { ...p, name: newName } : p),
        };
    }
    case 'DELETE_FILE': {
        if (!state.activeProjectId) return state;
        const newProjectsState = state.projects.map(p => {
            if (p.id === state.activeProjectId) {
                const newFiles = p.files.filter(f => f.id !== action.payload);
                return { ...p, files: newFiles };
            }
            return p;
        });
        const newActiveFileId = state.activeFileId === action.payload ? newProjectsState.find(p => p.id === state.activeProjectId)?.files[0]?.id || null : state.activeFileId;
        return {
            ...state,
            projects: newProjectsState,
            activeFileId: newActiveFileId
        };
    }
    case 'RENAME_FILE': {
        const { fileId, newPath } = action.payload;
        if (!state.activeProjectId) return state;
        return {
            ...state,
            projects: state.projects.map(p =>
                p.id === state.activeProjectId
                ? { ...p, files: p.files.map(f => f.id === fileId ? { ...f, path: newPath } : f) }
                : p
            )
        };
    }
    case 'ADD_PROJECT':
       return {
         ...state,
         projects: [action.payload, ...state.projects],
         activeProjectId: action.payload.id,
         activeFileId: action.payload.files[0]?.id || null,
       };
    case 'OPEN_IMPORT_MODAL':
      return { ...state, isImportModalOpen: true };
    case 'CLOSE_IMPORT_MODAL':
      return { ...state, isImportModalOpen: false };
    case 'OPEN_NEW_PROJECT_MODAL':
        return { ...state, isNewProjectModalOpen: true };
    case 'CLOSE_NEW_PROJECT_MODAL':
        return { ...state, isNewProjectModalOpen: false };
    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImageBase64: action.payload.base64, uploadedImageType: action.payload.type };
    case 'CLEAR_UPLOADED_IMAGE':
      return { ...state, uploadedImageBase64: null, uploadedImageType: null };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  actions: {
    submitPrompt: (prompt: string) => Promise<void>;
    createNewProject: (name: string, description: string) => Promise<void>;
    selectProject: (projectId: string) => void;
    selectFile: (fileId: string) => void;
    deleteProject: (projectId: string) => void;
    renameProject: (projectId: string, newName: string) => void;
    deleteFile: (fileId: string) => void;
    renameFile: (fileId: string, newPath: string) => void;
    downloadProject: () => void;
    openImportModal: () => void;
    closeImportModal: () => void;
    importProjectFromUrl: (url: string) => Promise<void>;
    openNewProjectModal: () => void;
    closeNewProjectModal: () => void;
    importFromDevice: () => Promise<void>;
    setUploadedImage: (payload: { base64: string; type: string }) => void;
    clearUploadedImage: () => void;
  };
} | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  useEffect(() => {
    setTimeout(() => {
      dispatch({ type: 'INITIALIZE_SUCCESS' });
    }, 500);
  }, []);

  const actions = {
    submitPrompt: async (prompt: string) => {
      const activeProject = state.projects.find(p => p.id === state.activeProjectId);
      if (!activeProject) {
        alert("Please select a project before submitting a modification prompt.");
        return;
      }
      dispatch({ type: 'START_AI_GENERATION' });
      try {
        const newProject = await generateProjectFromPrompt(prompt, activeProject, state.uploadedImageBase64, state.uploadedImageType);
        dispatch({ type: 'AI_GENERATION_SUCCESS', payload: newProject });
      } catch (e: any) {
        dispatch({ type: 'AI_GENERATION_FAILURE', payload: e.message });
      } finally {
        dispatch({ type: 'CLEAR_UPLOADED_IMAGE' });
      }
    },
    createNewProject: async (name: string, description: string) => {
      dispatch({ type: 'START_AI_GENERATION' });
      dispatch({ type: 'CLOSE_NEW_PROJECT_MODAL' });
       try {
        const newProject = await generateProjectFromPrompt(description, null, state.uploadedImageBase64, state.uploadedImageType, name);
        dispatch({ type: 'AI_GENERATION_SUCCESS', payload: newProject });
      } catch (e: any) {
        dispatch({ type: 'AI_GENERATION_FAILURE', payload: e.message });
      } finally {
        dispatch({ type: 'CLEAR_UPLOADED_IMAGE' });
      }
    },
    selectProject: (projectId: string) => {
      dispatch({ type: 'SELECT_PROJECT', payload: projectId });
    },
    selectFile: (fileId: string) => {
      dispatch({ type: 'SELECT_FILE', payload: fileId });
    },
    deleteProject: (projectId: string) => {
        if(window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            dispatch({ type: 'DELETE_PROJECT', payload: projectId });
        }
    },
    renameProject: (projectId: string, currentName: string) => {
        const newName = window.prompt("Enter new project name:", currentName);
        if (newName && newName.trim() !== "") {
            dispatch({ type: 'RENAME_PROJECT', payload: { projectId, newName } });
        }
    },
    deleteFile: (fileId: string) => {
        if(window.confirm("Are you sure you want to delete this file?")) {
            dispatch({ type: 'DELETE_FILE', payload: fileId });
        }
    },
    renameFile: (fileId: string, currentPath: string) => {
        const newPath = window.prompt("Enter new file path/name:", currentPath);
        if (newPath && newPath.trim() !== "") {
            dispatch({ type: 'RENAME_FILE', payload: { fileId, newPath } });
        }
    },
    downloadProject: async () => {
        const activeProject = state.projects.find(p => p.id === state.activeProjectId);
        if (!activeProject) return;

        const zip = new JSZip();
        activeProject.files.forEach(file => {
            zip.file(file.path, file.content);
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activeProject.name.replace(/ /g, '_')}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    },
    openImportModal: () => dispatch({ type: 'OPEN_IMPORT_MODAL' }),
    closeImportModal: () => dispatch({ type: 'CLOSE_IMPORT_MODAL' }),
    openNewProjectModal: () => dispatch({ type: 'OPEN_NEW_PROJECT_MODAL' }),
    closeNewProjectModal: () => dispatch({ type: 'CLOSE_NEW_PROJECT_MODAL' }),
    importProjectFromUrl: async (url: string) => {
      dispatch({ type: 'START_AI_GENERATION' });
      try {
        const project = await importFromGitHub(url);
        dispatch({ type: 'IMPORT_PROJECT_SUCCESS', payload: project });
      } catch (e: any) {
         dispatch({ type: 'AI_GENERATION_FAILURE', payload: e.message });
      } finally {
        dispatch({ type: 'CLOSE_IMPORT_MODAL' });
      }
    },
     importFromDevice: async () => {
        if (!('showDirectoryPicker' in window)) {
            alert('Your browser does not support the File System Access API. Please try a modern browser like Chrome or Edge.');
            return;
        }

        try {
            const directoryHandle = await window.showDirectoryPicker();
            dispatch({ type: 'START_AI_GENERATION' }); // Use the AI spinner for loading indication

            const processEntry = async (entry: FileSystemHandle, currentPath: string): Promise<File[]> => {
                if (entry.kind === 'file') {
                    const file = await (entry as FileSystemFileHandle).getFile();
                    const content = await file.text();
                    return [{ id: `file-${Date.now()}-${Math.random()}`, path: `${currentPath}${entry.name}`, content }];
                }
                if (entry.kind === 'directory') {
                    const files: File[] = [];
                    for await (const handle of (entry as FileSystemDirectoryHandle).values()) {
                        const nestedFiles = await processEntry(handle, `${currentPath}${entry.name}/`);
                        files.push(...nestedFiles);
                    }
                    return files;
                }
                return [];
            };

            const allFiles: File[] = [];
            for await (const entry of directoryHandle.values()) {
                allFiles.push(...await processEntry(entry, ''));
            }

            const project: Project = {
                id: `proj-${Date.now()}`,
                name: directoryHandle.name,
                files: allFiles,
            };

            dispatch({ type: 'IMPORT_PROJECT_SUCCESS', payload: project });

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error importing from device:', error);
                dispatch({ type: 'AI_GENERATION_FAILURE', payload: 'Failed to import directory.' });
            }
        }
    },
    setUploadedImage: (payload: { base64: string; type: string }) => {
        dispatch({ type: 'SET_UPLOADED_IMAGE', payload });
    },
    clearUploadedImage: () => {
        dispatch({ type: 'CLEAR_UPLOADED_IMAGE' });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
