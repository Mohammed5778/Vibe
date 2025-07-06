
import React from 'react';
import { Layout } from './components/Layout';
import { Spinner } from './components/ui/Spinner';
import { useAppContext } from './context/AppContext';
import { AlertTriangle, Settings } from 'lucide-react';

const ApiKeyMissingScreen = () => (
    <div className="h-screen w-screen flex items-center justify-center bg-dark-bg p-4">
        <div className="glass-pane rounded-xl p-8 max-w-2xl text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h1 className="text-2xl font-bold text-red-400 mb-2">Configuration Error</h1>
            <h2 className="text-lg font-semibold text-light-text mb-4">Gemini API Key is Missing</h2>
            <p className="text-medium-text mb-6">
                The application cannot connect to the AI service because the API key has not been configured. If you are the developer, please add it to your environment variables.
            </p>
            <div className="bg-dark-bg text-left p-4 rounded-lg font-mono text-sm text-medium-text">
                <p className="flex items-center gap-2"><Settings size={16} className="text-primary"/> <strong>Vercel Deployment:</strong></p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Go to your Vercel Project Settings.</li>
                    <li>Navigate to the "Environment Variables" section.</li>
                    <li>Create a new variable named <code className="bg-primary/20 text-primary px-1 py-0.5 rounded">API_KEY</code>.</li>
                    <li>Paste your Gemini API key as the value.</li>
                    <li>Redeploy the project for the changes to take effect.</li>
                </ol>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
    const { state } = useAppContext();

    if (state.isInitializing) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark-bg">
                <Spinner size="lg" />
                <p className="mt-4 text-primary">Initializing Nova Lab...</p>
            </div>
        );
    }
    
    if (state.isApiKeyMissing) {
        return <ApiKeyMissingScreen />;
    }
    
    return <Layout />;
};

export default App;