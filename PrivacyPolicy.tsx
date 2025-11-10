import React from 'react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="w-full min-h-screen flex flex-col bg-background-primary transition-colors">
            <header className="sticky top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center bg-background-secondary z-20">
                <button onClick={onBack} className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
                    &larr; Back to App
                </button>
            </header>
            <div className="max-w-4xl mx-auto p-4 sm:p-8 text-text-secondary">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">Privacy Policy</h1>
                <div className="space-y-6 text-sm sm:text-base leading-relaxed">
                    <p><strong>Last Updated:</strong> November 5, 2025</p>

                    <p>
                        Welcome to PowerChat ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our web application (the "Service").
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">1. How We Handle Your Information</h2>
                    <p>
                        Our Service is designed with a privacy-first approach. All data is stored and processed either on your local device or sent directly to the third-party AI provider you select.
                    </p>
                    <ul className="list-disc list-inside space-y-3 pl-4">
                        <li>
                            <strong>Local AI Agent:</strong> When you use the "Local Agent" provider, all AI processing happens entirely within your web browser. Your prompts, uploaded files, and conversation history never leave your device and are not sent to any external server. This mode offers maximum privacy.
                        </li>
                        <li>
                            <strong>Cloud AI Providers:</strong> To use cloud-based AI models (e.g., Gemini, OpenAI), you must provide your own API key. This key is stored exclusively in your web browser's `localStorage` to allow for easy switching between providers without re-entering it.
                        </li>
                         <li>
                            <strong>Session Data:</strong> Your active conversation history is maintained in your browser's memory during your session to provide a seamless experience. This data is lost when you close the browser tab.
                        </li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">2. Third-Party Services</h2>
                    <p>
                        When using a cloud provider, our Service acts as an interface. Your prompts and API key are sent directly to the provider you select. We are not responsible for their data handling practices. We encourage you to review their privacy policies:
                    </p>
                     <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">Google (Gemini)</a></li>
                        <li><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">OpenAI</a></li>
                        <li><a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">Anthropic</a></li>
                        <li><a href="https://cohere.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">Cohere</a></li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">3. Data Security & Storage</h2>
                    <p>
                        Your API keys are stored locally on your device using your browser's `localStorage`. This means you have full control over them. Be mindful of using the application on shared or public computers. We do not have access to this information.
                    </p>
                    
                     <h2 className="text-xl sm:text-2xl font-semibold text-text-primary pt-4">4. Your Control Over Information</h2>
                     <p>
                        You have complete control over your data. You can clear your `localStorage` at any time through your browser's developer tools to permanently delete all stored API keys. The "Change" button in the chat interface resets your current session and allows you to select a different provider, but it does not delete your saved keys.
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