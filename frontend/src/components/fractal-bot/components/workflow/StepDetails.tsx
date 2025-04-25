// similar to FullWorkflow, but with a focus on the current step

import React from 'react';
import type { Step } from '../../types';

interface StepDetailsProps {
    step: Step;
}

export default function StepDetails({ step }: StepDetailsProps) {
    return (
        <div className="space-y-4">

            {step.tool && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900">Tool Configuration</h3>
                    <div className="mt-2 space-y-2">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Tool:</span> {step.tool.name}
                        </div>
                        {Object.entries(step.tool.configuration).map(([key, value]) => (
                            <div key={key} className="text-sm text-gray-600">
                                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900">Input Assets</h3>
                    <div className="mt-2 space-y-1">
                        {step.assets.inputs.length > 0 ? (
                            step.assets.inputs.map((assetId) => (
                                <div key={assetId} className="text-sm text-gray-600">
                                    {assetId}
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400">No input assets</div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900">Output Assets</h3>
                    <div className="mt-2 space-y-1">
                        {step.assets.outputs.length > 0 ? (
                            step.assets.outputs.map((assetId) => (
                                <div key={assetId} className="text-sm text-gray-600">
                                    {assetId}
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400">No output assets</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

