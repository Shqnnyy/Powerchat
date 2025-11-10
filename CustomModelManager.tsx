import React, { useState, useEffect } from 'react';
import { CloseIcon, PlusIcon, LoaderIcon, TrashIcon } from './icons';
import { createRipple } from '../utils/uiUtils';

interface CustomModelManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const LOCAL_STORAGE_KEY = 'custom_webllm_models';

export const CustomModelManager: React.FC<CustomModelManagerProps> = ({ isOpen, onClose }) => {
    const [models, setModels] = useState<string[]>([]);
    const [newModelId, setNewModelId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            try {
                const storedModels = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (storedModels) {
                    setModels(JSON.parse(storedModels));
                }
            } catch (error) {
                console.error("Failed to parse custom models from localStorage", error);
                setModels([]);
            }
            setIsLoading(false);

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    const handleAddModel = () => {
        const trimmedId = newModelId.trim();
        if (!trimmedId) {
            setError("Model ID cannot be empty.");
            return;
        }
        if (models.includes(trimmedId)) {
            setError("This model has already been added.");
            return;
        }

        setError(null);
        
        // Skip verification and add the model directly.
        // The model loading process in HuggingFaceChatApp will handle any errors if the ID is invalid.
        const updatedModels = [...models, trimmedId];
        setModels(updatedModels);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedModels));
        setNewModelId('');
    };

    const handleDeleteModel = (modelToDelete: string) => {
        const updatedModels = models.filter(m => m !== modelToDelete);
        setModels(updatedModels);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedModels));
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-[var(--background-primary)] bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
            onClick={onClose}
            style={{ 
                paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', 
                paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
                paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
                paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
            }}
        >
            <div className="bg-background-primary border border-border-primary rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Custom WebLLM Models</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-tertiary">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-grow">
                    <p className="text-sm text-text-secondary mb-6">
                        Add compatible WebLLM models from the MLC organization on Hugging Face. The 'Model ID' is the repository name, like <code className="bg-background-tertiary text-text-primary rounded px-1.5 py-0.5 text-xs font-mono">Llama-3-8B-Instruct-q4f16_1-MLC</code>. This allows you to use a wide range of models, including experimental or uncensored versions. If the ID is invalid, an error will occur when you try to load the model.
                        <a href="https://huggingface.co/mlc-ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-2">
                            Find Models on Hugging Face &rarr;
                        </a>
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                        <div className="flex-grow relative bg-[#141414] rounded-xl border border-zinc-700 transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-accent-primary">
                            <input
                                type="text"
                                value={newModelId}
                                onChange={(e) => {
                                    setNewModelId(e.target.value);
                                    if (error) setError(null);
                                }}
                                placeholder="e.g., Llama-3-8B-Instruct-q4f16_1-MLC"
                                className="w-full p-2 bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAddModel}
                            disabled={!newModelId.trim()}
                            onMouseDown={createRipple}
                            className="btn-ripple px-4 py-2 sm:w-32 flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" /> Add
                        </button>
                    </div>
                     {error && <p className="text-xs text-red-400 mb-6 px-1">{error}</p>}

                    <h3 className="text-lg font-semibold my-4">Your Custom Models</h3>
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-24">
                                <LoaderIcon className="w-8 h-8" />
                            </div>
                        ) : models.length > 0 ? (
                            models.map(model => (
                                <div key={model} className="flex justify-between items-center bg-background-secondary p-3 rounded-lg animate-fade-in-fast">
                                    <p className="text-sm font-mono truncate text-text-primary mr-4" title={model}>{model}</p>
                                    <button
                                        onClick={() => handleDeleteModel(model)}
                                        onMouseDown={createRipple}
                                        className="btn-ripple p-2 rounded-md bg-accent-danger-bg text-accent-danger-text hover:bg-accent-danger hover:text-white border border-accent-danger-border transition-all"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-text-secondary py-8 text-sm">You haven't added any custom models yet.</p>
                        )}
                    </div>
                </main>
                 <footer className="p-4 border-t border-border-primary flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        onMouseDown={createRipple}
                        className="btn-ripple px-6 py-2 rounded-lg bg-background-tertiary text-text-primary font-semibold hover:bg-[var(--background-hover)] transition-colors"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};