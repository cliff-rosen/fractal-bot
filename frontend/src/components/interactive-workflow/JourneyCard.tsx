import React from 'react';
import { Journey } from './types';

interface JourneyCardProps {
    journey: Journey;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {journey.title}
                    </h2>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${journey.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        journey.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                        {journey.status}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {journey.creator} • {journey.deliverableType}
                    </div>
                    <div className="flex gap-1">
                        {journey.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}; 