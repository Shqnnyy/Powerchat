import React, { useRef, ChangeEvent, useEffect, useState } from 'react';
import { UploadFileIcon, CloseIcon, PaperclipIcon, MicIcon, StopIcon, LoaderIcon, GearIcon, ArrowUpIcon } from './icons';
import { UploadedFile, AIMode, AIProvider, WebLLMSettings } from '../types';
import { AdvancedSettings } from './AdvancedSettings';
import { createRipple } from '../utils/uiUtils';

interface InputBarProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onSendMessage: () => void;
    onFileUpload: (file: File) => void;
    isLoading: boolean;
    uploadedFile: UploadedFile | null;
    clearUploadedFile: () => void;
    selectedMode: AIMode;
    onSelectMode: (mode: AIMode) => void;
    provider: AIProvider;
    isLiveSessionActive: boolean;
    isConnecting: boolean;
    onToggleLiveSession: () => void;
    webLLMSettings?: WebLLMSettings;
    onWebLLMSettingsChange?: (newSettings: Partial<WebLLMSettings>) => void;
}

export const InputBar: React.FC<InputBarProps> = ({ 
    prompt,
    setPrompt,
    onSendMessage, 
    onFileUpload, 
    isLoading, 
    uploadedFile, 
    clearUploadedFile,
    selectedMode,
    onSelectMode,
    provider,
    isLiveSessionActive,
    isConnecting,
    onToggleLiveSession,
    webLLMSettings,
    onWebLLMSettingsChange,
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const settingsContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() || uploadedFile) {
            onSendMessage();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
        e.target.value = '';
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsContainerRef.current && !settingsContainerRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowSettings(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const isInputDisabled = isLoading || isLiveSessionActive || isConnecting;

    return (
        <footer 
            className="p-2 sm:p-4 bg-transparent sticky bottom-0"
            style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
             {uploadedFile && (
                <div className="mb-2 p-2 bg-background-secondary rounded-lg flex items-center justify-between animate-fade-in max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <PaperclipIcon />
                        <span className="truncate text-sm text-text-secondary">{uploadedFile.name}</span>
                    </div>
                    <button onClick={clearUploadedFile} className="p-1 rounded-full hover:bg-background-tertiary">
                        <CloseIcon />
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                 <div 
                    className="relative w-full bg-[#141414] rounded-3xl shadow-2xl border border-zinc-700 transition-colors hover:bg-zinc-900"
                >
                    <div onMouseDown={createRipple} className="btn-ripple absolute inset-0 rounded-3xl overflow-hidden"></div>
                    <div className="relative z-10 p-2 sm:p-3 flex items-end gap-2 pointer-events-none">
                        <div className="flex items-center gap-1 pointer-events-auto">
                            {provider === AIProvider.LOCAL_AI && onWebLLMSettingsChange && webLLMSettings && (
                                <div ref={settingsContainerRef} className="relative z-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowSettings(prev => !prev)}
                                        onMouseDown={createRipple}
                                        disabled={isInputDisabled}
                                        className="btn-ripple p-2 rounded-full text-text-primary bg-background-tertiary/50 hover:bg-background-tertiary disabled:opacity-50 transition-colors"
                                        aria-label="Advanced Settings"
                                    >
                                        <GearIcon />
                                    </button>
                                    {showSettings && (
                                        <AdvancedSettings settings={webLLMSettings} onSettingsChange={onWebLLMSettingsChange} />
                                    )}
                                </div>
                            )}
                        
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,video/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                onMouseDown={createRipple}
                                disabled={isInputDisabled}
                                className="btn-ripple p-2 rounded-full text-green-500 bg-background-tertiary/50 hover:bg-background-tertiary disabled:opacity-50 transition-colors"
                                aria-label="Upload file"
                            >
                                <UploadFileIcon />
                            </button>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                isLiveSessionActive ? "Live session is active..." :
                                isConnecting ? "Connecting to live session..." :
                                `Message ${provider}...`
                            }
                            rows={1}
                            className="flex-grow bg-transparent border-none text-base text-text-primary placeholder-text-tertiary px-2 py-2.5 focus:outline-none focus:ring-0 resize-none transition-all max-h-48 pointer-events-auto"
                            onKeyDown={(e) => {
                                if ((e.key === 'Enter' && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
                                    handleSubmit(e);
                                }
                            }}
                            disabled={isInputDisabled}
                        />
                        {selectedMode === AIMode.LIVE_CONVERSATION ? (
                            <button
                                type="button"
                                onClick={onToggleLiveSession}
                                onMouseDown={createRipple}
                                disabled={isLoading}
                                className={`btn-ripple p-3 rounded-full text-white transition-colors self-end pointer-events-auto ${
                                    isConnecting ? 'bg-yellow-500 animate-pulse' :
                                    isLiveSessionActive ? 'bg-accent-danger hover:bg-accent-danger-hover' :
                                    'bg-accent-primary hover:bg-accent-primary-hover'
                                }`}
                                aria-label={isLiveSessionActive ? "Stop live session" : "Start live session"}
                            >
                            {isConnecting ? <LoaderIcon /> : isLiveSessionActive ? <StopIcon /> : <MicIcon />}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                onMouseDown={createRipple}
                                disabled={isInputDisabled || (!prompt.trim() && !uploadedFile)}
                                className="btn-ripple w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors self-end pointer-events-auto"
                                aria-label="Send message"
                            >
                            <ArrowUpIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </footer>
    );
};