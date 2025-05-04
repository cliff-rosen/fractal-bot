// similar to FullWorkflow, but with a focus on the current step

import React from 'react';
import type { Step } from '../../types/index';

interface StepDetailsProps {
    step: Step;
}

export default function StepDetails({ step }: StepDetailsProps) {
    return (
        <div className="space-y-4">

            {step.tool && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Tool Configuration</h3>
                    <div className="mt-2 space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Tool:</span> {step.tool.name}
                        </div>
                        {Object.entries(step.tool.configuration).map(([key, value]) => (
                            <div key={key} className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Inputs</h3>
                    <div className="mt-2 space-y-1">
                        {step.inputs.length > 0 ? (
                            step.inputs.map((input) => (
                                <div key={input} className="text-sm text-gray-600 dark:text-gray-300">
                                    {input}
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 dark:text-gray-500">No inputs</div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">Outputs</h3>
                    <div className="mt-2 space-y-1">
                        {step.outputs.length > 0 ? (
                            step.outputs.map((output) => (
                                <div key={output} className="text-sm text-gray-600 dark:text-gray-300">
                                    {output}
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 dark:text-gray-500">No outputs</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

