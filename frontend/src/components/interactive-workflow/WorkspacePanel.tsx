import React from 'react';
import { Journey, Workflow } from './types';

interface WorkspacePanelProps {
    journey: Journey | null;
    workflow: Workflow | null | undefined;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ journey, workflow }) => {
    if (!journey) {
        return (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                No active journey
            </div>
        );
    }

    const currentStep = workflow?.steps[workflow.currentStepIndex];

    return (
        <div className="p-4 space-y-6">
            {/* Workspace Info */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Workspace Info</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Name: {journey.workspace.name}</p>
                    <p>Description: {journey.workspace.description}</p>
                </div>
            </div>

            {/* Current Step */}
            {currentStep && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Current Step</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {currentStep.name}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${currentStep.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                                currentStep.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                }`}>
                                {currentStep.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {currentStep.description}
                        </p>
                        {currentStep.progress > 0 && (
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${currentStep.progress}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Assets */}
            {journey.workspace.assets.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Assets</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {journey.workspace.assets.map(asset => (
                            <div
                                key={asset.id}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {asset.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {asset.type} • {asset.format}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {asset.metadata.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tools */}
            {journey.workspace.tools.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Available Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {journey.workspace.tools.map(tool => (
                            <div
                                key={tool.id}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {tool.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {tool.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 