
import React, { useState } from 'react';
import { ResizablePanel } from '../panels/ResizablePanel';
import { Sidebar } from '../panels/Sidebar';
import { EditorPanel } from '../panels/EditorPanel';
import { PreviewPanel } from '../panels/PreviewPanel';
import { PromptBar } from '../PromptBar';
import { ImageUploadPreview } from '../ui/ImageUploadPreview';

export const DesktopLayout: React.FC = () => {
  const [sidebarSize, setSidebarSize] = useState(20);
  const [editorPreviewSize, setEditorPreviewSize] = useState(60);

  const toggleSidebar = () => setSidebarSize(prev => prev > 0 ? 0 : 20);
  const toggleEditor = () => setEditorPreviewSize(prev => prev > 0 ? 0 : 60);
  const togglePreview = () => setEditorPreviewSize(prev => prev < 100 ? 100 : 60);

  const mainContent = (
    <ResizablePanel
      size={editorPreviewSize}
      onResize={setEditorPreviewSize}
      minSize={0}
      maxSize={100}
      leftPanel={<EditorPanel />}
      rightPanel={<PreviewPanel />}
      leftPanelCollapse={{ onCollapse: toggleEditor, isCollapsed: editorPreviewSize === 0 }}
      rightPanelCollapse={{ onCollapse: togglePreview, isCollapsed: editorPreviewSize === 100 }}
    />
  );

  return (
    <>
      <main className="flex-grow flex gap-4 min-h-0">
        <ResizablePanel
          size={sidebarSize}
          onResize={setSidebarSize}
          minSize={0}
          maxSize={40}
          leftPanel={<Sidebar />}
          rightPanel={mainContent}
          leftPanelCollapse={{ onCollapse: toggleSidebar, isCollapsed: sidebarSize === 0, direction: 'left' }}
        />
      </main>
      <footer className="flex-shrink-0">
        <ImageUploadPreview />
        <PromptBar />
      </footer>
    </>
  );
};
