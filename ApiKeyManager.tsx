import React, { useState, useEffect, useCallback } from 'react';
import { AIProvider } from '../types';
import * as aiService from '../services/aiService';
import { CloseIcon, CheckIcon, LoaderIcon, TrashIcon, InfoIcon } from './icons';
import { createRipple } from '../utils/uiUtils';

type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid';

const providersToManage: AIProvider[] = [
    AIProvider.GEMINI,
    AIProvider.OPENAI,
    AIProvider.ANTHROPIC,
    AIProvider.COHERE,
    AIProvider.OLLAMA,
    AIProvider.HUGGING_FACE,
];

const providerInfo: Record<AIProvider, { name: string; placeholder: string; docs: string }> = {
    [AIProvider.GEMINI]: { name: 'Gemini', placeholder: 'Enter your Gemini API Key', docs: 'https://aistudio.google.com/app/apikey' },
    [AIProvider.OPENAI]: { name: 'ChatGPT', placeholder: 'sk-...', docs: 'https://platform.openai.com/api-keys' },
    [AIProvider.ANTHROPIC]: { name: 'Anthropic', placeholder: 'sk-ant-...', docs: 'https://console.anthropic.com/settings/keys' },
    [AIProvider.COHERE]: { name: 'Cohere', placeholder: 'Enter your Cohere API Key', docs: 'https://dashboard.cohere.com/api-keys' },
    [AIProvider.OLLAMA]: { name: 'Ollama', placeholder: 'http://localhost:11434', docs: 'https://ollama.com/blog/openai-compatibility' },
    [AIProvider.HUGGING_FACE]: { name: 'Hugging Face', placeholder: 'hf_...', docs: 'https://huggingface.co/settings/tokens' },
    [AIProvider.LOCAL_AI]: { name: '', placeholder: '', docs: '' }, // Not managed
    // FIX: Add missing entry for FREE_AI to satisfy the Record<AIProvider, ...> type.
    [AIProvider.FREE_AI]: { name: '', placeholder: '', docs: '' }, // Not managed
};

