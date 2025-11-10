// ChatApp.tsx: The main chat application component.
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { InputBar } from './components/InputBar';
import { ChatInterface } from './components/ChatInterface';
import { ChatMessage, UploadedFile, AIMode, AIProvider, WebLLMSettings, SavedChatSession, User } from './types';
import { fileToBase64, extractFramesFromVideo } from './utils/fileUtils';
import * as aiService from './services/aiService';
import { useGeolocation } from './hooks/useGeolocation';
import { initialize as initializeLocalAI } from './services/localAiService';
import { LocalAIIcon, MenuIcon, ModelIcon, SparklesIcon } from './components/icons';
import { Session, LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData } from './utils/audioUtils';
import { ModeSelector } from './components/ModeSelector';
import { VeoApiKeyModal } from './components/VeoApiKeyModal';
import { PromptsLibrary } from './components/PromptsLibrary';
import { createRipple } from './utils/uiUtils';
import { ProfileDropdown } from './components/ProfileDropdown';
import { PROVIDER_MODES } from './modes';

interface ChatAppProps {
    apiKey: string;
    provider: AIProvider;
    user: User;
    onGoToSettings: () => void;
    onGoToSavedChats: () => void;
    onLogout: () => void;
    onReset: () => void;
    initialPrompt: string | null;
    setInitialPrompt: (prompt: string | null) => void;
    initialFile: UploadedFile | null;
    setInitialFile: (file: UploadedFile | null) => void;
    initialMode: AIMode | null;
    setInitialMode: (mode: AIMode | null) => void;
    initialSession: SavedChatSession | null;
    setInitialSession: (session: SavedChatSession | null) => void;
}

const MAX_VIDEO_FRAMES = 10;

