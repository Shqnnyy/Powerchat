import React from 'react';
import { SavedChatSession } from '../types';
import { ArrowLeftIcon, TrashIcon } from './icons';
import { createRipple } from '../utils/uiUtils';

interface SavedChatsScreenProps {
    savedSessions: SavedChatSession[];
    onLoadChat: (session: SavedChatSession) => void;
    onDeleteSession: (sessionId: string) => void;
    onBack: () => void;
}

export const SavedChatsScreen: React.FC<SavedChatsScreenProps> = ({ savedSessions, onLoadChat, onDeleteSession, onBack }) => {
    return (
        <div className="w-full h-screen flex flex-col bg-background-primary text-text-primary transition-colors">
            <header
                className="p-4 bg-background-secondary sticky top-0 z-10 flex-shrink-0 flex items-center gap-4"
                style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
            >
                <button onClick={onBack} onMouseDown={createRipple} className="btn-ripple p-2 rounded-full hover:bg-[var(--background-hover)]">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold">Saved Chats</h1>
            </header>

            <main className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-4 sm:p-6">
                    {savedSessions && savedSessions.length > 0 ? (
                        <div className="space-y-3">
                            {savedSessions.map(session => (
                                <div key={session.id} className="group w-full bg-[#282828] rounded-xl flex items-center justify-between shadow-lg border border-zinc-700 hover:border-accent-primary transition-all cursor-pointer animate-fade-in-fast" onClick={() => onLoadChat(session)}>
                                    <div className="p-4 overflow-hidden">
                                        <p className="font-semibold text-text-primary truncate">{session.title}</p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {new Date(session.timestamp).toLocaleString()} - {session.provider}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Are you sure you want to delete this chat session?')) {
                                                onDeleteSession(session.id);
                                            }
                                        }}
                                        className="p-3 text-text-secondary hover:text-accent-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete session"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-lg text-text-secondary">You have no saved chats yet.</p>
                            <p className="text-sm text-text-tertiary mt-2">Start a conversation to see it here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SavedChatsScreen;