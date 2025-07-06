
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { X } from 'lucide-react';

export const ImageUploadPreview: React.FC = () => {
    const { state, actions } = useAppContext();

    if (!state.uploadedImageBase64 || !state.uploadedImageType) {
        return null;
    }

    return (
        <div className="bg-dark-pane p-2 rounded-lg flex items-center justify-between mb-2 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <img src={`data:${state.uploadedImageType};base64,${state.uploadedImageBase64}`} alt="Image Preview" className="w-10 h-10 object-cover rounded" />
                <span className="text-sm text-light-text font-sans">Image ready for prompt</span>
            </div>
            <button onClick={actions.clearUploadedImage} className="p-1 text-medium-text hover:text-red-400">
                <X size={18} />
            </button>
        </div>
    );
};