export const ChatApp: React.FC<ChatAppProps> = memo(({ 
    apiKey, 
    provider, 
    user,
    onGoToSettings,
    onGoToSavedChats,
    onLogout,
    onReset,
    initialPrompt,
    setInitialPrompt,
    initialFile,
    setInitialFile,
    initialMode,
    setInitialMode,
    initialSession,
    setInitialSession,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialSession?.messages || []);
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(initialFile);
    const [selectedMode, setSelectedMode] = useState<AIMode>(initialSession?.mode || initialMode || AIMode.CHAT);
    const [showPrompts, setShowPrompts] = useState(false);
    const { location, error: geoError, getLocation } = useGeolocation();
    
    // State for Local AI initialization
    const [isLocalAiInitializing, setIsLocalAiInitializing] = useState(provider === AIProvider.LOCAL_AI || provider === AIProvider.FREE_AI);
    const [localAiInitMessage, setLocalAiInitMessage] = useState('Initializing On-Device AI...');
    const [webLLMSettings, setWebLLMSettings] = useState<WebLLMSettings>({ temperature: 0.7, topP: 0.9 });
    
    // State for Live Conversation
    const liveSessionRef = useRef<Session | null>(null);
    const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    
    // State for TTS
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const [ttsState, setTtsState] = useState<{ messageId: string; status: 'loading' | 'playing' | 'idle' }>({ messageId: '', status: 'idle' });
    
    // State for Live Audio Playback
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    
    // State for Local Server
    const [localServerModel, setLocalServerModel] = useState<string>('llama3');

    // UI State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    
    const userSelectedMode = useRef<AIMode>(initialSession?.mode || initialMode || AIMode.CHAT);
    const messagesRef = useRef(messages);
    messagesRef.current = messages;
    const uploadedFileRef = useRef(uploadedFile);
    uploadedFileRef.current = uploadedFile;
    const promptsContainerRef = useRef<HTMLDivElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (promptsContainerRef.current && !promptsContainerRef.current.contains(event.target as Node)) {
                setShowPrompts(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowPrompts(false);
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const saveSession = useCallback(() => {
        if (messagesRef.current.length === 0 || messagesRef.current.every(m => m.isLoading)) {
            return;
        }

        const firstUserMessage = messagesRef.current.find(m => m.role === 'user' && m.text);
        const title = firstUserMessage?.text?.substring(0, 50).trim() || `Chat with ${provider}`;

        const newSession: SavedChatSession = {
            id: initialSession?.id || Date.now().toString(),
            title: title,
            provider,
            mode: selectedMode,
            messages: messagesRef.current.filter(m => !m.isLoading && !m.isError),
            timestamp: Date.now(),
        };

        try {
            const stored = localStorage.getItem('saved_chat_sessions');
            const sessions: SavedChatSession[] = stored ? JSON.parse(stored) : [];
            const existingIndex = sessions.findIndex(s => s.id === newSession.id);
            if (existingIndex > -1) {
                sessions[existingIndex] = newSession;
            } else {
                sessions.push(newSession);
            }
            sessions.sort((a, b) => b.timestamp - a.timestamp);
            const limitedSessions = sessions.slice(0, 20);
            localStorage.setItem('saved_chat_sessions', JSON.stringify(limitedSessions));
        } catch (e) {
            console.error("Failed to save session:", e);
        }
    }, [provider, selectedMode, initialSession]);

    const sendMessage = useCallback(async (messageText: string, fileToUpload: UploadedFile | null) => {
        if (isLoading || isLocalAiInitializing || (!messageText.trim() && !fileToUpload)) return;

        setIsLoading(true);
        const userMessageId = Date.now().toString();
        const modelMessageId = (Date.now() + 1).toString();
        
        const userMessage: ChatMessage = {
            id: userMessageId,
            role: 'user',
            text: messageText,
            imageUrl: fileToUpload?.type === 'image' ? fileToUpload.url : undefined,
            videoUrl: fileToUpload?.type === 'video' ? fileToUpload.url : undefined,
            base64Data: fileToUpload?.type === 'image' ? fileToUpload.data : undefined,
            mimeType: fileToUpload?.type === 'image' ? fileToUpload.mimeType : undefined,
        };
        
        const loadingMessage: ChatMessage = { id: modelMessageId, role: 'model', isLoading: true };
        
        setMessages(prev => [...prev, userMessage, loadingMessage]);
        
        setPrompt('');

        try {
            if ([AIMode.IMAGE_GEN, AIMode.ARTISTIC_GEN].includes(selectedMode)) {
                const response = await aiService.generateImage(provider, apiKey, messageText, selectedMode);
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, ...response, isLoading: false } : msg));
            } else if (selectedMode === AIMode.IMAGE_EDITING && fileToUpload?.type === 'image') {
                const response = await aiService.editImage(provider, apiKey, messageText, {
                    mimeType: fileToUpload.mimeType, data: fileToUpload.data,
                });
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, ...response, isLoading: false } : msg));
            } else if (selectedMode === AIMode.VIDEO_UNDERSTANDING && fileToUpload?.type === 'video') {
                const frames = await extractFramesFromVideo(fileToUpload.url, MAX_VIDEO_FRAMES);
                const response = await aiService.analyzeVideo(provider, apiKey, messageText, frames);
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, ...response, isLoading: false } : msg));
            } else {
                const history = [...messagesRef.current, userMessage].filter(m => !m.isError && !m.isLoading);
                const responseStream = aiService.streamChatResponse(
                    provider, apiKey, history, selectedMode, location,
                    provider === AIProvider.LOCAL_AI || provider === AIProvider.FREE_AI ? webLLMSettings : undefined,
                    provider === AIProvider.OLLAMA ? localServerModel : undefined
                );

                let firstChunk = true;
                for await (const chunk of responseStream) {
                    if (firstChunk) {
                        setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: chunk.text || '', groundingLinks: chunk.groundingLinks, isLoading: false } : msg));
                        firstChunk = false;
                    } else {
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === modelMessageId) {
                                return { ...msg, text: (msg.text || '') + (chunk.text || ''), groundingLinks: chunk.groundingLinks || msg.groundingLinks };
                            }
                            return msg;
                        }));
                    }
                }
            }
        } catch (err: any) {
             const errorMessage = err.message || 'An unknown error occurred.';
             setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: errorMessage, isLoading: false, isError: true } : msg));
             if (errorMessage.includes("API key")) {
                 alert("API Key is invalid or expired. Please check your key in Settings.");
             }
        } finally {
            setIsLoading(false);
            if(fileToUpload) {
                setUploadedFile(null);
            }
        }
    }, [isLoading, isLocalAiInitializing, selectedMode, provider, apiKey, location, webLLMSettings, localServerModel]);

    const handleSendMessage = useCallback(() => {
        sendMessage(prompt, uploadedFile);
    }, [sendMessage, prompt, uploadedFile]);
    
    const handleResetAndSave = useCallback(() => {
        saveSession();
        onReset();
    }, [saveSession, onReset]);

    // Initialize audio player and handle initial prompt
    useEffect(() => {
        audioPlayerRef.current = new Audio();
        audioPlayerRef.current.onended = () => {
            setTtsState(s => ({ ...s, status: 'idle' }));
        };
        outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

        if ((initialPrompt || initialFile) && !initialSession) {
            sendMessage(initialPrompt || '', initialFile);
            setInitialPrompt(null);
            setInitialFile(null);
            setInitialMode(null);
        }

        if (initialSession) {
            setInitialSession(null);
        }
        
        return () => {
             saveSession();
             liveSessionRef.current?.close();
             outputAudioContextRef.current?.close();

            // Cleanup object URLs to prevent memory leaks
            messagesRef.current.forEach(msg => {
                if (msg.imageUrl && msg.imageUrl.startsWith('blob:')) URL.revokeObjectURL(msg.imageUrl);
                if (msg.videoUrl && msg.videoUrl.startsWith('blob:')) URL.revokeObjectURL(msg.videoUrl);
                if (msg.audioUrl && msg.audioUrl.startsWith('blob:')) URL.revokeObjectURL(msg.audioUrl);
            });
            if (uploadedFileRef.current && uploadedFileRef.current.url.startsWith('blob:')) {
                URL.revokeObjectURL(uploadedFileRef.current.url);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (provider === AIProvider.LOCAL_AI || provider === AIProvider.FREE_AI) {
            const init = async () => {
                try {
                    await initializeLocalAI(setLocalAiInitMessage);
                    setIsLocalAiInitializing(false);
                } catch (err) {
                    setLocalAiInitMessage("Failed to load the on-device AI model. It may not be supported by your browser or a network error occurred. Please refresh and try again.");
                }
            };
            init();
        }
    }, [provider]);

    useEffect(() => {
        if (selectedMode === AIMode.MAPS && !location) {
            getLocation();
        }
    }, [selectedMode, location, getLocation]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const lowerCasePrompt = prompt.toLowerCase().trim();
            if (isLiveSessionActive || isConnecting) return;

            // If prompt is cleared, revert to the user's last manually selected mode.
            if (!lowerCasePrompt && !uploadedFile) {
                if (selectedMode !== userSelectedMode.current) {
                    setSelectedMode(userSelectedMode.current);
                }
                return;
            }

            const availableModes = PROVIDER_MODES[provider].map(m => m.mode);

            if (uploadedFile) {
                if (uploadedFile.type === 'image') {
                    const editKeywords = ['edit', 'change', 'add', 'remove', 'make', 'turn', 'apply'];
                    if (editKeywords.some(k => lowerCasePrompt.includes(k)) && availableModes.includes(AIMode.IMAGE_EDITING)) {
                        if (selectedMode !== AIMode.IMAGE_EDITING) setSelectedMode(AIMode.IMAGE_EDITING);
                    } else {
                        if (selectedMode !== AIMode.IMAGE_UNDERSTANDING && availableModes.includes(AIMode.IMAGE_UNDERSTANDING)) {
                            setSelectedMode(AIMode.IMAGE_UNDERSTANDING);
                        }
                    }
                }
                return;
            }
            
            let newMode: AIMode | null = null;
            const imageKeywords = ['image of', 'picture of', 'photo of', 'drawing of', 'illustration of', 'logo for', 'generate an image', 'create an image', 'draw a', 'render a', 'a painting of'];
            const artisticKeywords = ['artistic', 'surreal', 'abstract', 'masterpiece', 'creative interpretation'];
            const searchKeywords = ['search for', 'what is the latest', 'news about', 'who won'];
            const mapsKeywords = ['near me', 'nearby', 'find places', 'directions to', 'where is'];
            const thinkingKeywords = ['solve', 'code for', 'python script', 'javascript function', 'what are the implications', 'debug this', 'write a function'];
            
            if (imageKeywords.some(k => lowerCasePrompt.startsWith(k))) {
                if (artisticKeywords.some(k => lowerCasePrompt.includes(k)) && availableModes.includes(AIMode.ARTISTIC_GEN)) {
                    newMode = AIMode.ARTISTIC_GEN;
                } else if (availableModes.includes(AIMode.IMAGE_GEN)) {
                    newMode = AIMode.IMAGE_GEN;
                }
            } else if (searchKeywords.some(k => lowerCasePrompt.startsWith(k)) && availableModes.includes(AIMode.SEARCH)) {
                newMode = AIMode.SEARCH;
            } else if (mapsKeywords.some(k => lowerCasePrompt.includes(k)) && availableModes.includes(AIMode.MAPS)) {
                newMode = AIMode.MAPS;
            } else if (thinkingKeywords.some(k => lowerCasePrompt.includes(k)) && availableModes.includes(AIMode.THINKING)) {
                newMode = AIMode.THINKING;
            }

            if (newMode && newMode !== selectedMode) {
                setSelectedMode(newMode);
            } else if (!newMode && selectedMode !== userSelectedMode.current) {
                setSelectedMode(userSelectedMode.current);
            }
        }, 300); // Debounce
        return () => clearTimeout(handler);
    }, [prompt, provider, uploadedFile, isLiveSessionActive, isConnecting, selectedMode]);

    const handleWebLLMSettingsChange = useCallback((newSettings: Partial<WebLLMSettings>) => {
        setWebLLMSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const handleFileUpload = useCallback(async (file: File) => {
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

        // Default to understanding, useEffect can refine to editing.
        if (fileType === 'image' && ![AIMode.IMAGE_EDITING, AIMode.IMAGE_UNDERSTANDING].includes(selectedMode)) {
            setSelectedMode(AIMode.IMAGE_UNDERSTANDING);
        }
        if (fileType === 'video' && selectedMode !== AIMode.VIDEO_UNDERSTANDING) {
             setSelectedMode(AIMode.VIDEO_UNDERSTANDING);
        }
    }, [selectedMode]);

    const clearUploadedFile = useCallback(() => {
        if (uploadedFile) {
            URL.revokeObjectURL(uploadedFile.url);
            setUploadedFile(null);
            if ([AIMode.IMAGE_UNDERSTANDING, AIMode.VIDEO_UNDERSTANDING, AIMode.IMAGE_EDITING].includes(selectedMode)) {
                setSelectedMode(userSelectedMode.current);
            }
        }
    }, [uploadedFile, selectedMode]);
    
    const handlePlayTTS = useCallback(async (messageId: string, text: string) => {
        if (!audioPlayerRef.current) return;

        const existingMessage = messages.find(m => m.id === messageId);
        if (existingMessage?.audioUrl) {
            audioPlayerRef.current.src = existingMessage.audioUrl;
            audioPlayerRef.current.play();
            setTtsState({ messageId, status: 'playing' });
            return;
        }

        setTtsState({ messageId, status: 'loading' });
        try {
            const base64Audio = await aiService.generateTTS(provider, apiKey, text);
            const audioBytes = decode(base64Audio);
            const audioBlob = new Blob([audioBytes], { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);

            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioUrl } : m));
            
            audioPlayerRef.current.src = audioUrl;
            audioPlayerRef.current.play();
            setTtsState({ messageId, status: 'playing' });
        } catch (error) {
            console.error("TTS Error:", error);
            setTtsState({ messageId, status: 'idle' });
            alert("Failed to generate audio.");
        }
    }, [messages, provider, apiKey]);
    
    const handleToggleLiveSession = useCallback(async () => {
        if (isConnecting) return;

        if (isLiveSessionActive) {
            liveSessionRef.current?.close();
        } else {
            setIsConnecting(true);
            try {
                let currentInput = "";
                let currentOutput = "";

                const onMessage = async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        source.addEventListener('ended', () => audioQueueRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioQueueRef.current.add(source);
                    }
                    if (message.serverContent?.inputTranscription) {
                        currentInput += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutput += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        if(currentInput || currentOutput){
                            const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: currentInput };
                            const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: currentOutput };
                            setMessages(prev => [...prev, userMsg, modelMsg]);
                        }
                        currentInput = "";
                        currentOutput = "";
                    }
                };

                const session = await aiService.startLiveSession(
                    AIProvider.GEMINI,
                    apiKey,
                    onMessage,
                    (err) => { console.error("Live session error:", err); setIsLiveSessionActive(false); setIsConnecting(false); },
                    () => { console.log("Live session closed."); setIsLiveSessionActive(false); setIsConnecting(false); }
                );
                liveSessionRef.current = session;
                setIsConnecting(false);
                setIsLiveSessionActive(true);
                setMessages([]);
            } catch (error) {
                console.error("Failed to start live session:", error);
                alert("Could not start live session. Please ensure microphone permissions are granted and check the console.");
                setIsConnecting(false);
            }
        }
    }, [isLiveSessionActive, isConnecting, apiKey]);

    const handleSelectPrompt = useCallback((selectedPrompt: string) => {
        setShowPrompts(false);
        sendMessage(selectedPrompt, uploadedFile);
    }, [sendMessage, uploadedFile]);
    
    const handleModeSelection = useCallback((mode: AIMode) => {
        if(isLiveSessionActive) return;
        
        if (mode === AIMode.LIVE_CONVERSATION && provider !== AIProvider.GEMINI) {
            alert("Live Conversation mode is only available for the Gemini provider.");
            return;
        }

        userSelectedMode.current = mode;
        setSelectedMode(mode);
    }, [isLiveSessionActive, provider]);
    
    return (
        <div className="w-full h-screen flex flex-row bg-background-primary text-text-primary transition-colors">
            
            <ModeSelector 
                provider={provider}
                selectedMode={selectedMode}
                onSelectMode={handleModeSelection} 
                onReset={handleResetAndSave}
                isMobileOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {isLocalAiInitializing && (
                <div className="absolute inset-0 bg-background-primary flex items-center justify-center z-30 flex-col gap-4 text-center p-4">
                    <div className="w-16 h-16 text-accent-primary">
                        <LocalAIIcon />
                    </div>
                    <p className="text-lg text-text-primary animate-pulse max-w-sm">{localAiInitMessage}</p>
                    <p className="text-xs text-text-secondary max-w-sm mt-4">
                        The first time you use the On-Device AI, it will download a model to your device. This may take a few moments. Subsequent loads will be much faster.
                    </p>
                    <button
                        onClick={onReset}
                        className="mt-6 px-6 py-2 bg-gray-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-md"
                    >
                        Cancel
                    </button>
                </div>
            )}
            
            <div className="flex-1 flex flex-col max-h-screen">
                <header 
                    className="p-2 sm:p-4 bg-background-secondary sticky top-0 z-10 transition-colors flex-shrink-0"
                    style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
                >
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div ref={promptsContainerRef} className="relative z-50">
                            <button
                                type="button"
                                onClick={() => setShowPrompts(p => !p)}
                                onMouseDown={createRipple}
                                disabled={isLoading || isLocalAiInitializing || isLiveSessionActive || isConnecting}
                                className="btn-ripple p-2 rounded-full text-text-primary bg-background-primary hover:bg-[var(--background-hover)] disabled:opacity-50 transition-colors flex items-center gap-2 pr-4"
                                aria-label="Show Prompts"
                            >
                                <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                                <h1 className="text-lg sm:text-xl font-bold truncate text-text-primary">
                                    {selectedMode}
                                </h1>
                            </button>
                             {showPrompts && (
                                <PromptsLibrary 
                                    currentMode={selectedMode} 
                                    onSelectPrompt={handleSelectPrompt} 
                                    provider={provider} 
                                    isHeader={true} 
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div ref={profileDropdownRef} className="relative z-50">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(p => !p)}
                                    onMouseDown={createRipple}
                                    className="btn-ripple flex items-center gap-2 pl-2 pr-2 sm:pr-4 py-1.5 rounded-full bg-background-primary hover:bg-[var(--background-hover)] transition-colors"
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
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 -mr-2 rounded-full text-text-primary hover:bg-[var(--background-hover)]"
                                aria-label="Open menu"
                            >
                                <MenuIcon />
                            </button>
                        </div>
                    </div>
                </header>
                <ChatInterface 
                    messages={messages} 
                    provider={provider}
                    onPlayTTS={handlePlayTTS}
                    ttsState={ttsState}
                />
                
                {provider === AIProvider.OLLAMA && (
                    <div className="max-w-4xl mx-auto w-full px-4 mb-2">
                        <div className="bg-[#141414] rounded-xl border border-zinc-700 flex items-center gap-2 px-3">
                            <ModelIcon className="w-5 h-5 text-text-secondary"/>
                            <input
                                type="text"
                                value={localServerModel}
                                onChange={(e) => setLocalServerModel(e.target.value)}
                                placeholder="Enter model name (required)"
                                className="flex-grow bg-transparent border-none text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-0 text-lg py-3"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                <InputBar
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onSendMessage={handleSendMessage}
                    onFileUpload={handleFileUpload}
                    isLoading={isLoading || isLocalAiInitializing}
                    uploadedFile={uploadedFile}
                    clearUploadedFile={clearUploadedFile}
                    selectedMode={selectedMode}
                    onSelectMode={handleModeSelection}
                    provider={provider}
                    isLiveSessionActive={isLiveSessionActive}
                    isConnecting={isConnecting}
                    onToggleLiveSession={handleToggleLiveSession}
                    webLLMSettings={webLLMSettings}
                    onWebLLMSettingsChange={handleWebLLMSettingsChange}
                />
            </div>
        </div>
    );
});

export default ChatApp;