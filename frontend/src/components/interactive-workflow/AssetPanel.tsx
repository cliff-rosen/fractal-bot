import React from 'react';
import { Journey } from './types';

interface AssetPanelProps {
    journey: Journey | null;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({ journey }) => {
    if (!journey) {
        return <div className="text-gray-500 dark:text-gray-400">No journey selected</div>;
    }

    if (!journey.workspace.assets.length) {
        return <div className="text-gray-500 dark:text-gray-400">No assets generated yet</div>;
    }

    return (
        <div className="space-y-4">
            {journey.workspace.assets.map(asset => (
                <div key={asset.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {asset.title}
                    </h3>
                    <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Type: {asset.type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Format: {asset.format}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Content: {asset.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}; 