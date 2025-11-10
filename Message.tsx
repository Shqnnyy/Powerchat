// components/Message.tsx: Renders a single chat message.
import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Role, AIProvider } from '../types';
import { GeminiLogo, UserIcon, OpenAILogo, AnthropicLogo, CohereLogo, DownloadIcon, LocalAIIcon, SpeakerIcon, LoaderIcon, ModelIcon, ServerIcon, CopyIcon, CheckIcon } from './icons';
import { createRipple } from '../utils/uiUtils';

interface MessageProps {
    message: ChatMessage;
    provider: AIProvider;
    onPlayTTS: (messageId: string, text: string) => void;
    ttsState: { messageId: string; status: 'loading' | 'playing' | 'idle' };
}

const getProviderLogo = (provider: AIProvider) => {
    switch (provider) {
        case AIProvider.LOCAL_AI:
            return <LocalAIIcon />;
        case AIProvider.HUGGING_FACE:
            return <ModelIcon />;
        case AIProvider.OLLAMA:
            return <ServerIcon />;
        case AIProvider.GEMINI:
            return <GeminiLogo />;
        case AIProvider.OPENAI:
            return <OpenAILogo />;
        case AIProvider.ANTHROPIC:
            return <AnthropicLogo />;
        case AIProvider.COHERE:
            return <CohereLogo />;
        default:
            return <GeminiLogo />;
    }
}

const Avatar: React.FC<{ role: Role, provider: AIProvider }> = ({ role, provider }) => {
    const isUser = role === 'user';
    const Icon = isUser ? <UserIcon /> : getProviderLogo(provider);
    const bgColor = isUser ? 'bg-blue-500' : 'bg-gray-800';
    const textColor = isUser ? 'text-white' : 'text-gray-200';

    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} ${textColor} flex-shrink-0 transition-colors`}>
            {Icon}
        </div>
    );
};

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-text-tertiary rounded-full animate-pulse-fast"></span>
        <span className="w-2 h-2 bg-text-tertiary rounded-full animate-pulse-medium"></span>
        <span className="w-2 h-2 bg-text-tertiary rounded-full animate-pulse-slow"></span>
    </div>
);

const GroundingLinks: React.FC<{ links: { uri: string; title: string }[] }> = ({ links }) => (
    <div className="mt-4 pt-2">
        <h4 className="text-xs text-text-secondary font-semibold mb-2">Sources:</h4>
        <div className="flex flex-col gap-2">
            {links.map((link, index) => (
                <a
                    key={index}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 dark:text-blue-400 hover:underline truncate"
                    title={link.uri}
                >
                    {index + 1}. {link.title || link.uri}
                </a>
            ))}
        </div>
    </div>
);

const TTSButton: React.FC<{
    messageId: string;
    text: string;
    onPlayTTS: (messageId: string, text: string) => void;
    ttsState: { messageId: string; status: 'loading' | 'playing' | 'idle' };
}> = ({ messageId, text, onPlayTTS, ttsState }) => {
    const isCurrentMessage = ttsState.messageId === messageId;
    const isLoading = isCurrentMessage && ttsState.status === 'loading';
    const isPlaying = isCurrentMessage && ttsState.status === 'playing';

    return (
        <button
            onClick={() => onPlayTTS(messageId, text)}
            onMouseDown={createRipple}
            disabled={isLoading}
            className="btn-ripple p-1.5 rounded-full text-text-tertiary hover:text-accent-primary hover:bg-background-secondary opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Play audio"
        >
            {isLoading ? <LoaderIcon className="w-4 h-4" /> : <SpeakerIcon className={`w-4 h-4 ${isPlaying ? 'text-accent-primary' : ''}`} />}
        </button>
    );
};

const DownloadButton: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const handleDownload = () => {
        const url = message.imageUrl || message.videoUrl;
        if (!url) return;

        const link = document.createElement('a');
        link.href = url;
        
        let extension = 'file';
        if (message.imageUrl) {
            const mimeTypeMatch = message.imageUrl.match(/data:image\/(\w+);base64/);
            if (mimeTypeMatch) {
                extension = mimeTypeMatch[1] === 'jpeg' ? 'jpg' : mimeTypeMatch[1];
            } else {
                const urlMatch = message.imageUrl.match(/\.(\w+)$/);
                extension = urlMatch ? urlMatch[1] : 'jpg';
            }
        } else if (message.videoUrl) {
            extension = 'mp4';
        }

        link.download = `powerchat-generation-${message.id}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleDownload}
            onMouseDown={createRipple}
            className="btn-ripple p-1.5 rounded-full text-text-tertiary hover:text-accent-primary hover:bg-background-secondary opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Download"
        >
            <DownloadIcon className="w-4 h-4" />
        </button>
    );
};


export const Message: React.FC<MessageProps> = memo(({ message, provider, onPlayTTS, ttsState }) => {
    const { id, role, text, imageUrl, videoUrl, isLoading, isError, groundingLinks } = message;
    const [isCopied, setIsCopied] = useState(false);

    const isModel = role === 'model';
    const containerClass = `w-full flex ${role === 'user' ? 'justify-end' : ''}`;
    const canHaveTTS = isModel && !isLoading && !isError && text && provider === AIProvider.GEMINI;
    const canDownload = isModel && !isLoading && !isError && (imageUrl || videoUrl);
    const canCopy = isModel && !isLoading && !isError && text;

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        });
    };

    return (
        <div className={`${containerClass} group`}>
            <div className="flex items-start gap-3 max-w-3xl">
                {isModel && <Avatar role={role} provider={provider} />}
                <div className={`rounded-2xl p-4 transition-colors ${isModel ? 'bg-gray-800 text-gray-200' : 'bg-blue-500 text-white'}`}>
                    {isLoading && <LoadingIndicator />}
                    {isError && <p className="text-red-400">{text}</p>}
                    
                    {!isLoading && !isError && (
                        <>
                            {imageUrl && <img src={imageUrl} alt="uploaded content" className="rounded-lg mb-2 max-w-xs" />}
                            {videoUrl && <video src={videoUrl} controls className="rounded-lg mb-2 max-w-xs" />}
                            {text && (
                                <div className="prose max-w-none prose-invert">
                                    <ReactMarkdown>{text}</ReactMarkdown>
                                </div>
                            )}
                             {groundingLinks && groundingLinks.length > 0 && <GroundingLinks links={groundingLinks} />}
                        </>
                    )}
                </div>
                 {role === 'user' && <Avatar role={role} provider={provider} />}
                <div className="flex flex-col items-center self-start flex-shrink-0 ml-1 space-y-1">
                    {canCopy && (
                         <button
                            onClick={handleCopy}
                            onMouseDown={createRipple}
                            className="btn-ripple p-1.5 rounded-full text-text-tertiary hover:text-accent-primary hover:bg-background-secondary opacity-0 group-hover:opacity-100 transition-all"
                            aria-label="Copy message"
                        >
                            {isCopied ? <CheckIcon className="w-4 h-4 text-accent-success" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                    )}
                    {canHaveTTS && <TTSButton messageId={id} text={text!} onPlayTTS={onPlayTTS} ttsState={ttsState} />}
                    {canDownload && <DownloadButton message={message} />}
                </div>
            </div>
        </div>
    );
});