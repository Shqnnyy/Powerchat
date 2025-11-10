import React from 'react';
import { User } from '../types';
import { GoogleIcon } from './icons';

interface MockGoogleLoginProps {
    onLoginSuccess: (user: User) => void;
    onClose: () => void;
}

const MockGoogleLogin: React.FC<MockGoogleLoginProps> = ({ onLoginSuccess, onClose }) => {
    
    const handleLogin = () => {
        // Simulate a successful login with a mock user
        const mockUser: User = {
            id: '12345-mock-user',
            name: 'Alex Doe',
            email: 'alex.doe@example.com',
            avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Alex%20Doe`,
        };
        onLoginSuccess(mockUser);
    };

    return (
        <div 
            className="fixed inset-0 bg-[var(--modal-overlay-bg)] z-50 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg p-8 shadow-2xl text-gray-800 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Sign in</h1>
                    <p className="text-gray-600 mb-6">to continue to Gemini PowerChat</p>
                </div>
                
                <div className="space-y-4">
                    <button 
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <GoogleIcon />
                        <span>Sign in with Google (Mock)</span>
                    </button>
                    <p className="text-xs text-center text-gray-500">
                        This is a simulated login. No real data is used or transmitted.
                    </p>
                </div>
                 <div className="mt-6 text-center">
                    <button onClick={onClose} className="text-sm text-gray-600 hover:underline">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default MockGoogleLogin;