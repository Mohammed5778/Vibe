
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SendHorizontal, Sparkles, ImagePlus } from 'lucide-react';

export const PromptBar: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const { actions, state } = useAppContext();
    const isProjectActive = !!state.activeProjectId;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isProjectActive || (!prompt.trim() && !state.uploadedImageBase64) || state.isAiLoading) return;
        actions.submitPrompt(prompt);
        setPrompt('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            actions.setUploadedImage({ base64: base64String, type: file.type });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; 
    };

    return (
        <form onSubmit={handleSubmit} className="glass-pane rounded-xl p-2.5 flex items-center gap-2 glow-shadow w-full">
            <label htmlFor="image-upload" className={`cursor-pointer p-2 rounded-lg transition-colors ${isProjectActive ? 'text-medium-text hover:text-primary' : 'text-dark-text cursor-not-allowed'}`}>
                <ImagePlus size={24} />
            </label>
            <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={!isProjectActive || state.isAiLoading} />
            
            <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                type="text"
                placeholder={isProjectActive ? "Describe a change or upload a new design..." : "Create or import a project to start."}
                className="w-full bg-transparent focus:outline-none text-light-text placeholder-medium-text text-lg"
                disabled={!isProjectActive || state.isAiLoading}
            />
            <button
                type="submit"
                className="bg-primary p-3 rounded-lg text-dark-bg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={!isProjectActive || state.isAiLoading || (!prompt.trim() && !state.uploadedImageBase64)}
            >
                <SendHorizontal className="w-6 h-6" />
            </button>
        </form>
    );
};