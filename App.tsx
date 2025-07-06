
import React from 'react';
import { Layout } from './Layout';
import { Spinner } from './Spinner';
import { useAppContext } from './AppContext';

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
    
    return <Layout />;
};

export default App;