export const ApiKeyManager: React.FC = () => {
    const [keys, setKeys] = useState<Record<AIProvider, string>>({} as any);
    const [validationStatus, setValidationStatus] = useState<Record<AIProvider, ValidationStatus>>({} as any);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        const loadedKeys: Record<string, string> = {};
        const loadedStatus: Record<string, ValidationStatus> = {};
        providersToManage.forEach(provider => {
            loadedKeys[provider] = localStorage.getItem(`ai_api_key_${provider}`) || '';
            loadedStatus[provider] = 'idle';
        });
        setKeys(loadedKeys as any);
        setValidationStatus(loadedStatus as any);
        setSaveError(null);
    }, []);

    const handleKeyChange = (provider: AIProvider, value: string) => {
        setKeys(prev => ({ ...prev, [provider]: value }));
        setValidationStatus(prev => ({ ...prev, [provider]: 'idle' }));
        setSaveError(null);
    };

    const handleValidate = useCallback(async (provider: AIProvider) => {
        const key = keys[provider];
        if (!key) return;

        setValidationStatus(prev => ({ ...prev, [provider]: 'loading' }));
        const isValid = await aiService.validateApiKey(provider, key);
        setValidationStatus(prev => ({ ...prev, [provider]: isValid ? 'valid' : 'invalid' }));
    }, [keys]);
    
    const handleRemoveKey = useCallback((provider: AIProvider) => {
        setKeys(prev => ({ ...prev, [provider]: '' }));
        setValidationStatus(prev => ({ ...prev, [provider]: 'idle' }));
        localStorage.removeItem(`ai_api_key_${provider}`);
        setSaveError(null);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);

        const providersToValidate = providersToManage.filter(p => !!keys[p]);
        
        if (providersToValidate.length === 0) {
            providersToManage.forEach(provider => localStorage.removeItem(`ai_api_key_${provider}`));
            setIsSaving(false);
            alert("All keys cleared.");
            return;
        }
        
        const validationPromises = providersToValidate.map(async (provider) => {
            const key = keys[provider];
            setValidationStatus(prev => ({ ...prev, [provider]: 'loading' }));
            const isValid = await aiService.validateApiKey(provider, key);
            setValidationStatus(prev => ({ ...prev, [provider]: isValid ? 'valid' : 'invalid' }));
            return { provider, isValid, key };
        });

        const results = await Promise.all(validationPromises);
        const allValid = results.every(r => r.isValid);

        if (allValid) {
            providersToManage.forEach(provider => {
                const key = keys[provider];
                if (key) {
                    localStorage.setItem(`ai_api_key_${provider}`, key);
                } else {
                    localStorage.removeItem(`ai_api_key_${provider}`);
                }
            });
            setIsSaving(false);
            alert("API Keys saved successfully!");
        } else {
            setIsSaving(false);
            setSaveError("One or more keys are invalid. Please correct them before saving.");
        }
    };

    return (
        <div className="bg-background-secondary p-4 sm:p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-text-secondary mb-4">
                Your keys connect your browser directly to the AI provider. They are saved securely in your browser's local storage and are never sent to our servers.
            </p>
            <div className="bg-background-tertiary/50 p-3 rounded-lg text-xs text-text-secondary mb-6 space-y-2">
                 <div className="flex items-start gap-2">
                     <InfoIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                     <div>
                         <p><strong>Troubleshooting "Failed to fetch" errors:</strong></p>
                         <ul className="list-disc list-inside mt-1 space-y-1">
                            <li><strong>Ollama:</strong> This usually means a CORS issue. You need to configure <code className="bg-background-tertiary text-text-primary rounded px-1 py-0.5 font-mono text-[11px]">OLLAMA_ORIGINS</code> on your server.</li>
                            <li><strong>Hugging Face:</strong> This can be caused by browser extensions (like ad-blockers) blocking the request. Try disabling them for this site.</li>
                         </ul>
                     </div>
                </div>
            </div>
            <div className="space-y-6">
                {providersToManage.map(provider => (
                    <div key={provider}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="font-semibold text-text-primary" htmlFor={`key-input-${provider}`}>
                                {provider === AIProvider.OLLAMA ? 'Ollama Server URL' : providerInfo[provider].name}
                            </label>
                            <a href={providerInfo[provider].docs} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                                Get Key
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex-grow relative bg-[#141414] rounded-xl border border-zinc-700 transition-colors hover:bg-zinc-900 focus-within:ring-2 ${
                                validationStatus[provider] === 'invalid' ? 'ring-accent-danger' : 'focus-within:ring-accent-primary'
                            }`}>
                                <input
                                    id={`key-input-${provider}`}
                                    type={(provider === AIProvider.OLLAMA) ? "text" : "password"}
                                    value={keys[provider] || ''}
                                    onChange={e => handleKeyChange(provider, e.target.value)}
                                    placeholder={providerInfo[provider].placeholder}
                                    className="w-full p-3 text-lg bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => handleValidate(provider)}
                                disabled={!keys[provider] || validationStatus[provider] === 'loading'}
                                className="px-4 py-3 text-sm bg-background-tertiary hover:bg-accent-primary/20 rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {validationStatus[provider] === 'loading' ? <LoaderIcon className="w-5 h-5" /> : 'Test'}
                            </button>
                             {keys[provider] && (
                                <button
                                    onClick={() => handleRemoveKey(provider)}
                                    onMouseDown={createRipple}
                                    className="btn-ripple p-3 text-sm rounded-lg bg-background-tertiary text-accent-danger-text hover:bg-accent-danger/20 transition-colors"
                                    title={`Remove ${providerInfo[provider].name} key`}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                            <div className="w-6 h-6 flex items-center justify-center">
                                {validationStatus[provider] === 'valid' && <CheckIcon className="text-accent-success" />}
                                {validationStatus[provider] === 'invalid' && <CloseIcon className="text-accent-danger" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <footer className="pt-6 mt-6 border-t border-border-primary flex justify-end items-center gap-4">
                {saveError && <p className="text-sm text-accent-danger text-left flex-grow">{saveError}</p>}
                <button
                    onClick={handleSave}
                    onMouseDown={createRipple}
                    disabled={isSaving}
                    className="btn-ripple px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Validating...' : 'Save Keys'}
                </button>
            </footer>
        </div>
    );
};

export default ApiKeyManager;