import React, { useState } from 'react';
import { ChatSection } from './components/ChatSection';
import { AssetsSection } from './components/AssetsSection';
import { AgentsSection } from './components/AgentsSection';
import { AssetModal } from './components/AssetModal';
import { Asset, FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent } from '@/types/agent';
import { FractalBotProvider, useFractalBot } from './context/FractalBotContext';
import { useToast } from '@/components/ui/use-toast';

const FractalBotContent: React.FC = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const { state, processMessage, removeAsset, addAsset, updateAsset, saveAsset } = useFractalBot();
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
        console.log('handleDeleteAsset', assetId)
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

    const handleUploadAndAddAsset = async (file: File): Promise<void> => {
        console.log('handleUploadAndAddAsset', file)

        let newAsset: Asset | null = null;
        try {
            // Create a new asset from the file
            const now = new Date().toISOString();
            newAsset = {
                asset_id: `temp_${Date.now()}`,
                name: file.name,
                description: `Uploaded file: ${file.name}`,
                fileType: FileType.TXT,
                dataType: DataType.UNSTRUCTURED,
                content: null, // Will be set by processFile
                status: AssetStatus.PENDING,
                metadata: {
                    createdAt: now,
                    updatedAt: now,
                    size: file.size,
                    lastModified: file.lastModified
                },
                persistence: {
                    isInDb: false
                }
            };

            // Add the asset to state
            addAsset(newAsset);

            // Process the file and update asset
            const fileContent = await file.text();

            updateAsset(newAsset.asset_id, {
                content: fileContent,
                status: AssetStatus.READY,
                metadata: {
                    ...newAsset.metadata,
                    updatedAt: new Date().toISOString()
                }
            });
            toast({
                title: 'File Added',
                description: 'The file has been successfully processed.',
                variant: 'default'
            });
        } catch (error) {
            console.error('Error processing file:', error);
            if (newAsset) {
                updateAsset(newAsset.asset_id, {
                    status: AssetStatus.ERROR,
                    metadata: {
                        ...newAsset.metadata,
                        updatedAt: new Date().toISOString(),
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    }
                });
            }
            toast({
                title: 'Error',
                description: 'Failed to process the file. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleRetrieveAsset = (asset: Asset) => {
        // Make sure we're using the asset's ID from the database
        const assetToAdd = {
            ...asset,
            persistence: {
                ...asset.persistence,
                isInDb: true
            },
            status: AssetStatus.READY
        };
        // Use the asset_id from the database asset as the key
        addAsset(assetToAdd);
    };

    const handleSaveAsset = async (asset: Asset) => {
        try {
            await saveAsset(asset.asset_id);
            toast({
                title: 'Asset Saved',
                description: 'Successfully saved to database',
                variant: 'default',
                className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
            });
        } catch (error) {
            console.error('Error saving asset:', error);
            toast({
                title: 'Error',
                description: 'Failed to save asset. Please try again.',
                variant: 'destructive',
                className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
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
                    onUploadAndAddAsset={handleUploadAndAddAsset}
                    onRetrieveAsset={handleRetrieveAsset}
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
                    onSaveToDb={handleSaveAsset}
                    onUpdate={(updatedAsset) => {
                        updateAsset(updatedAsset.asset_id, updatedAsset);
                    }}
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