import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchIcon, LoaderIcon, ModelIcon, SendIcon, GearIcon } from './icons';
import { CreateMLCEngine, MLCEngineInterface, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { ChatMessage, AIProvider, WebLLMSettings } from '../types';
import { Message } from './Message';
import { AdvancedSettings } from './AdvancedSettings';
import { createRipple } from '../utils/uiUtils';

interface HuggingFaceChatAppProps {
    onReset: () => void;
}

interface CompatibleModel {
    id: string;
    name: string;
    description: string;
}

const compatibleModels: CompatibleModel[] = [
    { id: 'Llama-3-8B-Instruct-q4f16_1-MLC', name: 'Llama 3 8B Instruct', description: "Meta's powerful and versatile 8B model." },
    { id: 'Mistral-7B-Instruct-v0.2-q4f16_1-MLC', name: 'Mistral 7B Instruct', description: 'A popular, high-performing 7B model.' },
    { id: 'WizardMath-7B-V1.1-q4f16_1-MLC', name: 'WizardMath 7B v1.1', description: 'A powerful 7B model fine-tuned for mathematical reasoning.' },
    { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', name: 'Phi-3 Mini 4k Instruct', description: 'A highly capable small model by Microsoft.' },
    { id: 'gemma-2b-it-q4f16_1-MLC', name: 'Gemma 2B IT', description: 'Google\'s lightweight 2B instruction-tuned model.' },
    { id: 'RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC', name: 'RedPajama INCITE 3B', description: 'A 3B parameter model from Together AI, trained on open data.' },
    { id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', name: 'TinyLlama 1.1B Chat', description: 'A compact 1.1B parameter model, perfect for devices with limited memory.' },
];

export const HuggingFaceChatApp: React.FC<HuggingFaceChatAppProps> = ({ onReset }) => {
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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const settingsContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsContainerRef.current && !settingsContainerRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const handleSelectModel = async (model: CompatibleModel) => {
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
    };
    
    const handleSendMessage = async () => {
        if (!prompt.trim() || !chatEngine || isReplying) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: prompt };
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
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };
    
    const renderContent = () => {
        if (modelInitState.isLoading && selectedModel) {
            return (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <LoaderIcon className="w-12 h-12" />
                    <p className="text-lg text-text-primary mt-4">Loading {selectedModel.name}...</p>
                    <p className="text-sm text-text-secondary mt-2 max-w-md">{modelInitState.progress}</p>
                </div>
            );
        }

        if (chatEngine && selectedModel) {
            return (
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
            );
        }

        return (
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-background-tertiary p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Select a Compatible Model</h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Choose a model to load directly into your browser using WebLLM. Larger models require more memory and may take longer to initialize. This process happens entirely on your device.
                    </p>
                    {error && <p className="text-red-400 text-sm mb-4 bg-accent-danger/20 p-3 rounded-lg">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {compatibleModels.map(model => (
                            <button
                                key={model.id}
                                onClick={() => handleSelectModel(model)}
                                onMouseDown={createRipple}
                                className="btn-ripple bg-background-secondary p-4 rounded-lg text-left hover:bg-[var(--background-hover)] border border-transparent hover:border-accent-primary transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            >
                                <h3 className="font-semibold text-text-primary">{model.name}</h3>
                                <p className="text-xs text-text-secondary mt-1">{model.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const isInputDisabled = !chatEngine || isReplying || modelInitState.isLoading;
    const placeholderText = modelInitState.isLoading ? 'Model is loading...' : isReplying ? 'Generating response...' : !chatEngine ? 'Select a model to begin' : `Message ${selectedModel?.name}...`;
    
    return (
        <div className="flex-grow w-full flex flex-col text-text-primary bg-background-primary">
            <header className="p-2 sm:p-4 bg-background-secondary sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            <ModelIcon /><span>Hugging Face Chat</span>
                        </h1>
                    </div>
                    <div>
                        <button 
                            onClick={onReset} 
                            onMouseDown={createRipple}
                            className="btn-ripple text-sm px-2 py-1.5 sm:px-3 rounded-md bg-background-tertiary hover:bg-accent-danger transition-colors">
                            Change
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col">
                {renderContent()}
            </main>

            <footer className="p-4 bg-transparent sticky bottom-0">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className={`w-full flex items-end gap-2 p-2 bg-[var(--input-background)] rounded-2xl shadow-lg transition-colors ${isInputDisabled ? 'opacity-60' : ''}`}>
                        {chatEngine && (
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
                                    <AdvancedSettings settings={webLLMSettings} onSettingsChange={(s) => setWebLLMSettings(p => ({...p, ...s}))} />
                                )}
                            </div>
                        )}
                        <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={placeholderText} rows={1}
                            className="flex-grow bg-transparent border-none text-text-primary placeholder-text-secondary rounded-lg p-2 focus:outline-none focus:ring-0 resize-none max-h-48"
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
                            disabled={isInputDisabled}
                        />
                        <button 
                            type="submit" 
                            disabled={isInputDisabled || !prompt.trim()} 
                            onMouseDown={createRipple}
                            className="btn-ripple p-3 rounded-full text-white bg-accent-primary hover:bg-accent-primary-hover disabled:bg-background-secondary disabled:cursor-not-allowed transition-colors self-end">
                            {isReplying ? <LoaderIcon /> : <SendIcon />}
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};