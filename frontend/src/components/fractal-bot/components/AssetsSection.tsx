import React from 'react';
import { Asset } from '../types/state';
import { AssetUploadButton } from '../AssetUploadButton';
import { AssetCard } from './AssetCard';

interface AssetsSectionProps {
    assets: Record<string, Asset>;
    onAssetClick?: (asset: Asset) => void;
    onDeleteAsset?: (assetId: string) => void;
    onUploadAndAddAsset: (file: File) => Promise<void>;
    onRetrieveAsset: (asset: Asset) => void;
}

export const AssetsSection: React.FC<AssetsSectionProps> = ({ assets, onAssetClick, onDeleteAsset, onUploadAndAddAsset, onRetrieveAsset }) => {
    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assets</h2>
                <AssetUploadButton onUploadAndAddAsset={onUploadAndAddAsset} onRetrieveAsset={onRetrieveAsset} />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(assets).map((asset) => (
                        <AssetCard
                            key={asset.asset_id}
                            asset={asset}
                            onClick={onAssetClick}
                            onDelete={onDeleteAsset}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}; 