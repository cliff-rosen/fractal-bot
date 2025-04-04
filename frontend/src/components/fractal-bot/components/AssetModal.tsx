import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentIcon, CheckCircleIcon, DocumentDuplicateIcon, XCircleIcon, CloudIcon, ServerIcon, ArrowDownTrayIcon, PencilIcon } from '@heroicons/react/24/outline';
import { FileType, DataType, Asset, AssetStatus } from '@/types/asset';
import { getAssetIcon } from '@/lib/utils/assets/assetIconUtils';
import { EmailListView } from './EmailListView';
import { GenericListView } from './GenericListView';

interface AssetModalProps {
    asset: Asset;
    onClose: () => void;
    onSaveToDb?: (asset: Asset) => Promise<void>;
    onUpdate?: (asset: Asset) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose, onSaveToDb, onUpdate }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(asset.name);
    const [editedDescription, setEditedDescription] = useState(asset.description || '');

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (!onUpdate) return;

        const updatedAsset = {
            ...asset,
            name: editedName,
            description: editedDescription,
            persistence: {
                ...asset.persistence,
                isDirty: true
            }
        };

        onUpdate(updatedAsset);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedName(asset.name);
        setEditedDescription(asset.description || '');
        setIsEditing(false);
    };

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
        setIsSaving(true);

        // Create processing asset
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
            // Pass the processing asset to onSaveToDb
            await onSaveToDb(processingAsset);

            // Update status to ready after successful save
            const savedAsset = {
                ...processingAsset,
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
                ...processingAsset,
                status: AssetStatus.ERROR,
                metadata: {
                    ...processingAsset.metadata,
                    updatedAt: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Failed to save asset'
                }
            };
            onUpdate(errorAsset);
        } finally {
            setIsSaving(false);
        }
    };

    const renderContent = () => {
        // Special handling for email list data type
        if (asset.dataType === DataType.EMAIL_LIST) {
            return <EmailListView asset={asset} />;
        }

        // Special handling for generic list data type
        if (asset.dataType === DataType.GENERIC_LIST) {
            return <GenericListView asset={asset} />;
        }

        // Default view for other types
        return (
            <pre className="h-full overflow-auto p-4 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 rounded-lg font-mono text-sm whitespace-pre">
                {typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2)}
            </pre>
        );
    };

    // Determine if save button should be shown
    const showSaveButton = !asset.persistence.isInDb || asset.persistence.isDirty;

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-8">
                <Dialog.Panel className="h-[calc(100vh-4rem)] max-w-4xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-300">
                                {getAssetIcon(asset.fileType, asset.dataType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="w-full px-2 py-1 text-lg font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                            placeholder="Asset name"
                                        />
                                        <input
                                            type="text"
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                            placeholder="Description (optional)"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveEdit}
                                                className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {asset.name}
                                        </Dialog.Title>
                                        {asset.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                                {asset.description}
                                            </p>
                                        )}
                                        <button
                                            onClick={handleEdit}
                                            className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 ml-4"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 overflow-hidden flex flex-col">
                        {/* Metadata */}
                        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-300 flex-shrink-0">
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
                                        disabled={isSaving}
                                        className={`ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${isSaving
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 cursor-not-allowed'
                                            : 'text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                            }`}
                                    >
                                        <ArrowDownTrayIcon className={`h-4 w-4 ${isSaving ? 'animate-bounce' : ''}`} />
                                        {isSaving ? 'Saving...' : 'Save to DB'}
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
                        <div className="flex-1 overflow-hidden">
                            {renderContent()}
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}; 