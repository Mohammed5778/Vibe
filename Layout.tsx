
import React from 'react';
import { useResponsive } from './useResponsive';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { useAppContext } from './AppContext';
import { Spinner } from './Spinner';
import { ImportProjectModal } from './ImportProjectModal';
import { NewProjectModal } from './NewProjectModal';
import { AlertTriangle } from 'lucide-react';

export const Layout: React.FC = () => {
  const { isMobile } = useResponsive();
  const { state } = useAppContext();

  return (
    <div className="h-screen w-screen bg-dark-bg text-light-text font-sans flex flex-col p-2 md:p-4 gap-4 relative">
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      
      {state.isAiLoading && (
        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Spinner size="lg" />
          <p className="mt-4 text-lg text-primary animate-pulse">Vibing with the AI...</p>
        </div>
      )}

      {state.error && (
        <div className="absolute bottom-20 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-2xl flex items-center gap-4 z-50">
          <AlertTriangle size={24} />
          <div>
            <h3 className="font-bold">An error occurred</h3>
            <p className="text-sm">{state.error}</p>
          </div>
        </div>
      )}
      {state.isImportModalOpen && <ImportProjectModal />}
      {state.isNewProjectModalOpen && <NewProjectModal />}
    </div>
  );
};