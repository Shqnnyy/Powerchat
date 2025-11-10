import React from 'react';

interface ToggleSwitchProps {
    isLight: boolean;
    onChange: (isLight: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isLight, onChange }) => {
    return (
        <button
            onClick={() => onChange(!isLight)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-accent-primary hover:bg-accent-primary-hover`}
            aria-label="Toggle theme"
        >
            <span
                className={`${
                    isLight ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
        </button>
    );
};