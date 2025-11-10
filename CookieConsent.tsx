import React, { useState, useEffect } from 'react';
import { createRipple } from '../utils/uiUtils';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="fixed left-4 right-4 sm:left-auto sm:right-4 z-50 animate-fade-in-fast max-w-lg mx-auto sm:mx-0"
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <div className="bg-background-secondary border border-border-primary rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-text-secondary w-full">
                    We use local storage to save your API keys and chat history directly on your device for your convenience. Your data is never sent to us.
                </p>
                <button
                    onClick={handleAccept}
                    onMouseDown={createRipple}
                    className="btn-ripple w-full sm:w-auto px-6 py-2 rounded-full bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors flex-shrink-0"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;