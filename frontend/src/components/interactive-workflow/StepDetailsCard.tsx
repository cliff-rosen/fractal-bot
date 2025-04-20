import React from 'react';
import { WorkflowStep } from './types';

interface StepDetailsCardProps {
    step: WorkflowStep;
}

export const StepDetailsCard: React.FC<StepDetailsCardProps> = ({ step }) => {
    return (
        <div className="p-4 space-y-4">
            {/* Step Header */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {step.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                </p>
            </div>

            {/* Step Status */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Status</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {step.status}
                </div>
            </div>

            {/* Step Output */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Output</h3>
                <pre className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {JSON.stringify(step.outputs, null, 2)}
                </pre>
            </div>

            {/* Step Actions */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Actions</h3>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        Run Step
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        Configure
                    </button>
                </div>
            </div>
        </div>
    );
}; 