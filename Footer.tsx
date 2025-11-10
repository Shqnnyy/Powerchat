import React from 'react';

interface FooterProps {
    onShowPolicy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowPolicy }) => {
    return (
        <footer 
            className="relative z-10 w-full text-center p-4 text-xs text-gray-500"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <span>©2025 Labythat</span>
            <span className="mx-2">|</span>
            <button onClick={onShowPolicy} className="hover:text-gray-300 hover:underline">
                Privacy Policy
            </button>
        </footer>
    );
};