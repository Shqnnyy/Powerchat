import React, { useState } from 'react';
import { AIMode, AIProvider } from '../types';
import { PROVIDER_MODES } from '../modes';
import { createRipple } from '../utils/uiUtils';


interface ModeSelectorProps {
    provider: AIProvider;
    selectedMode: AIMode;
    onSelectMode: (mode: AIMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ provider, selectedMode, onSelectMode }) => {
    const [hoveredMode, setHoveredMode] = useState<AIMode | null>(null);

    const availableModes = PROVIDER_MODES[provider];
    const displayMode = hoveredMode || selectedMode;
    const displayDetails = availableModes.find(m => m.mode === displayMode);

    return (
        <div 
            className="absolute bottom-full mb-2 w-64 bg-background-secondary rounded-lg shadow-lg z-20 transition-colors"
            onMouseLeave={() => setHoveredMode(null)}
        >
            <div className="p-2">
                <p className="text-xs text-text-secondary px-2 pb-2 font-semibold">SELECT MODE</p>
                <div className="flex flex-col gap-1">
                    {availableModes.map(({ mode, Icon }) => (
                        <button
                            key={mode}
                            onClick={() => onSelectMode(mode)}
                            onMouseDown={createRipple}
                            onMouseEnter={() => setHoveredMode(mode)}
                            className={`btn-ripple w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-3 ${
                                selectedMode === mode
                                    ? 'bg-accent-primary text-white'
                                    : 'text-text-primary hover:bg-[var(--background-hover)]'
                            }`}
                        >
                            <Icon />
                            <span>{mode}</span>
                        </button>
                    ))}
                </div>
            </div>
            {displayDetails && (
                <div className="h-24 p-3 bg-background-tertiary rounded-b-lg transition-colors">
                    <p className="text-xs text-text-secondary leading-relaxed">{displayDetails.description}</p>
                </div>
            )}
        </div>
    );
};