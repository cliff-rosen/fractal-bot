import React from 'react';
import { Journey } from './types';

interface JourneyCardProps {
    journey: Journey;
    onSelect: (journey: Journey) => void;
    className?: string;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
    journey,
    onSelect,
    className = ''
}) => {
    const getStatusColor = (status: Journey['status']) => {
        switch (status) {
            case 'active':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`}
            onClick={() => onSelect(journey)}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {journey.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {journey.goal}
                    </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(journey.status)}`}>
                    {journey.status}
                </span>
            </div>

            <div className="mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(journey.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {journey.creator}
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {journey.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {journey.workflow && (
                    <div className="mt-4">
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                                style={{
                                    width: `${(journey.workflow.currentStepIndex + 1) / journey.workflow.steps.length * 100}%`
                                }}
                            />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Step {journey.workflow.currentStepIndex + 1} of {journey.workflow.steps.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 