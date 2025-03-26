import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentIcon, CheckCircleIcon, DocumentDuplicateIcon, XCircleIcon, CloudIcon, ServerIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { FileType, DataType, Asset, AssetStatus } from '@/types/asset';
import { getAssetIcon } from '../utils/assetUtils';
import { EmailListView } from '../EmailListView';

interface AssetModalProps {
    asset: Asset;
    onClose: () => void;
    onSaveToDb?: (asset: Asset) => Promise<void>;
    onUpdate?: (asset: Asset) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose, onSaveToDb, onUpdate }) => {
    const getStatusIcon = (status: AssetStatus) => {
        switch (status) {
            case AssetStatus.READY:
                return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
            case AssetStatus.PENDING:
                return <DocumentDuplicateIcon className="h-4 w-4 text-yellow-500" />;
            case AssetStatus.ERROR:
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            default:
                return <DocumentIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    const handleSaveToDb = async () => {
        if (!onSaveToDb || !onUpdate) return;

        // Update status to processing before save
        const processingAsset = {
            ...asset,
            status: AssetStatus.PROCESSING,
            metadata: {
                ...asset.metadata,
                updatedAt: new Date().toISOString()
            }
        };
        onUpdate(processingAsset);

        try {
            // Pass the processing asset to onSaveToDb, not the original
            await onSaveToDb(processingAsset);

            // Update status to ready after successful save
            const savedAsset = {
                ...processingAsset,  // Use processingAsset as base
                status: AssetStatus.READY,
                persistence: {
                    ...processingAsset.persistence,
                    isInDb: true,
                    isDirty: false,
                    lastSyncedAt: new Date().toISOString()
                },
                metadata: {
                    ...processingAsset.metadata,
                    updatedAt: new Date().toISOString()
                }
            };
            onUpdate(savedAsset);
        } catch (error) {
            // Update status to error if save fails
            const errorAsset = {
                ...processingAsset,  // Use processingAsset as base
                status: AssetStatus.ERROR,
                metadata: {
                    ...processingAsset.metadata,
                    updatedAt: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Failed to save asset'
                }
            };
            onUpdate(errorAsset);
        }
    };

    const renderContent = () => {
        // Special handling for email list data type
        if (asset.dataType === DataType.EMAIL_LIST) {
            return <EmailListView asset={asset} />;
        }

        // Default JSON view for other types
        return (
            <pre className="whitespace-pre-wrap overflow-auto max-h-[60vh] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {JSON.stringify(asset.content, null, 2)}
            </pre>
        );
    };

    // Determine if save button should be shown
    const showSaveButton = !asset.persistence.isInDb || asset.persistence.isDirty;

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                {getAssetIcon(asset.fileType, asset.dataType)}
                            </div>
                            <div>
                                <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                                    {asset.name}
                                </Dialog.Title>
                                {asset.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {asset.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Metadata */}
                        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                {getStatusIcon(asset.status)}
                                <span>{asset.status}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {asset.persistence.isInDb ? (
                                    <div className="relative">
                                        <CloudIcon className={`h-4 w-4 ${asset.persistence.isDirty ? 'text-yellow-500' : 'text-blue-500'}`} />
                                        {asset.persistence.isDirty && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <CloudIcon className="h-4 w-4 text-red-500" />
                                        <div className="absolute inset-0 border-t border-red-500 transform rotate-45 translate-y-1/2"></div>
                                    </div>
                                )}
                                <span>{asset.persistence.isInDb ? (asset.persistence.isDirty ? 'Modified' : 'Saved') : 'Local'}</span>
                                {showSaveButton && onSaveToDb && (
                                    <button
                                        onClick={handleSaveToDb}
                                        className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                        Save to DB
                                    </button>
                                )}
                            </div>
                            <div>
                                Created: {new Date(asset.metadata.createdAt).toLocaleString()}
                            </div>
                            <div>
                                Updated: {new Date(asset.metadata.updatedAt).toLocaleString()}
                            </div>
                        </div>

                        {/* Asset Content */}
                        {renderContent()}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}; 