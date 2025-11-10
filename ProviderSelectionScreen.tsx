// components/ProviderSelectionScreen.tsx: The initial screen for selecting an AI provider.
import React from 'react';
import { AIProvider, UploadedFile, User, AIMode } from '../types';
import { GeminiLogo, OpenAILogo, AnthropicLogo, CohereLogo, ArrowUpIcon, PaperclipIcon, CloseIcon, MenuIcon, ChevronDownIcon, PlusIcon, ModelIcon, ServerIcon, InfoIcon, LogoutIcon, SparklesIcon } from './icons';
import { createRipple } from '../utils/uiUtils';
import { fileToBase64 } from '../utils/fileUtils';
import { CustomModelManager } from './CustomModelManager';
import { ProfileDropdown } from './ProfileDropdown';
import { PROVIDER_MODES } from '../modes';

interface ProviderSelectionScreenProps {
    user: User;
    onGoToSettings: () => void;
    onGoToSavedChats: () => void;
    onSelectProvider: (provider: AIProvider) => void;
    onStartChat: (prompt: string, provider: AIProvider, file: UploadedFile | null, mode: AIMode) => void;
    onLogout: () => void;
}

const providers = [
    { id: AIProvider.GEMINI, name: 'Gemini', logo: <GeminiLogo className="w-5 h-5" /> },
    { id: AIProvider.OPENAI, name: 'ChatGPT', logo: <OpenAILogo className="w-5 h-5" /> },
    { id: AIProvider.ANTHROPIC, name: 'Anthropic', logo: <AnthropicLogo className="w-5 h-5" /> },
    { id: AIProvider.COHERE, name: 'Cohere', logo: <CohereLogo className="w-5 h-5" /> },
    { id: AIProvider.FREE_AI, name: 'Free Models', logo: <SparklesIcon className="w-5 h-5 text-yellow-400" /> },
];

const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-background-primary z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
        <div className="bg-[#141414] rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">About PowerChat</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-background-tertiary">
                    <CloseIcon />
                </button>
            </div>
            <div className="text-sm text-text-secondary space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <p><strong>PowerChat</strong> is a powerful, privacy-focused AI chat interface designed to run entirely in your browser. It acts as a client-side application to connect you with various AI models without needing a backend server.</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong>Bring Your Own Keys:</strong> Securely connect to cloud providers like Gemini, OpenAI, Anthropic, and Cohere. Your API keys are stored only in your browser's local storage.</li>
                    <li><strong>Local & On-Device AI:</strong> Chat with models running on your local server via Ollama or directly on your device with WebLLM for complete privacy and offline access.</li>
                    <li><strong>Multi-Modal:</strong> Interact with AI using text, images, and video. Generate and edit images, understand video content, and have live voice conversations.</li>
                    <li><strong>No Account Needed:</strong> Get started instantly. No sign-up, no tracking, just direct access to powerful AI.</li>
                </ul>
                <p className="mt-6">Your conversations and credentials never leave your machine or pass through our servers. You are in full control.</p>
            </div>
        </div>
    </div>
);

