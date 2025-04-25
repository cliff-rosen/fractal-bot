import React from 'react';
import type { Stage } from '../../types';
import { getStatusClass } from './types';

interface CondensedWorkflowProps {
    className?: string;
    stages: Stage[];
}

export default function CondensedWorkflow({ className = '', stages }: CondensedWorkflowProps) {
    return (
        <div className={className}>
            <div className="flex items-center justify-between">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStatusClass(stage.status)}`}>
                                {stage.id.split('-')[1]}
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-600">{stage.name}</span>
                            {stage.status === 'current' && (
                                <span className="mt-1 text-xs text-emerald-600">Current Stage</span>
                            )}
                        </div>
                        {index < stages.length - 1 && (
                            <div className={`h-0.5 w-12 mx-2
                                ${stage.status === 'completed' ? 'bg-emerald-200' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
} 