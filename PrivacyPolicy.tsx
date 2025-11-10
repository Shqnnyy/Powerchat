import React from 'react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="w-full min-h-screen flex flex-col bg-background-primary transition-colors">
            <header 
                className="sticky top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center bg-background-secondary z-20"
                style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
            >
                <button onClick={onBack} className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
                    &larr; Back to App
                </button>
            </header>
            <div className="max-w-4xl mx-auto p-4 sm:p-8 text-text-secondary">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">Privacy Policy</h1>
                <div className="space-y-6 text-sm sm:text-base leading-relaxed break-words">
                    <p><strong>Last Updated:</strong> November 5, 2025</p>

                    <p>
                        Welcome to PowerChat ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we handle your information.
                    </p>
                    <p>
                        Our core principle is simple: <strong>PowerChat is a client-side user interface, not an AI service provider.</strong> We provide the application that runs in your browser, but you connect it to your own AI models via API keys, local servers, or on-device models. We do not have a backend server, and therefore, we never see, store, or have access to your conversations or API keys.
                    </p>


                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">1. How We Handle Your Information</h2>
                    <p>
                        Our Service is designed with a privacy-first architecture. All data is stored and processed either on your local device, on your own local server, or sent directly from your browser to the third-party AI provider you select. We do not have servers that process or store your conversations.
                    </p>
                    <ul className="list-disc list-inside space-y-3 pl-4">
                        <li>
                            <strong>On-Device AI (WebLLM):</strong> When you select the "WebLLM" provider, all AI processing happens entirely within your web browser. This includes both the pre-configured models and any custom models you add. Your prompts and conversation history never leave your device. This mode offers maximum privacy and offline capabilities.
                        </li>
                         <li>
                            <strong>Ollama / Local Server Connection:</strong> When you use the "Ollama" provider, the application sends your prompts and conversation history to the server address you specify on your local network (e.g., an Ollama or LM Studio instance). This data does not pass through our servers. You are responsible for the security and privacy of your own local server.
                        </li>
                        <li>
                            <strong>Cloud AI Providers (Bring Your Own Key):</strong> To use cloud-based AI models (e.g., Gemini, OpenAI, Anthropic, Cohere), you must provide your own API key. The Service uses this key to make requests directly from your browser to the AI provider's servers. Your conversations are between you and the provider; we are not involved.
                        </li>
                         <li>
                            <strong>Local Storage:</strong> To provide a convenient experience, your API keys, Ollama server URL, and custom WebLLM model IDs are stored exclusively in your web browser's <code>localStorage</code>. We do not have access to this information.
                        </li>
                         <li>
                            <strong>Session Data:</strong> Your active conversation history is maintained in your browser's memory during your session. This data is discarded when you close the browser tab or reset the chat.
                        </li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">2. Third-Party Services</h2>
                    <p>
                        When using a cloud provider, our Service acts as an interface. Your prompts and API key are sent directly from your browser to the provider you select. We are not responsible for their data handling practices. We encourage you to review their privacy policies:
                    </p>
                     <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">Google (Gemini)</a></li>
                        <li><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">OpenAI</a></li>
                        <li><a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">Anthropic</a></li>
                        <li><a href="https://cohere.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">Cohere</a></li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">3. Data Security & Storage</h2>
                    <p>
                        Your API keys, Ollama server URL, and custom WebLLM model IDs are stored locally on your device using your browser's <code>localStorage</code>. This means you have full control over your credentials and configuration. Be mindful of using the application on shared or public computers, as this information is stored persistently in the browser profile.
                    </p>
                    
                     <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">4. Your Control Over Information</h2>
                     <p>
                        You have complete control over your data. You can clear your browser's <code>localStorage</code> at any time through your browser's developer tools to permanently delete all stored API keys, server settings, and custom model lists. Using the "Exit Chat" button in the chat interface or the "API Keys" manager on the start screen allows you to manage your settings without manually clearing storage.
                    </p>
                    
                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">5. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;