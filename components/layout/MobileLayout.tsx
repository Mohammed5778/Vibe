
import React, { useState } from 'react';
import { Sidebar } from '../panels/Sidebar';
import { EditorPanel } from '../panels/EditorPanel';
import { PreviewPanel } from '../panels/PreviewPanel';
import { PromptBar } from '../PromptBar';
import { Menu, X, Code, Eye } from 'lucide-react';
import { ImageUploadPreview } from '../ui/ImageUploadPreview';

type MobileView = 'code' | 'preview';

export const MobileLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<MobileView>('preview');

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-30" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Panel */}
      <div className={`absolute top-0 left-0 h-full w-3/4 max-w-sm z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full p-2">
            <Sidebar />
          </div>
      </div>

      <header className="flex-shrink-0 flex justify-between items-center bg-dark-pane p-2 rounded-lg">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-medium-text hover:text-light-text">
          <Menu size={24} />
        </button>
        <div className="flex items-center bg-dark-bg p-1 rounded-md">
          <button 
            onClick={() => setActiveView('code')}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1.5 transition-colors ${activeView === 'code' ? 'bg-primary/20 text-primary' : 'text-medium-text'}`}
          >
            <Code size={16} /> Code
          </button>
          <button 
            onClick={() => setActiveView('preview')}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1.5 transition-colors ${activeView === 'preview' ? 'bg-primary/20 text-primary' : 'text-medium-text'}`}
          >
            <Eye size={16} /> Preview
          </button>
        </div>
         <div className="w-8"></div>
      </header>

      <main className="flex-grow min-h-0">
        {activeView === 'code' ? <EditorPanel /> : <PreviewPanel />}
      </main>

      <footer className="flex-shrink-0">
        <ImageUploadPreview />
        <PromptBar />
      </footer>
    </>
  );
};
