import React from 'react';
import { WebLLMSettings } from '../types';

interface AdvancedSettingsProps {
    settings: WebLLMSettings;
    onSettingsChange: (newSettings: Partial<WebLLMSettings>) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onSettingsChange }) => {
    return (
        <div className="absolute bottom-full mb-2 w-72 bg-[#141414] rounded-lg shadow-lg p-4 transition-colors">
            <p className="text-xs text-text-secondary pb-3 font-semibold">ADVANCED SETTINGS</p>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <label htmlFor="temperature" className="text-text-primary font-medium">Temperature</label>
                        <span className="text-text-secondary">{settings.temperature.toFixed(1)}</span>
                    </div>
                    <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => onSettingsChange({ temperature: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                    />
                     <p className="text-xs text-text-tertiary mt-1">Controls randomness. Lower is more deterministic.</p>
                </div>
                <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <label htmlFor="topP" className="text-text-primary font-medium">Top P</label>
                         <span className="text-text-secondary">{settings.topP.toFixed(1)}</span>
                    </div>
                    <input
                        id="topP"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.topP}
                        onChange={(e) => onSettingsChange({ topP: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                    />
                    <p className="text-xs text-text-tertiary mt-1">Considers tokens with top P probability mass.</p>
                </div>
            </div>
        </div>
    );
};