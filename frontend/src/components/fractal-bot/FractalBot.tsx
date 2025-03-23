import React, { useState } from 'react';
import { ChatSection } from './components/ChatSection';
import { AssetsSection } from './components/AssetsSection';
import { AgentsSection } from './components/AgentsSection';
import { AssetModal } from './components/AssetModal';
import { Asset, Agent, AssetType, AssetStatus } from './types/state';
import { FractalBotProvider, useFractalBot } from './context/FractalBotContext';
import { useToast } from '@/components/ui/use-toast';

const FractalBotContent: React.FC = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const { state, processMessage, removeAsset, addAsset } = useFractalBot();
    const { messages, agents, assets } = state;
    const { toast } = useToast();

    const handleSendMessage = async (message: string) => {
        setInputMessage('');
        await processMessage(message);
    };

    const handleAssetClick = (asset: Asset) => {
        setSelectedAsset(asset);
    };

    const handleAgentClick = (agent: Agent) => {
        // TODO: Implement agent handling logic
        console.log('Agent clicked:', agent);
    };

    const handleDeleteAsset = (assetId: string) => {
        try {
            removeAsset(assetId);
            toast({
                title: 'Asset Deleted',
                description: 'The asset has been successfully deleted.',
                variant: 'default'
            });
        } catch (error) {
            console.error('Error deleting asset:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete the asset. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleUploadAsset = async (file: File) => {
        try {
            // Create a new asset from the file
            const newAsset: Asset = {
                asset_id: `file_${Date.now()}`,
                name: file.name,
                description: `Uploaded file: ${file.name}`,
                type: AssetType.TEXT, // You might want to determine this based on file type
                content: await file.text(), // For text files. You might want to handle different file types differently
                status: AssetStatus.READY,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                }
            };

            addAsset(newAsset);
            toast({
                title: 'File Uploaded',
                description: 'The file has been successfully uploaded.',
                variant: 'default'
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload the file. Please try again.',
                variant: 'destructive'
            });
        }
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
            <div className="flex-1 min-w-[400px]">
                <AssetsSection
                    assets={assets}
                    onAssetClick={handleAssetClick}
                    onDeleteAsset={handleDeleteAsset}
                    onUploadAsset={handleUploadAsset}
                />
            </div>

            {/* Right Panel: Agents */}
            <div className="w-[450px] flex-shrink-0">
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
                    isOpen={!!selectedAsset}
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