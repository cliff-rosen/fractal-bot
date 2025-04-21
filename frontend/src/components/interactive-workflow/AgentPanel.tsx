import React from 'react';
import { Journey } from './types';

interface AgentPanelProps {
    journey: Journey | null;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ journey }) => {
    if (!journey) {
        return <div className="text-gray-500 dark:text-gray-400">No journey selected</div>;
    }

    const currentStep = journey.workflow?.steps[journey.workflow.currentStepIndex];

    if (!currentStep) {
        return <div className="text-gray-500 dark:text-gray-400">No active step</div>;
    }

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Active Agent
                </h3>
                <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Type: {currentStep.agentType}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Status: {currentStep.status}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Progress: {currentStep.progress}%
                    </p>
                </div>
            </div>
        </div>
    );
}; 