
import React, { useMemo, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Smartphone } from 'lucide-react';
import { Project } from '../../types';

const createPreviewHtml = (project: Project | undefined): string => {
    if (!project) {
        return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-family: sans-serif; color: #8b949e;">Select a project to see the preview.</div>';
    }

    let htmlFile = project.files.find(f => f.path.toLowerCase() === 'index.html');
    if(!htmlFile) {
      htmlFile = project.files.find(f => f.path.endsWith('.html'));
    }

    if (!htmlFile) {
        return '<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-family: sans-serif; color: #8b949e;">No HTML file found in this project to preview.</div>';
    }

    let processedHtml = htmlFile.content;

    // Inline CSS
    const cssRegex = /<link\s+.*?href=["'](?!https?:\/\/)(.*?)["'].*?>/g;
    processedHtml = processedHtml.replace(cssRegex, (match, path) => {
        const cssFile = project.files.find(f => f.path === path.replace(/^\.\//, ''));
        return cssFile ? `<style>${cssFile.content}</style>` : match;
    });

    // Inline JS
    const jsRegex = /<script\s+.*?src=["'](?!https?:\/\/)(.*?)["'].*?><\/script>/g;
    processedHtml = processedHtml.replace(jsRegex, (match, path) => {
        const jsFile = project.files.find(f => f.path === path.replace(/^\.\//, ''));
        return jsFile ? `<script>${jsFile.content}</script>` : match;
    });

    return processedHtml;
};


export const PreviewPanel: React.FC = () => {
    const { state } = useAppContext();
    const [debouncedContent, setDebouncedContent] = useState('');

    const activeProject = state.projects.find(p => p.id === state.activeProjectId);

    const previewContent = useMemo(() => {
        return createPreviewHtml(activeProject);
    }, [activeProject]);

    // Debounce the iframe update to prevent lag while typing in the editor
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedContent(previewContent);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [previewContent]);


    return (
        <div className="glass-pane rounded-xl h-full flex flex-col">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-dark-border">
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-medium-text font-sans">Live Preview</div>
                <Smartphone size={18} className="text-medium-text" />
            </header>
            <div className="flex-grow p-1 bg-white rounded-b-xl overflow-hidden">
                <iframe
                    key={activeProject?.id}
                    title="Live Preview"
                    srcDoc={debouncedContent}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0"
                />
            </div>
        </div>
    );
};
