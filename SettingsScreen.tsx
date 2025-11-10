import React, { useState, useRef } from 'react';
import { User } from '../types';
import { ArrowLeftIcon, LogoutIcon, CameraIcon } from './icons';
import ApiKeyManager from './ApiKeyManager';
import { createRipple } from '../utils/uiUtils';

interface SettingsScreenProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
    onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onUpdateUser, onLogout, onBack }) => {
    const [name, setName] = useState(user.name);
    const [newAvatar, setNewAvatar] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Image is too large. Please select a file smaller than 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setNewAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = () => {
        const trimmedName = name.trim();
        const isNameChanged = trimmedName && trimmedName !== user.name;
        const isAvatarChanged = newAvatar !== null;

        if (!isNameChanged && !isAvatarChanged) return;

        let newAvatarUrl = user.avatarUrl;
        if (isAvatarChanged) {
            newAvatarUrl = newAvatar!;
        } else if (isNameChanged) {
            newAvatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(trimmedName)}&backgroundColor=00897b,0d83dd,d52f2f,f59e0b,8e24aa&backgroundType=gradientLinear`;
        }
        
        const updatedUser: User = {
            ...user,
            name: trimmedName || user.name,
            avatarUrl: newAvatarUrl,
        };
        onUpdateUser(updatedUser);
        setNewAvatar(null); // Reset after save
        alert("Profile updated!");
    };

    const isSaveDisabled = (!name.trim() || (name.trim() === user.name && newAvatar === null));

    return (
        <div className="w-full h-screen flex flex-col bg-background-primary text-text-primary transition-colors">
            <header 
                className="p-4 bg-background-secondary sticky top-0 z-10 flex-shrink-0 flex items-center gap-4"
                style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
            >
                <button onClick={onBack} onMouseDown={createRipple} className="btn-ripple p-2 rounded-full hover:bg-[var(--background-hover)]">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold">Settings</h1>
            </header>
            
            <main className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
                    {/* Profile Section */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4 border-b border-border-primary pb-2">Profile</h2>
                        <div className="flex items-center gap-4">
                            <div className="relative group w-16 h-16 flex-shrink-0">
                                <img src={newAvatar || user.avatarUrl} alt="User Avatar" className="w-16 h-16 rounded-full bg-background-secondary object-cover" />
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    aria-label="Upload new avatar"
                                >
                                    <CameraIcon className="w-6 h-6" />
                                </button>
                                <input 
                                    ref={avatarInputRef}
                                    id="avatar-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleAvatarUpload}
                                />
                            </div>
                            <div className="flex-grow">
                                <label htmlFor="profile-name" className="text-sm text-text-secondary">Display Name</label>
                                <div className="relative mt-1 w-full bg-[#141414] rounded-xl border border-zinc-700 transition-colors hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-accent-primary">
                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3 text-lg bg-transparent text-text-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-right">
                            <button
                                onClick={handleSaveProfile}
                                onMouseDown={createRipple}
                                disabled={isSaveDisabled}
                                className="btn-ripple px-4 py-2 text-sm rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </section>
                    
                    {/* API Keys Section */}
                    <section>
                         <h2 className="text-lg font-semibold mb-4 border-b border-border-primary pb-2">API Keys</h2>
                        <ApiKeyManager />
                    </section>
                </div>
            </main>
            
            <footer 
                className="p-4 sm:p-6 border-t border-border-primary flex-shrink-0"
                style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={onLogout}
                        onMouseDown={createRipple}
                        className="btn-ripple w-full sm:w-auto text-left px-4 py-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-3 bg-accent-danger text-white hover:bg-accent-danger-hover"
                    >
                        <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default SettingsScreen;