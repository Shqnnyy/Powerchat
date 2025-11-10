import React, { useRef, ChangeEvent, useEffect, useState } from 'react';
import { UploadFileIcon, SendIcon, CloseIcon, PaperclipIcon, SparklesIcon, MicIcon, StopIcon, LoaderIcon, GearIcon } from './icons';
import { UploadedFile, AIMode, AIProvider, WebLLMSettings } from '../types';
import { ModeSelector } from './ModeSelector';
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
    const [showModes, setShowModes] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modeSelectorContainerRef = useRef<HTMLDivElement>(null);
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
            if (modeSelectorContainerRef.current && !modeSelectorContainerRef.current.contains(event.target as Node)) {
                setShowModes(false);
            }
            if (settingsContainerRef.current && !settingsContainerRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);
    
    const handleModeSelect = (mode: AIMode) => {
        onSelectMode(mode);
        setShowModes(false);
    };

    const isInputDisabled = isLoading || isLiveSessionActive || isConnecting;

    return (
        <footer className="p-4 bg-transparent sticky bottom-0">
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
                <div className="w-full flex items-end gap-2 p-2 bg-[var(--input-background)] rounded-2xl shadow-lg transition-colors">
                    <div className="flex items-center gap-1">
                        <div ref={modeSelectorContainerRef} className="relative">
                             <button
                                type="button"
                                onClick={() => setShowModes(prev => !prev)}
                                onMouseDown={createRipple}
                                disabled={isInputDisabled}
                                className="btn-ripple p-2 rounded-full text-text-primary bg-background-secondary hover:bg-accent-primary disabled:opacity-50 transition-colors"
                                aria-label="Select AI Mode"
                            >
                                <SparklesIcon />
                            </button>
                            {showModes && (
                                <ModeSelector provider={provider} selectedMode={selectedMode} onSelectMode={handleModeSelect} />
                            )}
                        </div>

                        {provider === AIProvider.LOCAL_AI && onWebLLMSettingsChange && webLLMSettings && (
                            <div ref={settingsContainerRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowSettings(prev => !prev)}
                                    onMouseDown={createRipple}
                                    disabled={isInputDisabled}
                                    className="btn-ripple p-2 rounded-full text-text-primary bg-background-secondary hover:bg-accent-primary disabled:opacity-50 transition-colors"
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
                            className="btn-ripple p-2 rounded-full text-text-primary bg-background-secondary hover:bg-accent-primary disabled:opacity-50 transition-colors"
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
                            `Message ${provider}... (Mode: ${selectedMode})`
                        }
                        rows={1}
                        className="flex-grow bg-transparent border-none text-text-primary placeholder-text-secondary rounded-lg p-2 focus:outline-none focus:ring-0 resize-none transition-all max-h-48"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
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
                            className={`btn-ripple p-3 rounded-full text-white transition-colors self-end ${
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
                            className="btn-ripple p-3 rounded-full text-white bg-accent-primary hover:bg-accent-primary-hover disabled:bg-background-secondary disabled:cursor-not-allowed transition-colors self-end"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    )}
                </div>
            </form>
        </footer>
    );
};