import React from 'react';
import { Journey } from './types';

interface AgentPanelProps {
    journey: Journey | null;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ journey }) => {
    if (!journey) {
        return <div className="text-gray-500 dark:text-gray-400">No journey selected</div>;
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
                Active agents will be displayed here
            </div>
        </div>
    );
}; 