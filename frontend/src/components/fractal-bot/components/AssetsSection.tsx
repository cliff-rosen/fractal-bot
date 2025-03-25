import React, { useState } from 'react';
import { DocumentIcon, DocumentTextIcon, DocumentDuplicateIcon, CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Asset, AssetStatus, AssetType } from '../types/state';
import { getAssetIcon } from '../utils/assetUtils.tsx';
import { AssetUploadButton } from '../AssetUploadButton';

interface AssetsSectionProps {
    assets: Record<string, Asset>;
    onAssetClick?: (asset: Asset) => void;
    onDeleteAsset?: (assetId: string) => void;
    onUploadAsset: (file: File) => Promise<void>;
    onRetrieveAsset: (asset: Asset) => void;
}

export const AssetsSection: React.FC<AssetsSectionProps> = ({ assets, onAssetClick, onDeleteAsset, onUploadAsset, onRetrieveAsset }) => {
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

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assets</h2>
                <AssetUploadButton onUploadAsset={onUploadAsset} onRetrieveAsset={onRetrieveAsset} />
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(assets).map((asset) => (
                        <div
                            key={asset.asset_id}
                            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer overflow-hidden"
                            onClick={() => onAssetClick?.(asset)}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        {getAssetIcon(asset.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                {asset.name || 'Unnamed Asset'}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.status === AssetStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    asset.status === AssetStatus.READY ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        asset.status === AssetStatus.ERROR ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                    }`}>
                                                    {asset.status}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, asset.asset_id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {asset.description && (
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {asset.description}
                                            </p>
                                        )}
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