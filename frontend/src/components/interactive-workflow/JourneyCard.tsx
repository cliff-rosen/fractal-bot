import React from 'react';
import { Journey, JourneyState } from './types';

interface JourneyCardProps {
    journey: Journey | null;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey }) => {
    if (!journey) {
        return (
            <div className="relative p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 opacity-60">
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
        <div className={`relative p-4 rounded-lg transition-all duration-300 ${isActive
            ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
            : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 opacity-60'
            }`}>
            {/* Recording Light */}
            {isActive && (
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isRecording
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-green-500'
                        }`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isRecording ? 'Recording' : 'Active'}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="space-y-4">
                {isActive ? (
                    <>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {journey.title}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {journey.goal}
                            </p>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Deliverable
                            </h3>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <p>{journey.deliverable.name}</p>
                                <p className="text-xs mt-1">{journey.deliverable.description}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {journey.state === 'AWAITING_GOAL'
                                ? 'No goal defined yet'
                                : 'Journey completed'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}; 