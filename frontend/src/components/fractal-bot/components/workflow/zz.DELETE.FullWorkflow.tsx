import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Stage, Step } from '../../types/index';
import type { WorkspaceState } from '../../types/index';

interface FullWorkflowProps {
    className?: string;
    stages: Stage[];
    workspaceState: WorkspaceState;
    onStageClick: (stage: Stage) => void;
    onStepClick: (step: Step) => void;
}

export default function FullWorkflow({ className = '', stages, workspaceState, onStageClick, onStepClick }: FullWorkflowProps) {
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
                            onClick={() => {
                                toggleStage(stage.id);
                                onStageClick(stage);
                            }}
                        >
                            <ChevronRight
                                className={`w-5 h-5 mr-2 transform transition-transform text-gray-400 dark:text-gray-500 ${expandedStages.includes(stage.id) ? 'rotate-90' : ''
                                    }`}
                            />
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium } dark:bg-opacity-20`}>
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
                                        <p className="text-sm text-gray-400 dark:text-gray-500">inputs</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Outputs</h4>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">outputs</p>
                                    </div>
                                </div>

                                {/* Stage Steps */}
                                {stage.steps && stage.steps.length > 0 && (
                                    <div className="border-t border-gray-100 dark:border-gray-700 p-3 pl-8">
                                        {stage.steps.map((step) => (
                                            <div key={step.id}>
                                                <p>{step.name}</p>
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