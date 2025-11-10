import React, { useState } from 'react';
import { User } from '../types';
import { createRipple } from '../utils/uiUtils';
import { GeminiLogo, CheckIcon } from './icons';

interface AuthScreenProps {
    onLogin: (user: User, autoLogin: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [autoLogin, setAutoLogin] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName) {
            const user: User = {
                id: `user-${Date.now()}`,
                name: trimmedName,
                email: '', // Not used
                avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(trimmedName)}&backgroundColor=00897b,0d83dd,d52f2f,f59e0b,8e24aa&backgroundType=gradientLinear`,
            };
            onLogin(user, autoLogin);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center text-text-primary p-4 bg-background-primary transition-colors">
            <main className="w-full max-w-sm flex-grow flex flex-col justify-center items-center z-10 text-center">
                <GeminiLogo className="w-16 h-16 mb-4 text-accent-primary" />
                <h1 className="text-4xl font-bold mb-2">Welcome to PowerChat</h1>
                <p className="text-lg text-text-secondary mb-10">Sign in to continue. Your data stays on your device.</p>
                
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="relative w-full bg-[#141414] rounded-xl shadow-lg border border-zinc-700 transition-colors hover:bg-zinc-900 mb-4">
                         <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-transparent text-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-0 p-4"
                            required
                        />
                    </div>

                    <div className="w-full flex items-center justify-start gap-3 mb-6 px-1 cursor-pointer" onClick={() => setAutoLogin(!autoLogin)}>
                        <div
                            className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors flex-shrink-0 ${
                                autoLogin
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-transparent border-zinc-600'
                            }`}
                            aria-checked={autoLogin}
                            role="checkbox"
                        >
                            {autoLogin && <CheckIcon className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-sm text-text-secondary select-none">
                            Log me in automatically on this device
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        onMouseDown={createRipple}
                        className="btn-ripple w-full p-4 rounded-xl bg-blue-500 text-white text-lg font-semibold hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        aria-label="Continue"
                    >
                        Continue
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AuthScreen;
