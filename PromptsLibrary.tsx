// components/PromptsLibrary.tsx

import React from 'react';
import { AIMode, AIProvider } from '../types';
import { PROVIDER_MODES } from '../modes';
import { createRipple } from '../utils/uiUtils';

interface PromptsLibraryProps {
    currentMode: AIMode;
    onSelectPrompt: (prompt: string) => void;
    provider: AIProvider;
    isHeader?: boolean;
}

export const PromptsLibrary: React.FC<PromptsLibraryProps> = ({ currentMode, onSelectPrompt, provider, isHeader = false }) => {
    const availableModes = PROVIDER_MODES[provider];
    const { prompts } = availableModes.find(m => m.mode === currentMode) || availableModes[0];

    const positionClass = isHeader
        ? "absolute top-full mt-2 left-0 w-72 bg-[#141414] rounded-lg p-2 shadow-lg"
        : "absolute bottom-full mb-2 w-72 bg-[#141414] rounded-lg p-2 shadow-lg";

    return (
        <div className={positionClass}>
            <p className="text-xs text-text-secondary px-2 pb-2 font-semibold">SUGGESTED PROMPTS</p>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                {prompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectPrompt(prompt)}
                        onMouseDown={createRipple}
                        className="btn-ripple w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-text-primary hover:bg-[var(--background-hover)]"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};