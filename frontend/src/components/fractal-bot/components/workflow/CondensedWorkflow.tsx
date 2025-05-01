import React from 'react';
import type { Stage } from '../../types';
import { getStatusClass } from './types';

interface CondensedWorkflowProps {
    className?: string;
    stages: Stage[];
    onStageClick: (stage: Stage) => void;
}

export default function CondensedWorkflow({ className = '', stages, onStageClick }: CondensedWorkflowProps) {
    return (
        <div className={className}>
            <div className="flex items-center justify-between">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                        <div
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => onStageClick(stage)}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStatusClass(stage.status)} dark:bg-opacity-20`}>
                                {stage.id.split('-')[1]}
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">{stage.name}</span>
                            {stage.status === 'current' && (
                                <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Current Stage</span>
                            )}
                        </div>
                        {index < stages.length - 1 && (
                            <div className={`h-0.5 w-12 mx-2
                                ${stage.status === 'completed'
                                    ? 'bg-emerald-200 dark:bg-emerald-800'
                                    : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
} 