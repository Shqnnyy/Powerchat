import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { SearchIcon, LoaderIcon, ModelIcon, GearIcon, ArrowUpIcon, LogoutIcon, MenuIcon } from './icons';
import { CreateMLCEngine, MLCEngineInterface, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { ChatMessage, AIProvider, WebLLMSettings, AIMode, User } from '../types';
import * as aiService from '../services/aiService';
import { Message } from './Message';
import { AdvancedSettings } from './AdvancedSettings';
import { createRipple } from '../utils/uiUtils';
import { WebLLMSidebar } from './WebLLMSidebar';
import { ProfileDropdown } from './ProfileDropdown';

interface HuggingFaceChatAppProps {
    user: User;
    onGoToSettings: () => void;
    onGoToSavedChats: () => void;
    onLogout: () => void;
    onReset: () => void;
    hfApiKey: string | null;
}

interface CompatibleModel {
    id: string;
    name: string;
    description: string;
    family: string;
}

const compatibleModels: CompatibleModel[] = [
    // Llama Family
    { id: 'Llama-3-8B-Instruct-q4f16_1-MLC', name: 'Llama 3 8B Instruct', description: "Meta's powerful and versatile 8B model.", family: 'Llama' },
    { id: 'Llama-2-7b-chat-hf-q4f16_1-MLC', name: 'Llama 2 7B Chat', description: "Meta's popular 7B chat model.", family: 'Llama' },
    { id: 'Llama-2-13b-chat-hf-q4f16_1-MLC', name: 'Llama 2 13B Chat', description: "A larger, more capable 13B Llama 2 model.", family: 'Llama' },
    
    // Phi Family
    { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', name: 'Phi-3 Mini 4k Instruct', description: 'A highly capable 3.8B model by Microsoft.', family: 'Phi' },
    { id: 'Phi-3-medium-4k-instruct-q4f16_1-MLC', name: 'Phi-3 Medium 4k Instruct', description: 'A larger 14B parameter Phi-3 model for advanced reasoning.', family: 'Phi' },
    { id: 'phi-2-q4f16_1-MLC', name: 'Phi-2', description: 'A powerful 2.7B model from Microsoft, great performance for its size.', family: 'Phi' },

    // Mistral Family
    { id: 'Mistral-Nemo-Instruct-2407-q0f16-MLC', name: 'Mistral Nemo Instruct', description: 'Mistral AI\'s latest 12B instruct model.', family: 'Mistral' },
    { id: 'Mistral-7B-Instruct-v0.2-q4f16_1-MLC', name: 'Mistral 7B Instruct v0.2', description: 'A popular, high-performing 7B instruction model.', family: 'Mistral' },
    { id: 'OpenHermes-2.5-Mistral-7B-q4f16_1-MLC', name: 'OpenHermes 2.5 Mistral 7B', description: 'A fine-tune of Mistral 7B by Teknium.', family: 'Mistral' },
    
    // Gemma Family
    { id: 'gemma-2-9b-it-q0f16-MLC', name: 'Gemma 2 9B IT', description: 'Google\'s new high-performance 9B instruction model.', family: 'Gemma' },
    { id: 'gemma-7b-it-q4f16_1-MLC', name: 'Gemma 7B IT', description: 'A larger 7B instruction-tuned model from Google.', family: 'Gemma' },
    { id: 'gemma-2b-it-q4f16_1-MLC', name: 'Gemma 2B IT', description: 'Google\'s lightweight 2B instruction-tuned model.', family: 'Gemma' },
    
    // Qwen Family
    { id: 'Qwen2-7B-Instruct-q0f16-MLC', name: 'Qwen2 7B Instruct', description: 'The largest 7B Qwen2 model for general chat.', family: 'Qwen' },
    { id: 'Qwen2-1.5B-Instruct-q0f16-MLC', name: 'Qwen2 1.5B Instruct', description: 'A 1.5B model from Alibaba, great balance of size and performance.', family: 'Qwen' },
    { id: 'Qwen2-0.5B-Instruct-q0f16-MLC', name: 'Qwen2 0.5B Instruct', description: 'A very small 0.5B model from Alibaba, suitable for low-resource devices.', family: 'Qwen' },
    
    // Other & Specialized Models
    { id: 'WizardMath-7B-V1.1-q4f16_1-MLC', name: 'WizardMath 7B v1.1', description: 'A 7B model fine-tuned for mathematical reasoning.', family: 'Specialized' },
    { id: 'dolphin-2.2.1-mistral-7b-q4f16_1-MLC', name: 'Dolphin 2.2.1 Mistral 7B', description: 'A popular, less-restricted fine-tune of Mistral 7B.', family: 'Specialized' },
    { id: 'StableLM-3b-4e1t-q4f16_1-MLC', name: 'StableLM 3B', description: 'A 3B parameter model from Stability AI.', family: 'Other' },
    { id: 'RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC', name: 'RedPajama INCITE 3B', description: 'A 3B model from Together AI, trained on open data.', family: 'Other' },
    { id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', name: 'TinyLlama 1.1B Chat', description: 'A compact 1.1B model, perfect for devices with limited memory.', family: 'Other' },
];


export const HuggingFaceChatApp: React.FC<HuggingFaceChatAppProps> = memo(({ user, onGoToSettings, onGoToSavedChats, onLogout, onReset, hfApiKey }) => {
    const [error, setError] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<CompatibleModel | null>(null);
    
    // Model and Chat State
    const [modelInitState, setModelInitState] = useState<{ isLoading: boolean; progress: string }>({ isLoading: false, progress: '' });
    const [chatEngine, setChatEngine] = useState<MLCEngineInterface | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [webLLMSettings, setWebLLMSettings] = useState<WebLLMSettings>({ temperature: 0.7, topP: 0.9 });
    const [showSettings, setShowSettings] = useState(false);
    
    // UI State
    const [isMobile, setIsMobile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customModels, setCustomModels] = useState<CompatibleModel[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const settingsContainerRef = useRef<HTMLDivElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        const storedModelsRaw = localStorage.getItem('custom_webllm_models');
        if (storedModelsRaw) {
            const storedModels: string[] = JSON.parse(storedModelsRaw);
            const formattedCustomModels: CompatibleModel[] = storedModels.map(id => ({
                id,
                name: id.split('/').pop()?.replace(/-q[0-9]f[0-9]{2}_[0-9]+-MLC/i, '') || id,
                description: 'A custom user-added model.',
                family: 'Custom',
            }));
            setCustomModels(formattedCustomModels);
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (settingsContainerRef.current && !settingsContainerRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowSettings(false);
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

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const handleSelectModel = useCallback(async (model: CompatibleModel) => {
        setSelectedModel(model);
        setMessages([]);
        setError(null);
        setModelInitState({ isLoading: true, progress: 'Initializing chat engine...' });

        try {
            const engine = await CreateMLCEngine(model.id, {
                initProgressCallback: (report) => {
                    setModelInitState({ isLoading: true, progress: report.text });
                }
            });
            setChatEngine(engine);
            setModelInitState({ isLoading: false, progress: 'Model loaded!' });
            setMessages([{
                id: 'initial-model-message',
                role: 'model',
                text: `Model **${model.name}** is loaded. You can now start chatting.`
            }]);
        } catch (e: any) {
            setError(`Failed to load model: ${e.message}. It may be too large for your device or not compatible with WebLLM. Please try another model or refresh the page.`);
            setModelInitState({ isLoading: false, progress: '' });
            setSelectedModel(null);
        }
    }, []);
    
    const handleSendMessage = useCallback(async () => {
        if (!prompt.trim() || isReplying) return;

        // Keyword check for image generation prompts
        const imageKeywords = ['image of', 'picture of', 'generate a photo', 'create an image', 'draw a', 'render a', 'photo of', 'a painting of'];
        const lowerCasePrompt = prompt.toLowerCase();
        const isImagePrompt = imageKeywords.some(keyword => lowerCasePrompt.includes(keyword));
        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: prompt };

        if (isImagePrompt) {
            setMessages(prev => [...prev, userMessage]);
            setPrompt('');

            if (!hfApiKey) {
                const modelMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    text: "To generate images, you need a Hugging Face API key. Please add your key in the **Settings** page.",
                    isError: true,
                };
                setMessages(prev => [...prev, modelMessage]);
                return;
            }

            setIsReplying(true);
            const modelMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: modelMessageId, role: 'model', isLoading: true }]);

            try {
                const response = await aiService.generateImage(AIProvider.HUGGING_FACE, hfApiKey, prompt, AIMode.IMAGE_GEN);
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, ...response, isLoading: false } : msg));
            } catch (err: any) {
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: `Image Generation Error: ${err.message}`, isLoading: false, isError: true } : msg));
            } finally {
                setIsReplying(false);
            }
            return;
        }

        // Standard text chat with WebLLM
        if (!chatEngine) return;

        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setIsReplying(true);

        const modelMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '', isLoading: true }]);

        const historyForEngine: ChatCompletionMessageParam[] = [...messages, userMessage]
            .filter(m => m.text && !m.isError)
            .map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.text!
            }));

        try {
            const stream = await chatEngine.chat.completions.create({
                messages: historyForEngine,
                stream: true,
                temperature: webLLMSettings.temperature,
                top_p: webLLMSettings.topP,
            });

            let firstChunk = true;
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta.content;
                if (delta) {
                    if (firstChunk) {
                        setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: delta, isLoading: false } : msg));
                        firstChunk = false;
                    } else {
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === modelMessageId) {
                                return { ...msg, text: (msg.text || '') + delta };
                            }
                            return msg;
                        }));
                    }
                }
            }
        } catch (e: any) {
            console.error("Chat completion error:", e);
            setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: `Error: ${e.message}`, isLoading: false, isError: true } : msg));
        } finally {
            setIsReplying(false);
        }
    }, [prompt, chatEngine, isReplying, messages, webLLMSettings.temperature, webLLMSettings.topP, hfApiKey]);
    
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    }, [handleSendMessage]);
    
    const allModels = [...customModels, ...compatibleModels];
    
    if (!selectedModel) {
        const filteredModels = allModels.filter(model =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const groupedModels = filteredModels.reduce((acc, model) => {
          const family = model.family || 'Other';
          if (!acc[family]) acc[family] = [];
          acc[family].push(model);
          return acc;
        }, {} as Record<string, CompatibleModel[]>);

        return (
            <div className="flex-grow w-full flex flex-col text-text-primary bg-background-primary min-h-screen">
                <header className="p-2 sm:p-4 bg-background-secondary sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
                                <ModelIcon /><span>WebLLM On-Device Chat</span>
                            </h1>
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
                                onClick={onReset}
                                onMouseDown={createRipple}
                                className="btn-ripple text-sm font-medium px-3 py-2 rounded-md flex items-center gap-2 bg-accent-danger text-white hover:bg-accent-danger-hover transition-all"
                            >
                                <LogoutIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Exit</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col items-center">
                    <div className="max-w-4xl mx-auto space-y-4 w-full">
                        <div className="bg-background-tertiary p-4 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">Select a Compatible Model</h2>
                            <p className="text-base text-text-secondary mb-4">
                                These on-device models are for text chat. You can also generate images, which uses the Hugging Face Inference API. Please add your HF API key in **Settings** to enable this feature. Custom models, including uncensored versions, can be added from the main screen for greater flexibility.
                            </p>
                            {isMobile && (
                                <div className="bg-yellow-500/10 text-yellow-300 border border-yellow-700 p-3 rounded-lg mb-4 text-xs sm:text-sm">
                                    <strong className="font-semibold">Mobile Device Detected:</strong> Large models may not run due to memory limitations and could cause your browser to crash. We recommend starting with smaller models (e.g., TinyLlama, Gemma 2B, Phi-3 Mini).
                                </div>
                            )}
                            {error && <p className="text-sm mb-4 bg-[var(--accent-danger-bg)] text-[var(--accent-danger-text)] border border-[var(--accent-danger-border)] p-3 rounded-lg">{error}</p>}
                            
                            <div className="relative mb-4">
                                <div className="relative w-full bg-[#141414] rounded-xl border border-zinc-700 transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-accent-primary">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <SearchIcon className="w-5 h-5 text-text-tertiary" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search models by name or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-transparent p-2.5 pl-10 rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                {Object.keys(groupedModels).length > 0 ? (
                                    Object.entries(groupedModels)
                                        .sort((a, b) => {
                                            const familyA = a[0];
                                            const familyB = b[0];
                                            if (familyA === familyB) return 0;
                                            if (familyA === 'Custom') return -1;
                                            if (familyB === 'Custom') return 1;
                                            return familyA.localeCompare(familyB);
                                        })
                                        // FIX: Explicitly type the parameters for the `.map` function when rendering grouped models. This resolves a TypeScript error where the type of `models` was inferred as `unknown`, causing `models.map` to fail.
                                        .map(([family, models]: [string, CompatibleModel[]]) => (
                                            <div key={family}>
                                                <h3 className="text-sm font-semibold text-text-secondary mt-4 mb-2 pl-1 uppercase tracking-wide">{family}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {models.map(model => (
                                                        <button
                                                            key={model.id}
                                                            onClick={() => handleSelectModel(model)}
                                                            onMouseDown={createRipple}
                                                            className="btn-ripple bg-background-secondary p-4 rounded-lg text-left hover:bg-[var(--background-hover)] border border-transparent hover:border-accent-primary transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary"
                                                        >
                                                            <h3 className="font-semibold text-text-primary text-lg">{model.name}</h3>
                                                            <p className="text-sm text-text-secondary mt-1">{model.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-center text-text-secondary py-8">No models found for "{searchTerm}".</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
    
    const isInputDisabled = isReplying || modelInitState.isLoading;
    const placeholderText = modelInitState.isLoading ? 'Model is loading...' : isReplying ? 'Generating response...' : !chatEngine ? 'Select a model to begin' : `Message ${selectedModel?.name}...`;
    
    return (
        <div className="w-full h-screen flex flex-row bg-background-primary text-text-primary transition-colors">
            <WebLLMSidebar
                selectedModel={selectedModel}
                availableModels={allModels}
                onSelectModel={handleSelectModel}
                onReset={onReset}
                isMobileOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <div className="flex-1 flex flex-col max-h-screen">
                <header 
                    className="p-2 sm:p-4 bg-background-secondary sticky top-0 z-10 transition-colors flex-shrink-0"
                    style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
                >
                     <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <h1 className="text-lg sm:text-xl font-bold truncate text-text-primary">
                            {selectedModel.name}
                        </h1>
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

                <main className="flex-grow px-4 pt-16 sm:pt-20 pb-4 overflow-y-auto custom-scrollbar flex flex-col">
                     {modelInitState.isLoading && selectedModel ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <LoaderIcon className="w-12 h-12" />
                            <p className="text-lg text-text-primary mt-4">Loading {selectedModel.name}...</p>
                            <p className="text-sm text-text-secondary mt-2 max-w-md">{modelInitState.progress}</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-4 flex-grow w-full flex flex-col">
                            {messages.map((msg) => (
                                <Message
                                    key={msg.id}
                                    message={msg}
                                    provider={AIProvider.HUGGING_FACE}
                                    onPlayTTS={() => {}}
                                    ttsState={{ messageId: '', status: 'idle' }}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                <footer 
                    className="p-4 bg-transparent sticky bottom-0"
                    style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
                >
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                        <div 
                            className="relative w-full bg-[#141414] rounded-3xl shadow-2xl border border-zinc-700 transition-colors hover:bg-zinc-900"
                        >
                            <div onMouseDown={createRipple} className="btn-ripple absolute inset-0 rounded-3xl overflow-hidden"></div>
                            <div className="relative z-10 p-2 sm:p-3 flex items-end gap-2 pointer-events-none">
                                <div className="flex items-center gap-1 pointer-events-auto">
                                    {chatEngine && (
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
                                                <AdvancedSettings settings={webLLMSettings} onSettingsChange={(s) => setWebLLMSettings(p => ({...p, ...s}))} />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={placeholderText} rows={1}
                                    className="flex-grow bg-transparent border-none text-base text-text-primary placeholder-text-secondary px-2 py-2.5 focus:outline-none focus:ring-0 resize-none max-h-48 pointer-events-auto"
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
                                            handleSubmit(e);
                                        }
                                    }}
                                    disabled={isInputDisabled}
                                />
                                <button 
                                    type="submit" 
                                    disabled={isInputDisabled || !prompt.trim()} 
                                    onMouseDown={createRipple}
                                    className="btn-ripple w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors self-end pointer-events-auto">
                                    {isReplying ? <LoaderIcon className="w-6 h-6" /> : <ArrowUpIcon className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </form>
                </footer>
            </div>
        </div>
    );
});

export default HuggingFaceChatApp;