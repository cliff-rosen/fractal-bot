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

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assets</h3>
                <div className="text-gray-500 dark:text-gray-400">
                    No assets generated yet
                </div>
            </div>
        </div>
    );
}; 