import React, { useEffect, useState } from 'react';
import { DocumentIcon, DocumentDuplicateIcon, CheckCircleIcon, XCircleIcon, TrashIcon, CloudIcon } from '@heroicons/react/24/outline';
import { Asset, AssetStatus } from '@/types/asset';
import { getAssetIcon } from '../utils/assetUtils';

interface AssetCardProps {
    asset: Asset;
    onClick?: (asset: Asset) => void;
    onDelete?: (assetId: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, onDelete }) => {
    const [isDirty, setIsDirty] = useState(asset.persistence.isDirty || false);

    useEffect(() => {
        setIsDirty(asset.persistence.isDirty || false);
    }, [asset.persistence.isDirty]);

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

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this asset?')) {
            onDelete?.(asset.asset_id);
        }
    };

    return (
        <div
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer w-full min-h-[80px]"
            onClick={() => onClick?.(asset)}
        >
            <div className="p-3">
                <div className="flex items-center w-full gap-3">
                    {/* Left: Icon */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {getAssetIcon(asset.fileType, asset.dataType)}
                    </div>

                    {/* Middle: Name and Description */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {asset.name || 'Unnamed Asset'}
                        </h3>
                        {asset.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {asset.description}
                            </p>
                        )}
                    </div>

                    {/* Right: Status Icons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusIcon(asset.status)}
                        {asset.persistence.isInDb ? (
                            <div className="relative">
                                <CloudIcon className={`h-4 w-4 ${isDirty ? 'text-yellow-500' : 'text-blue-500'}`} />
                                {isDirty && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <CloudIcon className="h-4 w-4 text-red-500" />
                                <div className="absolute inset-0 border-t border-red-500 transform rotate-45 translate-y-1/2"></div>
                            </div>
                        )}
                        {onDelete && (
                            <button
                                onClick={handleDeleteClick}
                                className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 