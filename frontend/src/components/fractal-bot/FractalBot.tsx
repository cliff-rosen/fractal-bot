import React, { useState } from 'react';
import { ChatSection } from './components/ChatSection';
import { AssetsSection } from './components/AssetsSection';
import { Asset, FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent } from '@/types/agent';
import { useFractalBot } from '@/context/FractalBotContext';
import { useToast } from '@/components/ui/use-toast';
import { getFileType, getDataType } from '@/lib/utils/assets/assetUtils';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import Workspace from './components/Workspace';
import { mockDataSnapshots } from './types/data';

const FractalBotContent: React.FC = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const { state, processMessage, removeAsset, addAsset, updateAsset, saveAsset } = useFractalBot();
    const { messages, agents, assets } = state;
    const { toast } = useToast();

    const currentDataSnapshotIdx = 0;

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
            const fileType = getFileType(file);
            const dataType = getDataType(file);

            newAsset = {
                asset_id: `temp_${Date.now()}`,
                name: file.name,
                description: `Uploaded file: ${file.name}`,
                fileType,
                dataType,
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
            let processedContent = fileContent;

            // If it's a JSON file, parse it
            if (fileType === FileType.JSON) {
                try {
                    processedContent = JSON.parse(fileContent);
                } catch (error) {
                    throw new Error('Invalid JSON file');
                }
            }

            updateAsset(newAsset.asset_id, {
                content: processedContent,
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

    const handleApproveAgent = (agent: Agent) => {
        console.log('handleApproveAgent', agent)

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
        console.log('handleSaveAsset', asset)
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
        <div className="flex-1 min-h-0 pt-14">
            <div className="grid grid-cols-12 gap-6 h-full">
                {/* Left Chat Rail (cols 1-3) */}
                <div className="col-span-3 h-full overflow-hidden">
                    <ChatSection
                        messages={messages}
                        inputMessage={inputMessage}
                        isProcessing={state.metadata.isProcessing}
                        onSendMessage={handleSendMessage}
                        onInputChange={setInputMessage}
                    />
                </div>

                {/* Main Content Area (cols 4-9) */}
                <div className="col-span-6 h-full flex flex-col">
                    {/* Mission Header */}
                    <div className="sticky top-14 z-30 bg-white shadow-lg rounded-2xl p-6 mb-6">
                        <Mission mission={mockDataSnapshots[currentDataSnapshotIdx].mission} />
                    </div>

                    {/* Stage Tracker */}
                    <div className="mb-6">
                        <Workflow
                            workflow={mockDataSnapshots[currentDataSnapshotIdx].mission.workflow}
                            workspaceState={mockDataSnapshots[currentDataSnapshotIdx].workspaceState}
                        />
                    </div>

                    {/* Workspace Canvas */}
                    <div className="flex-1 overflow-y-auto">
                        <Workspace workspace={mockDataSnapshots[currentDataSnapshotIdx].workspace} />
                    </div>
                </div>

                {/* Right Assets Rail (cols 10-12) */}
                <div className="col-span-3 h-full overflow-hidden">
                    <AssetsSection
                        assets={assets}
                        onAssetClick={handleAssetClick}
                        onDeleteAsset={handleDeleteAsset}
                        onUploadAndAddAsset={handleUploadAndAddAsset}
                        onRetrieveAsset={handleRetrieveAsset}
                    />
                </div>
            </div>
        </div>
    );
};

const FractalBot: React.FC = () => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <FractalBotContent />
        </React.Suspense>
    );
};

export default FractalBot; 