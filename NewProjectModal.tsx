
import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { X, Loader, PlusSquare } from 'lucide-react';

export const NewProjectModal: React.FC = () => {
    const { actions, state } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || state.isAiLoading) return;
        actions.createNewProject(name, description || `A simple project called ${name}`);
    };

    return (
        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-pane rounded-xl p-6 w-full max-w-lg relative glow-shadow">
                <button onClick={actions.closeNewProjectModal} className="absolute top-3 right-3 p-1 text-medium-text hover:text-light-text">
                    <X size={20}/>
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <PlusSquare className="text-primary" size={24}/>
                    <h2 className="text-xl font-bold">Create New Project</h2>
                </div>
                <p className="text-medium-text text-sm mb-6">
                    Give your project a name and an optional description. The AI will use the description to generate the initial project files.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="project-name" className="block text-sm font-semibold mb-1.5 text-light-text">Project Name</label>
                        <input
                            id="project-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., My Awesome Portfolio"
                            className="w-full bg-dark-bg border border-dark-border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-light-text"
                            required
                        />
                    </div>
                    <div>
                         <label htmlFor="project-description" className="block text-sm font-semibold mb-1.5 text-light-text">Description (Initial Prompt)</label>
                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., A personal portfolio website with a blog, built with React and Tailwind CSS."
                            className="w-full bg-dark-bg border border-dark-border rounded-md p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-light-text"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!name.trim() || state.isAiLoading}
                        className="w-full bg-primary text-dark-bg font-bold py-3 rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                         {state.isAiLoading ? <Loader className="animate-spin" size={20}/> : 'Create with AI'}
                    </button>
                </form>
            </div>
        </div>
    );
};