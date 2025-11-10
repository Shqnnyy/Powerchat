import React, { useEffect } from 'react';
import { ModelIcon, LogoutIcon, CloseIcon } from './icons';
import { createRipple } from '../utils/uiUtils';

interface CompatibleModel {
    id: string;
    name: string;
    description: string;
    family: string;
}

interface WebLLMSidebarProps {
    selectedModel: CompatibleModel;
    availableModels: CompatibleModel[];
    onSelectModel: (model: CompatibleModel) => void;
    onReset: () => void;
    isMobileOpen: boolean;
    onClose: () => void;
}

export const WebLLMSidebar: React.FC<WebLLMSidebarProps> = ({ selectedModel, availableModels, onSelectModel, onReset, isMobileOpen, onClose }) => {

    useEffect(() => {
        if (!isMobileOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMobileOpen, onClose]);

    const handleModelSelect = (model: CompatibleModel) => {
        onSelectModel(model);
        onClose();
    };

    const sidebarContent = (
        <>
            <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8"><ModelIcon /></div>
                    <h1 className="text-xl font-bold text-text-primary">WebLLM</h1>
                </div>
                <button onClick={onClose} className="md:hidden p-1 -mr-1 rounded-full text-text-secondary hover:bg-[var(--background-hover)]">
                    <CloseIcon />
                </button>
            </div>

            <div className="mb-4 p-3 bg-background-primary rounded-lg h-24 flex flex-col justify-center animate-fade-in-fast">
                <h2 className="text-sm font-bold text-text-primary mb-1">{selectedModel.name}</h2>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedModel.description}</p>
            </div>

            <nav className="flex-grow space-y-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-2">Models</p>
                {availableModels.map((model) => (
                    <button
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        onMouseDown={createRipple}
                        className={`btn-ripple w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-3 ${
                            selectedModel.id === model.id
                                ? 'bg-accent-primary text-white'
                                : 'text-text-primary hover:bg-[var(--background-hover)]'
                        }`}
                    >
                        <ModelIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{model.name}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-[var(--border-primary)] space-y-2">
                <button
                    onClick={onReset}
                    onMouseDown={createRipple}
                    className="btn-ripple w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-3 bg-accent-danger text-white hover:bg-accent-danger-hover"
                >
                    <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Exit Chat</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside 
                className="hidden md:flex w-60 h-screen flex-col bg-[#141414] p-4 flex-shrink-0"
                style={{ 
                    paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', 
                    paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' 
                }}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed inset-0 z-40 transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black" onClick={onClose} />
                <aside 
                    className={`relative z-50 w-60 h-full bg-[#141414] p-4 flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ 
                        paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', 
                        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' 
                    }}
                >
                    {sidebarContent}
                </aside>
            </div>
        </>
    );
};