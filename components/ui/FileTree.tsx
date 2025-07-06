
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, FileJson, FileCode, FileImage, FileLock, Pencil, Trash2 } from 'lucide-react';

const getFileIcon = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.jsx') || path.endsWith('.js')) return <FileCode size={14} />;
    if (path.endsWith('.json')) return <FileJson size={14} />;
    if (path.endsWith('.html') || path.endsWith('.css')) return <FileText size={14} />;
    if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.svg')) return <FileImage size={14} />;
    if (path.endsWith('.md')) return <FileLock size={14} />; // Using lock for README
    return <FileText size={14} />;
};

export const FileTree: React.FC = () => {
    const { state, actions } = useAppContext();
    const activeProject = state.projects.find(p => p.id === state.activeProjectId);

    if (!activeProject) {
        return null;
    }

    return (
        <div className="space-y-1">
            {activeProject.files.map(file => (
                <div
                    key={file.id}
                    onClick={() => actions.selectFile(file.id)}
                    className={`group flex items-center justify-between gap-2 py-1 px-2 rounded-md cursor-pointer text-sm transition-colors ${state.activeFileId === file.id ? 'bg-primary/20 text-primary font-semibold' : 'text-medium-text hover:bg-dark-pane hover:text-light-text'}`}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(file.path)}
                        <span className="truncate">{file.path}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                         <button onClick={(e) => { e.stopPropagation(); actions.renameFile(file.id, file.path); }} className="p-1 text-medium-text hover:text-blue-400">
                            <Pencil size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); actions.deleteFile(file.id); }} className="p-1 text-medium-text hover:text-red-500">
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
