import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Stage } from '../../types';
import { getStatusClass } from './types';
import type { WorkspaceState } from '../../types';

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
                    <div key={stage.id} className="border border-gray-100 rounded-lg">
                        <div
                            className="flex items-center p-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleStage(stage.id)}
                        >
                            <ChevronRight
                                className={`w-5 h-5 mr-2 transform transition-transform ${expandedStages.includes(stage.id) ? 'rotate-90' : ''
                                    }`}
                            />
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${getStatusClass(stage.status)}`}>
                                {stage.id.split('-')[1]}
                            </div>
                            <span className="ml-2 font-medium">{stage.name}</span>
                            {stage.status === 'current' && (
                                <span className="ml-2 text-xs text-emerald-600">Current Stage</span>
                            )}
                        </div>

                        {expandedStages.includes(stage.id) && (
                            <div className="border-t border-gray-100">
                                {stage.steps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-center p-3 pl-8 hover:bg-gray-50 ${workspaceState.currentStepPath.includes(step.id) ? 'bg-emerald-50' : ''}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${getStatusClass(step.status)}`}>
                                            {step.id.split('-')[2]}
                                        </div>
                                        <span className="ml-2">{step.name}</span>
                                        {workspaceState.currentStepPath.includes(step.id) && (
                                            <span className="ml-2 text-xs text-emerald-600">Current Step</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 