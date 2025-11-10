// types.ts: Defines shared types and enums for the application.

// FIX: Moved the AIStudio interface definition inside the `declare global` block and removed the `export` keyword. This resolves a TypeScript error about subsequent property declarations having mismatched types by ensuring `AIStudio` is treated as a global type, which is appropriate for augmenting the global `window` object and prevents module resolution conflicts.
// Add Google Identity Services client to the window object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Add webkitAudioContext to the window type to support older Safari browsers
    // and resolve TypeScript errors.
    webkitAudioContext?: typeof AudioContext;
    aistudio?: AIStudio;
  }
}

export enum AIProvider {
    LOCAL_AI = 'Local Agent',
    HUGGING_FACE = 'Hugging Face',
    OLLAMA = 'Ollama',
    GEMINI = 'Gemini',
    OPENAI = 'ChatGPT',
    ANTHROPIC = 'Anthropic',
    COHERE = 'Cohere',
    FREE_AI = 'Free Models',
}

export enum AIMode {
    CHAT = 'Chat',
    THINKING = 'Advanced Reasoning',
    LOW_LATENCY = 'Low Latency',
    IMAGE_GEN = 'Image Generation',
    ARTISTIC_GEN = 'Artistic Generation',
    IMAGE_EDITING = 'Image Editing',
    IMAGE_UNDERSTANDING = 'Image Understanding',
    VIDEO_UNDERSTANDING = 'Video Understanding',
    LIVE_CONVERSATION = 'Live Conversation',
    SEARCH = 'Web Search',
    MAPS = 'Maps Search',
}

export type Role = 'user' | 'model';

export interface GroundingLink {
    uri: string;
    title: string;
}

export interface ChatMessage {
    id: string;
    role: Role;
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    isTtsLoading?: boolean;
    isLoading?: boolean;
    isError?: boolean;
    groundingLinks?: GroundingLink[];
    base64Data?: string;
    mimeType?: string;
}

export interface UploadedFile {
    name: string;
    type: 'image' | 'video';
    mimeType: string;
    data: string; // base64 data
    url: string; // object URL for preview
}

export interface Geolocation {
    latitude: number;
    longitude: number;
}

export interface WebLLMSettings {
    temperature: number;
    topP: number;
}

export interface SavedChatSession {
  id: string;
  title: string;
  provider: AIProvider;
  mode: AIMode;
  messages: ChatMessage[];
  timestamp: number;
}


// FIX: Add User interface to resolve import error in MockGoogleLogin.tsx.
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}