
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';
import { Code2, Download, Save } from 'lucide-react';

export const EditorPanel: React.FC = () => {
  const { state, actions, dispatch } = useAppContext();
  
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  const activeFile = activeProject?.files.find(f => f.id === state.activeFileId);
  const activeFileContent = activeFile?.content;
  
  const [displayedContent, setDisplayedContent] = useState(activeFileContent || '');
  const isAiUpdating = useRef(false);

  useEffect(() => {
    // When AI starts, flag it.
    if (state.isAiLoading) {
      isAiUpdating.current = true;
    }
    // When file changes, snap content immediately
    if (activeFileContent !== undefined && activeFileContent !== displayedContent && !state.isAiLoading) {
        // If AI was just updating, start the typing animation
        if (isAiUpdating.current) {
            isAiUpdating.current = false;
            let i = 0;
            const timer = setInterval(() => {
                if (i < activeFileContent.length) {
                    setDisplayedContent(prev => activeFileContent.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 5); // Typing speed
            return () => clearInterval(timer);
        } else {
            // Otherwise, it's a file switch, so snap to content
            setDisplayedContent(activeFileContent);
        }
    } else if (activeFileContent === undefined) {
      setDisplayedContent('');
    }
  }, [activeFileContent, state.isAiLoading]);

  // Handle snapping to new file content when the activeFileId changes
  useEffect(() => {
      setDisplayedContent(activeFile?.content || '');
  }, [activeFile?.id]);


  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isAiUpdating.current) return; // Don't allow user input during AI typing animation
    const newContent = e.target.value;
    setDisplayedContent(newContent); // Update local state for immediate feedback
    if (!activeFile) return;
    dispatch({ 
        type: 'UPDATE_FILE_CONTENT', 
        payload: { fileId: activeFile.id, content: newContent } 
    });
  };

  return (
    <div className="glass-pane rounded-xl h-full flex flex-col font-mono text-sm">
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-dark-border">
        <div className="flex items-center gap-2 text-medium-text">
          <Code2 size={18} className="text-primary"/>
          <span className="font-sans font-semibold">{activeFile?.path || 'No file selected'}</span>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={actions.downloadProject}
                disabled={!activeProject}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-dark-pane hover:bg-dark-border border border-dark-border rounded-md text-medium-text hover:text-light-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Download entire project as .zip"
            >
                <Download size={14} />
                Download
            </button>
        </div>
      </header>
      <div className="flex-grow overflow-hidden relative">
        {activeFile ? (
            <textarea
                key={activeFile.id}
                value={displayedContent}
                onChange={handleContentChange}
                className="w-full h-full bg-transparent text-light-text p-4 resize-none leading-relaxed focus:outline-none"
                placeholder="File content goes here..."
                spellCheck="false"
            />
        ) : (
            <div className="flex items-center justify-center h-full text-medium-text font-sans">
                <p>Select a file to begin editing or create a new project.</p>
            </div>
        )}
      </div>
    </div>
  );
};