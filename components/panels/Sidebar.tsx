
import React, { useRef, ChangeEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileTree } from '../ui/FileTree';
import { Zap, GitBranch, Github, Trash2, Import, Pencil, PlusSquare, FolderDown } from 'lucide-react';

// Allow 'webkitdirectory' on input elements for folder uploads.
declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string;
  }
}


export const Sidebar: React.FC = () => {
  const { state, actions } = useAppContext();
  const importDeviceInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceImportClick = () => {
    importDeviceInputRef.current?.click();
  };

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      actions.importFromDevice(e.target.files);
    }
    // Reset input to allow importing the same folder again
    e.target.value = '';
  };

  return (
    <div className="glass-pane rounded-xl h-full flex flex-col p-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Zap className="text-primary" size={24}/>
            <h1 className="text-xl font-bold text-light-text">Nova Lab</h1>
        </div>
      </div>
      
      <input
        type="file"
        ref={importDeviceInputRef}
        onChange={handleFilesSelected}
        className="hidden"
        webkitdirectory=""
        multiple
      />

      <div className="flex flex-col gap-2 mb-4">
        <button onClick={actions.openNewProjectModal} className="w-full flex items-center justify-center gap-2 bg-primary/90 text-dark-bg hover:bg-primary border border-dark-border rounded-md px-3 py-2 text-sm font-semibold transition-colors">
            <PlusSquare size={16} /> New Project
        </button>
        <div className="flex gap-2">
            <button onClick={actions.openImportModal} className="w-full flex items-center justify-center gap-2 bg-dark-pane hover:bg-dark-border border border-dark-border rounded-md px-3 py-2 text-sm font-semibold transition-colors">
                <Github size={16} /> Import URL
            </button>
            <button onClick={handleDeviceImportClick} className="w-full flex items-center justify-center gap-2 bg-dark-pane hover:bg-dark-border border border-dark-border rounded-md px-3 py-2 text-sm font-semibold transition-colors">
                <FolderDown size={16} /> Import Device
            </button>
        </div>
      </div>

      <h2 className="text-sm font-bold text-medium-text px-1 mb-2">PROJECTS</h2>
      <div className="flex-grow overflow-y-auto pr-1">
        {state.projects.length === 0 && (
            <div className="text-center text-medium-text text-xs py-4">
                No projects yet. Create a new one to get started!
            </div>
        )}
        {state.projects.map(project => (
          <div
            key={project.id}
            onClick={() => actions.selectProject(project.id)}
            className={`group rounded-md mb-1 cursor-pointer transition-all duration-200 ${state.activeProjectId === project.id ? 'bg-primary/10' : 'hover:bg-dark-pane'}`}
          >
            <div className={`flex items-center justify-between p-2 rounded-t-md ${state.activeProjectId === project.id ? 'text-primary' : 'text-light-text'}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <GitBranch size={16} className={`${state.activeProjectId === project.id ? 'text-primary' : 'text-medium-text'} flex-shrink-0`}/>
                    <span className="font-semibold text-sm truncate">{project.name}</span>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); actions.renameProject(project.id, project.name); }} className="p-1 text-medium-text hover:text-blue-400">
                        <Pencil size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); actions.deleteProject(project.id); }} className="p-1 text-medium-text hover:text-red-500">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            {state.activeProjectId === project.id && (
              <div className="pb-1 px-1">
                <FileTree />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
