import React from 'react';
import { Journey } from './types';

interface AssetPanelProps {
    journey: Journey | null;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({ journey }) => {
    if (!journey) {
        return <div className="text-gray-500 dark:text-gray-400">No journey selected</div>;
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
                Generated assets will be displayed here
            </div>
        </div>
    );
}; 