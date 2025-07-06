
import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { Github, X, Loader } from 'lucide-react';

export const ImportProjectModal: React.FC = () => {
    const { actions, state } = useAppContext();
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!url.trim() || state.isAiLoading) return;
        actions.importProjectFromUrl(url);
    };

    return (
        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-pane rounded-xl p-6 w-full max-w-lg relative glow-shadow">
                <button onClick={actions.closeImportModal} className="absolute top-3 right-3 p-1 text-medium-text hover:text-light-text">
                    <X size={20}/>
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <Github className="text-primary" size={24}/>
                    <h2 className="text-xl font-bold">Import from GitHub</h2>
                </div>
                <p className="text-medium-text text-sm mb-6">
                    Enter the URL of a public GitHub repository to import its files. The import will be handled via a public CDN.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://github.com/username/repository"
                        className="w-full bg-dark-bg border border-dark-border rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light-text"
                        required
                    />
                    <button
                        type="submit"
                        disabled={!url.trim() || state.isAiLoading}
                        className="w-full bg-primary text-dark-bg font-bold py-3 rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                         {state.isAiLoading ? <Loader className="animate-spin" size={20}/> : 'Import Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};