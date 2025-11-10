// components/icons.tsx: Provides SVG icons as React components.
import React from 'react';

// FIX: Update all icon components to accept React.SVGProps<SVGSVGElement> to allow passing props like className.
// This resolves multiple TypeScript errors across the application where icons were used with class names for styling.
// FIX: Add all missing icon exports to resolve import errors across the application.
const SVGIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {props.children}
    </svg>
);

export const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props} className={`animate-spin ${props.className}`}>
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </SVGIcon>
);

export const UploadFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </SVGIcon>
);

export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </SVGIcon>
);

export const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </SVGIcon>
);

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
    </SVGIcon>
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props} viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" />
    </SVGIcon>
);

export const GearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </SVGIcon>
);

export const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
    </SVGIcon>
);

export const GeminiLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props} strokeWidth="1.5" viewBox="0 0 24 24">
       <path d="M12 2L9.5 9.5H2l7.5 5.5L7 22l5-4.5 5 4.5-2.5-7L22 9.5h-7.5L12 2z" stroke="currentColor" fill="currentColor"/>
    </SVGIcon>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </SVGIcon>
);

export const OpenAILogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props} viewBox="0 0 24 24" strokeWidth="1.5">
        <path d="M21.282 13.2L24 12l-2.718-.8-2.119-2.119L18.364 7l-2.119-2.119-2.718-.8L12 6.8l-1.527-2.719-2.718.8-2.119 2.119L3.636 9l-2.119 2.119L0 12l2.718.8 2.119 2.119L6.836 17l2.119 2.119 2.718.8L12 17.2l1.527 2.719 2.718-.8 2.119-2.119L20.364 15l2.119-2.119-1.2-1.681zM8.883 15.118l-1.041-1.041.52-.521 1.041 1.041-.52.521zm4.158-4.158l-1.041-1.041.52-.521 1.041 1.041-.52.521zm-.521 3.118l-1.041-1.041.521-.52 1.041 1.041-.521.52zm-2.082-5.2l1.041 1.041-.52.521-1.041-1.041.52-.521zm-1.041 3.122l1.562-1.562-1.562-1.562-1.562 1.562 1.562 1.562zm5.723 2.6l-1.562 1.562-1.562-1.562 1.562-1.562 1.562 1.562zM12 12l-1.041-1.041.52-.521L12 10.959l.521.52-1.041 1.041zm2.6-1.562l-1.562-1.562 1.562-1.562 1.562 1.562-1.562 1.562z" fill="currentColor" stroke="none" />
    </SVGIcon>
);

export const AnthropicLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props} viewBox="0 0 24 24" strokeWidth="1.5" stroke="none" fill="currentColor">
       <path d="M3.13 12.002C3.13 5.986 8.07 1 14.122 1c4.582 0 8.35 2.723 8.35 6.098 0 1.953-.92 3.73-2.393 4.904-1.092.868-2.47 1.378-4.04 1.378-2.583 0-4.665-2.097-4.665-4.693 0-2.596 2.082-4.692 4.665-4.692.932 0 1.76.28 2.47.74l1.16-1.594C18.675 2.4 16.54 1.83 14.12 1.83c-5.647 0-10.162 4.46-10.162 9.998 0 5.537 4.515 9.998 10.163 9.998 5.647 0 10.162-4.46 10.162-9.998v-1.17h-5.46v1.17c0 2.596-2.082 4.693-4.665 4.693s-4.7-2.097-4.7-4.693z" />
    </SVGIcon>
);

export const CohereLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props} viewBox="0 0 24 24" stroke="none" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        <path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0" />
    </SVGIcon>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </SVGIcon>
);

export const LocalAIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M9 18V5l7 4-7 4" />
        <path d="M14 16.5c-3.14-1-4-3-4-4.5" />
        <path d="M19 20a4 4 0 1 0-8 0" />
        <path d="M13.5 8.5c-1-.5-2-1-2-1.5" />
        <path d="M6 11V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M5 16a2 2 0 1 0 4 0" />
    </SVGIcon>
);

export const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </SVGIcon>
);

export const ModelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </SVGIcon>
);

export const ServerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
    </SVGIcon>
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </SVGIcon>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <polyline points="20 6 9 17 4 12" />
    </SVGIcon>
);

export const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </SVGIcon>
);

export const ChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </SVGIcon>
);

export const ThinkingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5v.43a4.5 4.5 0 0 0-4.43 4.5 4.5 4.5 0 0 0 4.43 4.5v.14a4.5 4.5 0 1 0 9 0v-.14a4.5 4.5 0 0 0 4.43-4.5 4.5 4.5 0 0 0-4.43-4.5v-.43A4.5 4.5 0 0 0 12 2Z" />
        <path d="M12 2v20" />
        <path d="M22 12h-2.5" />
        <path d="M4.5 12H2" />
    </SVGIcon>
);

export const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </SVGIcon>
);

export const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </SVGIcon>
);

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </SVGIcon>
);

export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </SVGIcon>
);

export const LightningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </SVGIcon>
);

export const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </SVGIcon>
);

export const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M12.07 7.78 10 2 7.93 7.78" />
        <path d="M5.05 13.95 2.12 11.02" />
        <path d="M21.88 11.02 18.95 13.95" />
        <path d="M12 22a4.5 4.5 0 0 0 4.5-4.5c0-2.2-1.83-4-4.05-4" />
        <path d="M12 22a4.5 4.5 0 0 1-4.5-4.5c0-2.2 1.83-4 4.05-4" />
    </SVGIcon>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M12 2L9.5 9.5H2l7.5 5.5L7 22l5-4.5 5 4.5-2.5-7L22 9.5h-7.5L12 2z" />
    </SVGIcon>
);

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </SVGIcon>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <polyline points="6 9 12 15 18 9" />
    </SVGIcon>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </SVGIcon>
);

export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </SVGIcon>
);

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props} viewBox="0 0 24 24" stroke="none" fill="currentColor">
        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/>
    </SVGIcon>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </SVGIcon>
);

export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </SVGIcon>
);

export const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SVGIcon {...props}>
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </SVGIcon>
);
