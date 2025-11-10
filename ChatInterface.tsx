// components/ChatInterface.tsx: Renders the chat message history.
import React, { useRef, useEffect } from 'react';
import { ChatMessage, AIProvider } from '../types';
import { Message } from './Message';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    provider: AIProvider;
    onPlayTTS: (messageId: string, text: string) => void;
    ttsState: { messageId: string; status: 'loading' | 'playing' | 'idle' };
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, provider, onPlayTTS, ttsState }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };



    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <main className="flex-grow px-4 pt-16 sm:pt-20 pb-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg) => (
                    <Message 
                        key={msg.id} 
                        message={msg} 
                        provider={provider}
                        onPlayTTS={onPlayTTS}
                        ttsState={ttsState}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </main>
    );
};