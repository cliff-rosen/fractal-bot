import React from 'react';
import type { Stage, Step, Workflow } from '../../types';

interface StageDebugProps {
    workflow: Workflow;
}

export default function StageDebug({ workflow }: StageDebugProps) {
    const renderStep = (step: Step, depth: number = 0) => {
        return (
            <div key={step.id} style={{ marginLeft: `${depth * 20}px` }} className="py-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {step.id.slice(0, 8)}...
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {step.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${step.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        step.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            step.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                step.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {step.status}
                    </span>
                    {step.type && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                            {step.type}
                        </span>
                    )}
                    {step.tool_id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            {step.tool_id.slice(0, 8)}...
                        </span>
                    )}
                </div>
                {step.substeps?.map(substep => renderStep(substep, depth + 1))}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Workflow Debug Info</h3>
                <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {workflow.id}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {workflow.name}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${workflow.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            workflow.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                workflow.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    workflow.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {workflow.status}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {workflow.description}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {workflow.stages.map((stage, stageIndex) => (
                    <div key={stage.id} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                    {stageIndex + 1}.
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {stage.name}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${stage.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    stage.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                        stage.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            stage.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                    {stage.status}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stage.description}
                            </div>
                        </div>
                        <div className="space-y-1">
                            {stage.steps.map(step => renderStep(step))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}



