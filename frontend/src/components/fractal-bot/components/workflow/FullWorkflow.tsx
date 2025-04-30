import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Stage } from '../../types/index';
import { getStatusClass } from './types';
import type { WorkspaceState } from '../../types/index';

interface FullWorkflowProps {
    className?: string;
    stages: Stage[];
    workspaceState: WorkspaceState;
}

export default function FullWorkflow({ className = '', stages, workspaceState }: FullWorkflowProps) {
    const [expandedStages, setExpandedStages] = useState<string[]>([]);

    // Initialize expanded stages with the current stage
    useEffect(() => {
        if (workspaceState.currentStageId) {
            setExpandedStages([workspaceState.currentStageId]);
        }
    }, [workspaceState.currentStageId]);

    const toggleStage = (stageId: string) => {
        setExpandedStages((prev) =>
            prev.includes(stageId)
                ? prev.filter((id) => id !== stageId)
                : [...prev, stageId]
        );
    };

    return (
        <div className={className}>
            <div className="space-y-2">
                {stages.map((stage) => (
                    <div key={stage.id} className="border border-gray-100 dark:border-gray-700 rounded-lg">
                        <div
                            className="flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => toggleStage(stage.id)}
                        >
                            <ChevronRight
                                className={`w-5 h-5 mr-2 transform transition-transform text-gray-400 dark:text-gray-500 ${expandedStages.includes(stage.id) ? 'rotate-90' : ''
                                    }`}
                            />
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${getStatusClass(stage.status)} dark:bg-opacity-20`}>
                                {stage.id.split('-')[1]}
                            </div>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-200">{stage.name}</span>
                            {stage.status === 'current' && (
                                <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">Current Stage</span>
                            )}
                        </div>

                        {expandedStages.includes(stage.id) && (
                            <div className="border-t border-gray-100 dark:border-gray-700">
                                {/* Stage Description */}
                                <div className="p-3 pl-8 text-sm text-gray-600 dark:text-gray-300">
                                    {stage.description}
                                </div>

                                {/* Stage Inputs and Outputs */}
                                <div className="grid grid-cols-2 gap-4 p-3 pl-8 border-t border-gray-100 dark:border-gray-700">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Inputs</h4>
                                        {stage.inputs.length > 0 ? (
                                            <ul className="space-y-1">
                                                {stage.inputs.map((input) => (
                                                    <li key={input} className="text-sm text-gray-600 dark:text-gray-300">
                                                        {input}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No inputs</p>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Outputs</h4>
                                        {stage.outputs.length > 0 ? (
                                            <ul className="space-y-1">
                                                {stage.outputs.map((output) => (
                                                    <li key={output} className="text-sm text-gray-600 dark:text-gray-300">
                                                        {output}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No outputs</p>
                                        )}
                                    </div>
                                </div>

                                {/* Stage Steps */}
                                {stage.steps && stage.steps.length > 0 && (
                                    <div className="border-t border-gray-100 dark:border-gray-700">
                                        {stage.steps.map((step) => (
                                            <div
                                                key={step.id}
                                                className={`flex items-center p-3 pl-8 hover:bg-gray-50 dark:hover:bg-gray-700 ${workspaceState.currentStepPath?.includes(step.id)
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/30'
                                                        : ''
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${getStatusClass(step.status)} dark:bg-opacity-20`}>
                                                    {step.id.split('-')[2]}
                                                </div>
                                                <span className="ml-2 text-gray-900 dark:text-gray-200">{step.name}</span>
                                                {workspaceState.currentStepPath?.includes(step.id) && (
                                                    <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">Current Step</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 