import React, { useState } from 'react';
import type { Step } from '../../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface StepItemProps {
    step: Step;
    onStepClick: (step: Step) => void;
    onAddSubstep: (parentStep: Step) => void;
    isSubstep?: boolean;
}

export default function StepItem({ step, onStepClick, onAddSubstep, isSubstep = false }: StepItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onStepClick(step);
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleAddSubstep = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddSubstep(step);
    };

    return (
        <div className="space-y-2">
            <div
                onClick={handleClick}
                className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isSubstep ? 'ml-4' : ''}`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                        {step.substeps && step.substeps.length > 0 && (
                            <button
                                onClick={handleExpandClick}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>
                        )}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.name}</h4>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {step.tool && (
                            <span className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded">
                                {step.tool.name}
                            </span>
                        )}
                        {step.substeps && step.substeps.length > 0 && (
                            <span className="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded">
                                {step.substeps.length} substeps
                            </span>
                        )}
                        {!step.tool && (
                            <button
                                onClick={handleAddSubstep}
                                className="px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                            >
                                Add Substep
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isExpanded && step.substeps && step.substeps.length > 0 && (
                <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    {step.substeps.map(substep => (
                        <StepItem
                            key={substep.id}
                            step={substep}
                            onStepClick={onStepClick}
                            onAddSubstep={onAddSubstep}
                            isSubstep={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 