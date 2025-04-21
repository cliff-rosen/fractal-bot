import React from 'react';
import { Journey, JourneyState } from './types';

interface JourneyCardProps {
    journey: Journey | null;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
    if (!journey) {
        return (
            <div className="h-32 relative p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 opacity-60">
                <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No journey started yet
                    </p>
                </div>
            </div>
        );
    }

    const isActive = journey.state !== 'AWAITING_GOAL' && journey.state !== 'WORKFLOW_COMPLETE';
    const isRecording = journey.state === 'WORKFLOW_IN_PROGRESS';

    return (
        <div className={`h-32 relative p-4 rounded-lg transition-all duration-300 ${isActive
            ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
            : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 opacity-60'
            }`}>
            <div className="flex gap-4 h-full">
                {/* Left Column */}
                <div className="flex-1 overflow-hidden">
                    <div className="space-y-2">
                        {isActive ? (
                            <>
                                <div>
                                    <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {journey.title}
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {journey.goal}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {journey.state === 'AWAITING_GOAL'
                                        ? 'No goal defined yet'
                                        : 'Journey completed'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-48 border-l border-gray-200 dark:border-gray-700 pl-4">
                    {/* Recording Light */}
                    {isActive && (
                        <div className="mb-2 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isRecording
                                ? 'bg-red-500 animate-pulse'
                                : 'bg-green-500'
                                }`} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isRecording ? 'ACTIVE' : 'Active'}
                            </span>
                        </div>
                    )}

                    {/* Deliverable */}
                    {isActive && (
                        <div className="space-y-1">
                            <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                Deliverable
                            </h3>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <p className="truncate">{journey.deliverable.name}</p>
                                <p className="line-clamp-2">{journey.deliverable.description}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 