export const ProviderSelectionScreen: React.FC<ProviderSelectionScreenProps> = ({ user, onGoToSettings, onGoToSavedChats, onSelectProvider, onStartChat, onLogout }) => {
    const [prompt, setPrompt] = React.useState('');
    const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>(AIProvider.GEMINI);
    const [uploadedFile, setUploadedFile] = React.useState<UploadedFile | null>(null);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isAboutOpen, setIsAboutOpen] = React.useState(false);
    const [isModelManagerOpen, setIsModelManagerOpen] = React.useState(false);
    const [isProviderMenuOpen, setIsProviderMenuOpen] = React.useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
    const [detectedMode, setDetectedMode] = React.useState<AIMode | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const providerMenuRef = React.useRef<HTMLDivElement>(null);
    const profileDropdownRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (providerMenuRef.current && !providerMenuRef.current.contains(event.target as Node)) {
                setIsProviderMenuOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    React.useEffect(() => {
        const lowerCasePrompt = prompt.toLowerCase().trim();
        if (!lowerCasePrompt) {
            setDetectedMode(null);
            return;
        }

        const availableModes = PROVIDER_MODES[selectedProvider].map(m => m.mode);
        let newMode: AIMode | null = null;
        
        const imageKeywords = ['image of', 'picture of', 'photo of', 'drawing of', 'illustration of', 'logo for', 'generate an image', 'create an image', 'draw a', 'render a', 'a painting of', 'build image', 'create image'];
        const artisticKeywords = ['artistic', 'surreal', 'abstract', 'masterpiece', 'creative interpretation'];

        if (imageKeywords.some(k => lowerCasePrompt.includes(k))) {
            if (artisticKeywords.some(k => lowerCasePrompt.includes(k)) && availableModes.includes(AIMode.ARTISTIC_GEN)) {
                newMode = AIMode.ARTISTIC_GEN;
            } else if (availableModes.includes(AIMode.IMAGE_GEN)) {
                newMode = AIMode.IMAGE_GEN;
            }
        }
        
        setDetectedMode(newMode);

    }, [prompt, selectedProvider]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() || uploadedFile) {
            onStartChat(prompt.trim(), selectedProvider, uploadedFile, detectedMode || AIMode.CHAT);
        }
    };

    const handleFileUpload = React.useCallback(async (file: File) => {
        const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
        if (!fileType) {
            alert('Unsupported file type. Please upload an image or video.');
            return;
        }

        const base64Data = await fileToBase64(file);
        const objectUrl = URL.createObjectURL(file);
        
        setUploadedFile({
            name: file.name,
            type: fileType,
            mimeType: file.type,
            data: base64Data,
            url: objectUrl,
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
        e.target.value = '';
    };

    const clearUploadedFile = React.useCallback(() => {
        if (uploadedFile) {
            URL.revokeObjectURL(uploadedFile.url);
            setUploadedFile(null);
        }
    }, [uploadedFile]);

    const hasContent = !!prompt.trim() || !!uploadedFile;
    const placeholderText = detectedMode 
        ? `Switched to ${detectedMode} mode...`
        : `Ask ${selectedProvider} to create...`;

    return (
        <div 
            className="w-full min-h-screen flex flex-col items-center justify-center text-text-primary p-4 pt-40 bg-background-primary transition-colors relative"
            style={{ paddingTop: 'calc(10rem + env(safe-area-inset-top, 0px))' }}
        >
            <CustomModelManager isOpen={isModelManagerOpen} onClose={() => setIsModelManagerOpen(false)} />
            {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
            
            <header 
                className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-30 flex justify-between items-center"
                style={{ 
                    paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', 
                    paddingLeft: 'calc(1.5rem + env(safe-area-inset-left, 0px))', 
                    paddingRight: 'calc(1.5rem + env(safe-area-inset-right, 0px))'
                }}
            >
                <h1 className="text-xl sm:text-2xl font-bold">PowerChat</h1>
                <div className="flex items-center gap-2">
                     <div ref={profileDropdownRef} className="relative z-50">
                        <button
                            onClick={() => setIsProfileDropdownOpen(p => !p)}
                            onMouseDown={createRipple}
                            className="btn-ripple flex items-center gap-2 pl-2 pr-2 sm:pr-4 py-1.5 rounded-full bg-background-secondary hover:bg-background-tertiary transition-colors"
                            aria-label="Open Profile Menu"
                        >
                            <img src={user.avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
                            <span className="hidden sm:inline text-lg font-bold">{user.name}</span>
                        </button>
                        {isProfileDropdownOpen && (
                            <ProfileDropdown 
                                onGoToSettings={() => { onGoToSettings(); setIsProfileDropdownOpen(false); }}
                                onGoToSavedChats={() => { onGoToSavedChats(); setIsProfileDropdownOpen(false); }}
                                onLogout={() => { onLogout(); setIsProfileDropdownOpen(false); }}
                            />
                        )}
                     </div>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        onMouseDown={createRipple}
                        className="btn-ripple flex items-center gap-2 pl-3 pr-4 py-1.5 text-lg font-bold rounded-full bg-background-secondary hover:bg-background-tertiary transition-colors"
                        aria-label="Open menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                        <span className="hidden sm:inline">Menu</span>
                    </button>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in-fast" onClick={() => setIsMenuOpen(false)}>
                    <div 
                        className="bg-background-secondary w-full max-w-2xl mx-auto mt-24 rounded-2xl shadow-2xl p-4 sm:p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Menu</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full hover:bg-background-tertiary">
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-text-secondary mb-3 px-2">Local Models</h3>
                                    <div className="space-y-2">
                                        <button onClick={() => { onSelectProvider(AIProvider.HUGGING_FACE); setIsMenuOpen(false); }} onMouseDown={createRipple} className="btn-ripple w-full flex items-center gap-4 p-4 bg-[#141414] rounded-xl border border-zinc-700 hover:border-accent-primary transition-all">
                                            <ModelIcon className="w-8 h-8 flex-shrink-0" />
                                            <div className="text-left">
                                                <p className="font-semibold">WebLLM</p>
                                                <p className="text-xs text-text-secondary">On-Device AI. Supports custom &amp; uncensored models.</p>
                                            </div>
                                        </button>
                                        <button onClick={() => { onSelectProvider(AIProvider.OLLAMA); setIsMenuOpen(false); }} onMouseDown={createRipple} className="btn-ripple w-full flex items-center gap-4 p-4 bg-[#141414] rounded-xl border border-zinc-700 hover:border-accent-primary transition-all">
                                            <ServerIcon className="w-8 h-8 flex-shrink-0" />
                                            <div className="text-left">
                                                <p className="font-semibold">Ollama</p>
                                                <p className="text-xs text-text-secondary">Local Server. Run any model, including uncensored.</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-text-secondary mb-3 px-2">App</h3>
                                <div className="space-y-2">
                                    <button onClick={() => { setIsAboutOpen(true); setIsMenuOpen(false); }} onMouseDown={createRipple} className="btn-ripple w-full text-left px-3 py-3 text-sm font-medium rounded-md transition-colors text-text-primary hover:bg-[var(--background-hover)] flex items-center gap-3">
                                        <InfoIcon className="w-5 h-5 flex-shrink-0" /> About PowerChat
                                    </button>
                                    <button onClick={onLogout} onMouseDown={createRipple} className="btn-ripple w-full text-left px-3 py-3 text-sm font-medium rounded-md transition-colors text-accent-danger-text hover:bg-accent-danger/20 flex items-center gap-3">
                                        <LogoutIcon className="w-5 h-5 flex-shrink-0" /> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <main className="w-full max-w-2xl flex-grow flex flex-col justify-center items-center z-10">
                <div className={`text-center mb-10 transition-opacity duration-300 ${hasContent ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100'}`}>
                    <p className="text-xl text-text-secondary mb-2">Connect to your own AI models. No server. No account.</p>
                    <p className="text-lg text-text-tertiary mt-2 max-w-xl mx-auto">
                        Your keys, your models, your data. A private, powerful, and versatile chat experience that runs entirely in your browser.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="w-full">
                    <div 
                        className="relative w-full bg-[#141414] rounded-3xl shadow-2xl border border-zinc-700 transition-colors hover:bg-zinc-900"
                        onMouseDown={createRipple}
                    >
                        <div className="btn-ripple absolute inset-0 rounded-3xl overflow-hidden"></div>
                        <div className="relative z-10 p-3 sm:p-4 flex flex-col space-y-3">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={placeholderText}
                                rows={3}
                                className="w-full bg-transparent text-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-0 resize-none"
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' && !e.shiftKey) && (prompt.trim() || uploadedFile)) {
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            {uploadedFile && (
                                <div className="p-2 bg-background-secondary/50 rounded-lg flex items-center justify-between animate-fade-in">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <PaperclipIcon className="w-4 h-4" />
                                        <span className="truncate text-sm text-text-secondary">{uploadedFile.name}</span>
                                    </div>
                                    <button type="button" onClick={clearUploadedFile} className="p-1 rounded-full hover:bg-background-tertiary">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,video/*"
                                    />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} onMouseDown={createRipple} className="btn-ripple p-2 sm:px-3 flex items-center justify-center gap-2 rounded-full bg-background-tertiary/50 hover:bg-background-tertiary transition-colors text-sm" aria-label="Attach file">
                                        <PaperclipIcon className="w-4 h-4 text-green-500" />
                                        <span className="hidden sm:inline">Attach</span>
                                    </button>
                                    <button type="button" onClick={() => setIsModelManagerOpen(true)} onMouseDown={createRipple} className="btn-ripple p-2 sm:px-3 flex items-center justify-center gap-2 rounded-full bg-background-tertiary/50 hover:bg-background-tertiary transition-colors text-sm" aria-label="Add custom model">
                                        <PlusIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Add Model</span>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div ref={providerMenuRef} className="relative z-50">
                                        <button
                                            type="button"
                                            onClick={() => setIsProviderMenuOpen(prev => !prev)}
                                            onMouseDown={createRipple}
                                            className="btn-ripple pl-3 pr-2 py-2 flex items-center justify-center gap-2 rounded-full bg-[#0d0c0c] text-white hover:bg-[#1a1a1a] transition-colors text-sm"
                                            aria-label="Select Cloud Model"
                                        >
                                            {providers.find(p => p.id === selectedProvider)?.logo}
                                            <span className="font-medium">{selectedProvider}</span>
                                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isProviderMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isProviderMenuOpen && (
                                            <div className="absolute bottom-full mb-2 right-0 w-56 bg-[#141414] rounded-lg shadow-lg p-2 animate-fade-in-fast max-h-60 overflow-y-auto custom-scrollbar">
                                                {providers.map(provider => (
                                                    <button
                                                        key={provider.id}
                                                        onClick={() => {
                                                            setSelectedProvider(provider.id);
                                                            setIsProviderMenuOpen(false);
                                                        }}
                                                        onMouseDown={createRipple}
                                                        className="btn-ripple w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors text-text-primary hover:bg-[var(--background-hover)] flex items-center gap-3"
                                                    >
                                                        {provider.logo}
                                                        <span>{provider.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!prompt.trim() && !uploadedFile}
                                        onMouseDown={createRipple}
                                        className="btn-ripple w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Send message"
                                    >
                                        <ArrowUpIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="flex-grow min-h-[2rem]"></div>
            </main>
        </div>
    );
};