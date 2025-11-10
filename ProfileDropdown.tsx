import React from 'react';
import { GearIcon, BookmarkIcon, LogoutIcon } from './icons';
import { createRipple } from '../utils/uiUtils';

interface ProfileDropdownProps {
    onGoToSettings: () => void;
    onGoToSavedChats: () => void;
    onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onGoToSettings, onGoToSavedChats, onLogout }) => {
    return (
        <div
            className="absolute top-full right-0 mt-2 w-56 bg-[#141414] rounded-lg shadow-2xl p-2 animate-fade-in-fast"
        >
            <div className="flex flex-col gap-1">
                <button
                    onClick={onGoToSavedChats}
                    onMouseDown={createRipple}
                    className="btn-ripple w-full text-left px-3 py-3 text-base font-medium rounded-md transition-colors text-text-primary hover:bg-[var(--background-hover)] flex items-center gap-3"
                >
                    <BookmarkIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Saved Chats</span>
                </button>
                <button
                    onClick={onGoToSettings}
                    onMouseDown={createRipple}
                    className="btn-ripple w-full text-left px-3 py-3 text-base font-medium rounded-md transition-colors text-text-primary hover:bg-[var(--background-hover)] flex items-center gap-3"
                >
                    <GearIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Settings</span>
                </button>
                <div className="h-px bg-border-primary my-1"></div>
                <button
                    onClick={onLogout}
                    onMouseDown={createRipple}
                    className="btn-ripple w-full text-left px-3 py-3 text-base font-medium rounded-md transition-colors text-accent-danger-text hover:bg-accent-danger/20 flex items-center gap-3"
                >
                    <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileDropdown;