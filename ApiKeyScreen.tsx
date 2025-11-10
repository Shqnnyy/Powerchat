import React from 'react';

// This component is no longer used after introducing the centralized ApiKeyManager.
// It is kept to avoid breaking lazy imports but does not render anything.
export const ApiKeyScreen: React.FC = () => {
    return null;
};

export default ApiKeyScreen;
