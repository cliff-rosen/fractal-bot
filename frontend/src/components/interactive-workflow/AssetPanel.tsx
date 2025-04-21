import React from 'react';
import { Journey, Asset } from './types';

interface AssetPanelProps {
    journey: Journey | null;
}

const getAssetIcon = (asset: Asset) => {
    switch (asset.format) {
        case 'text':
            return '📄';
        case 'json':
            return '📋';
        case 'pdf':
            return '📑';
        case 'image':
            return '🖼️';
        default:
            return '📁';
    }
};

const getAssetColor = (asset: Asset) => {
    switch (asset.type) {
        case 'input':
            return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        case 'output':
            return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        case 'intermediate':
            return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
        default:
            return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
};

export const AssetPanel: React.FC<AssetPanelProps> = ({ journey }) => {
    if (!journey) {
        return <div className="text-gray-500 dark:text-gray-400">No journey selected</div>;
    }

    if (!journey.workspace.assets.length) {
        return <div className="text-gray-500 dark:text-gray-400">No assets generated yet</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
            {journey.workspace.assets.map(asset => (
                <div
                    key={asset.id}
                    className={`${getAssetColor(asset)} rounded-lg p-4 border flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer`}
                >
                    <div className="text-4xl mb-2">{getAssetIcon(asset)}</div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center truncate w-full">
                        {asset.title}
                    </h3>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {asset.type} • {asset.format}
                    </div>
                </div>
            ))}
        </div>
    );
}; 