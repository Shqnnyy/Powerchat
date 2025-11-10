import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AIProvider, UploadedFile, SavedChatSession, User, AIMode } from './types';
import * as aiService from './services/aiService';
import { Footer } from './components/Footer';
import { LoaderIcon } from './components/icons';

const ProviderSelectionScreen = lazy(() => import('./components/ProviderSelectionScreen').then(module => ({ default: module.ProviderSelectionScreen })));
const ChatApp = lazy(() => import('./ChatApp').then(module => ({ default: module.ChatApp })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const HuggingFaceChatApp = lazy(() => import('./components/HuggingFaceChatApp').then(module => ({ default: module.HuggingFaceChatApp })));
const CookieConsent = lazy(() => import('./components/CookieConsent').then(module => ({ default: module.CookieConsent })));
const AuthScreen = lazy(() => import('./components/AuthScreen').then(module => ({ default: module.AuthScreen })));
const SettingsScreen = lazy(() => import('./components/SettingsScreen').then(module => ({ default: module.SettingsScreen })));
const SavedChatsScreen = lazy(() => import('./components/SavedChatsScreen').then(module => ({ default: module.SavedChatsScreen })));

type View = 'login' | 'auth' | 'chat' | 'policy' | 'settings' | 'savedChats';

const LoadingFallback: React.FC = () => (
    <div className="w-full h-screen flex items-center justify-center">
        <LoaderIcon className="w-10 h-10" />
    </div>
);

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [view, setView] = useState<View>('login');
    const [provider, setProvider] = useState<AIProvider | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
    const [initialFile, setInitialFile] = useState<UploadedFile | null>(null);
    const [initialMode, setInitialMode] = useState<AIMode | null>(null);
    const [initialSession, setInitialSession] = useState<SavedChatSession | null>(null);
    const [savedSessions, setSavedSessions] = useState<SavedChatSession[]>([]);
    const [chatIsActive, setChatIsActive] = useState(false);

    const reloadSessions = useCallback(() => {
        try {
            const storedSessions = localStorage.getItem('saved_chat_sessions');
            if (storedSessions) {
                setSavedSessions(JSON.parse(storedSessions));
            }
        } catch (error) {
            console.error("Failed to load saved sessions:", error);
            localStorage.removeItem('saved_chat_sessions');
        }
    }, []);

    useEffect(() => {
        try {
            let storedUser = localStorage.getItem('powerchat_user');
            if (!storedUser) {
                storedUser = sessionStorage.getItem('powerchat_user');
            }

            if (storedUser) {
                setUser(JSON.parse(storedUser));
                setView('auth'); 
            } else {
                setView('login');
            }
        } catch (e) {
            console.error("Failed to parse user from storage", e);
            setView('login');
        }
        reloadSessions();
    }, [reloadSessions]);
    
    const handleLogin = (newUser: User, autoLogin: boolean) => {
        localStorage.removeItem('powerchat_user');
        sessionStorage.removeItem('powerchat_user');

        if (autoLogin) {
            localStorage.setItem('powerchat_user', JSON.stringify(newUser));
        } else {
            sessionStorage.setItem('powerchat_user', JSON.stringify(newUser));
        }
        setUser(newUser);
        setView('auth');
    };

    const handleUpdateUser = (updatedUser: User) => {
        // Assume user updates should be persistent if they were logged in persistently
        if (localStorage.getItem('powerchat_user')) {
            localStorage.setItem('powerchat_user', JSON.stringify(updatedUser));
        }
        if (sessionStorage.getItem('powerchat_user')) {
            sessionStorage.setItem('powerchat_user', JSON.stringify(updatedUser));
        }
        setUser(updatedUser);
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('powerchat_user');
        sessionStorage.removeItem('powerchat_user');
        setUser(null);
        setProvider(null);
        setApiKey(null);
        setInitialPrompt(null);
        setInitialFile(null);
        setInitialMode(null);
        setInitialSession(null);
        setChatIsActive(false);
        setView('login');
        reloadSessions();
    }, [reloadSessions]);
    
    const handleSelectProvider = useCallback((selectedProvider: AIProvider) => {
        if (selectedProvider === AIProvider.LOCAL_AI || selectedProvider === AIProvider.HUGGING_FACE || selectedProvider === AIProvider.FREE_AI) {
            setProvider(selectedProvider);
            setApiKey(`${selectedProvider}-key`);
            setView('chat');
            setChatIsActive(true);
            return;
        }

        const storedApiKey = localStorage.getItem(`ai_api_key_${selectedProvider}`);
        if (storedApiKey) {
            setProvider(selectedProvider);
            setApiKey(storedApiKey);
            setView('chat');
            setChatIsActive(true);
        } else {
            alert(`API Key for ${selectedProvider} not found. Please add it in Settings.`);
            setView('settings');
        }
    }, []);
    
    const handleStartChat = useCallback((prompt: string, selectedProvider: AIProvider, file: UploadedFile | null, mode: AIMode) => {
        setInitialSession(null);
        setInitialMode(mode);

        if (selectedProvider === AIProvider.LOCAL_AI || selectedProvider === AIProvider.HUGGING_FACE || selectedProvider === AIProvider.FREE_AI) {
            setProvider(selectedProvider);
            setApiKey(`${selectedProvider}-key`);
            setInitialPrompt(prompt);
            setInitialFile(file);
            setView('chat');
            setChatIsActive(true);
            return;
        }
        
        const storedApiKey = localStorage.getItem(`ai_api_key_${selectedProvider}`);
        if (storedApiKey) {
            setProvider(selectedProvider);
            setApiKey(storedApiKey);
            setInitialPrompt(prompt);
            setInitialFile(file);
            setView('chat');
            setChatIsActive(true);
        } else {
            alert(`Please set your API key for ${selectedProvider} before starting a chat.`);
            setView('settings');
        }
    }, []);
    
    const handleLoadChat = useCallback((session: SavedChatSession) => {
        const storedApiKey = localStorage.getItem(`ai_api_key_${session.provider}`);
        if (session.provider === AIProvider.LOCAL_AI || session.provider === AIProvider.HUGGING_FACE || session.provider === AIProvider.FREE_AI || storedApiKey) {
            setProvider(session.provider);
            setApiKey(storedApiKey || `${session.provider}-key`);
            setInitialSession(session);
            setView('chat');
            setChatIsActive(true);
        } else {
            alert(`API Key for ${session.provider} not found. Please add it in Settings.`);
            setView('settings');
        }
    }, []);

    const handleReset = useCallback(() => {
        setProvider(null);
        setApiKey(null);
        setInitialPrompt(null);
        setInitialFile(null);
        setInitialMode(null);
        setInitialSession(null);
        setChatIsActive(false);
        setView('auth');
        reloadSessions();
    }, [reloadSessions]);
    
    const renderContent = () => {
        switch(view) {
            case 'login':
                return <AuthScreen onLogin={handleLogin} />;
            case 'settings':
                if (user) {
                    return <SettingsScreen
                        user={user}
                        onUpdateUser={handleUpdateUser}
                        onLogout={handleLogout}
                        onBack={() => setView(chatIsActive ? 'chat' : 'auth')}
                    />;
                }
                setView('login');
                return null;
             case 'savedChats':
                if (user) {
                    return <SavedChatsScreen
                        savedSessions={savedSessions}
                        onLoadChat={handleLoadChat}
                        onDeleteSession={(sessionId: string) => {
                            const updated = savedSessions.filter(s => s.id !== sessionId);
                            setSavedSessions(updated);
                            localStorage.setItem('saved_chat_sessions', JSON.stringify(updated));
                        }}
                        onBack={() => setView(chatIsActive ? 'chat' : 'auth')}
                    />;
                }
                setView('login');
                return null;
            case 'chat':
                if (provider && apiKey && user) {
                    if (provider === AIProvider.HUGGING_FACE) {
                        const hfApiKey = localStorage.getItem('ai_api_key_Hugging Face');
                        return <HuggingFaceChatApp 
                                    user={user}
                                    onGoToSettings={() => setView('settings')}
                                    onGoToSavedChats={() => setView('savedChats')}
                                    onLogout={handleLogout}
                                    onReset={handleReset} 
                                    hfApiKey={hfApiKey} 
                               />;
                    }
                    return <ChatApp 
                                provider={provider} 
                                apiKey={apiKey} 
                                user={user}
                                onGoToSettings={() => setView('settings')}
                                onGoToSavedChats={() => setView('savedChats')}
                                onLogout={handleLogout}
                                onReset={handleReset}
                                initialPrompt={initialPrompt}
                                setInitialPrompt={setInitialPrompt}
                                initialFile={initialFile}
                                setInitialFile={setInitialFile}
                                initialMode={initialMode}
                                setInitialMode={setInitialMode}
                                initialSession={initialSession}
                                setInitialSession={setInitialSession}
                            />;
                }
                setView('auth');
                return null;
            case 'policy':
                 return <PrivacyPolicy onBack={() => setView(user ? 'auth' : 'login')} />;
            case 'auth':
            default:
                 if (!user) {
                    setView('login');
                    return null;
                 }
                return (
                    <>
                        <ProviderSelectionScreen
                            user={user}
                            onGoToSettings={() => setView('settings')}
                            onGoToSavedChats={() => setView('savedChats')}
                            onSelectProvider={handleSelectProvider}
                            onStartChat={handleStartChat}
                            onLogout={handleLogout}
                        />
                    </>
                );
        }
    };
    
    return (
        <div className="w-full min-h-screen relative flex flex-col bg-background-primary transition-colors">
            <div className="relative z-10 w-full flex-grow flex flex-col">
                <Suspense fallback={<LoadingFallback />}>
                    {renderContent()}
                </Suspense>
            </div>
            {(view === 'auth' || view === 'login') && (
                <>
                    <Footer onShowPolicy={() => setView('policy')} />
                    <Suspense>
                        <CookieConsent />
                    </Suspense>
                </>
            )}
        </div>
    );
};

export default App;
