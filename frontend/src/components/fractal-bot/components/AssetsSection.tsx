import React, { useState } from 'react';
import { DocumentIcon, DocumentTextIcon, DocumentDuplicateIcon, CheckCircleIcon, XCircleIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Asset, AssetStatus, AssetType } from '../types/state';
import { getAssetIcon } from '../utils/assetUtils.tsx';

interface AssetsSectionProps {
    assets: Record<string, Asset>;
    onAssetClick?: (asset: Asset) => void;
    onDeleteAsset?: (assetId: string) => void;
    onUploadAsset?: (file: File) => void;
}

export const AssetsSection: React.FC<AssetsSectionProps> = ({ assets, onAssetClick, onDeleteAsset, onUploadAsset }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const getStatusIcon = (status: AssetStatus) => {
        switch (status) {
            case AssetStatus.READY:
                return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
            case AssetStatus.PENDING:
                return <DocumentDuplicateIcon className="h-4 w-4 text-yellow-500" />;
            case AssetStatus.ERROR:
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            default:
                return <DocumentIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, assetId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this asset?')) {
            onDeleteAsset?.(assetId);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUploadAsset?.(file);
        }
        // Reset the input value so the same file can be selected again
        e.target.value = '';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Assets</h3>
                <button
                    onClick={handleUploadClick}
                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Upload
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(assets).map((asset) => (
                        <div
                            key={asset.asset_id}
                            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer overflow-hidden"
                            onClick={() => onAssetClick?.(asset)}
                        >
                            <div className="p-4 space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        {getAssetIcon(asset.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                {asset.name || 'Unnamed Asset'}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(e, asset.asset_id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {asset.description || 'No description available'}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                                                {asset.type}
                                            </span>
                                            {asset.metadata?.createdAt && (
                                                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                                                    Created: {new Date(asset.metadata.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 