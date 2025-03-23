import React, { useState } from 'react';
import { ChatSection } from './components/ChatSection';
import { AssetsSection } from './components/AssetsSection';
import { AgentsSection } from './components/AgentsSection';
import { AssetModal } from './components/AssetModal';
import { Asset, Agent } from './types/state';
import { FractalBotProvider, useFractalBot } from './context/FractalBotContext';

const FractalBotContent: React.FC = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const { state, processMessage } = useFractalBot();
    const { messages, agents, assets } = state;

    const handleSendMessage = async (message: string) => {
        await processMessage(message);
        setInputMessage('');
    };

    const handleAssetClick = (asset: Asset) => {
        setSelectedAsset(asset);
    };

    const handleAgentClick = (agent: Agent) => {
        // TODO: Implement agent handling logic
        console.log('Agent clicked:', agent);
    };

    return (
        <div className="flex h-screen gap-4 p-4 bg-gray-50 dark:bg-gray-900">
            {/* Left Panel: Chat */}
            <div className="w-[500px] flex-shrink-0 h-full">
                <ChatSection
                    messages={messages}
                    inputMessage={inputMessage}
                    isProcessing={state.metadata.isProcessing}
                    onSendMessage={handleSendMessage}
                    onInputChange={setInputMessage}
                />
            </div>

            {/* Middle Panel: Assets */}
            <div className="w-[400px] flex-shrink-0">
                <AssetsSection
                    assets={assets}
                    onAssetClick={handleAssetClick}
                />
            </div>

            {/* Right Panel: Agents */}
            <div className="flex-1 min-w-[400px]">
                <AgentsSection
                    agents={Object.values(agents)}
                    onAgentClick={handleAgentClick}
                />
            </div>

            {/* Asset Modal */}
            {selectedAsset && (
                <AssetModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                />
            )}
        </div>
    );
};

const FractalBot: React.FC = () => {
    return (
        <FractalBotProvider>
            <React.Suspense fallback={<div>Loading...</div>}>
                <FractalBotContent />
            </React.Suspense>
        </FractalBotProvider>
    );
};

export default FractalBot; 