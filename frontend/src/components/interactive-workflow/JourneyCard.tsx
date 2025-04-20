import React from 'react';
import { Journey } from './types';

interface JourneyCardProps {
    journey: Journey;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{journey.title}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{journey.goal}</p>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {journey.status}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">State</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {journey.state}
                    </span>
                </div>
                {journey.workflow && (
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Workflow</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {journey.workflow.status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}; 