import React, { useState } from 'react';
import type { Step } from '../../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface StepProps {
    step: Step;
    onAddSubstep: (step: Step) => void;
    isSubstep?: boolean;
}

export default function Step({ step, onAddSubstep, isSubstep = false }: StepProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`${isSubstep ? 'ml-4' : ''} border-l-2 border-gray-200 dark:border-gray-700 pl-4`}>
            <div
                className="flex items-center space-x-2 cursor-pointer py-2"
                onClick={toggleExpand}
            >
                {step.substeps ? (
                    isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    )
                ) : null}
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-2 space-y-2">
                    {step.tool ? (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-300">{step.tool.name}</p>
                            {/* Add tool configuration UI here */}
                        </div>
                    ) : step.substeps ? (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">Substeps</h5>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddSubstep(step);
                                    }}
                                    className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                >
                                    Add Substep
                                </button>
                            </div>
                            <div className="space-y-2">
                                {step.substeps.map(substep => (
                                    <Step
                                        key={substep.id}
                                        step={substep}
                                        onAddSubstep={onAddSubstep}
                                        isSubstep={true}
                                    />
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            )}
        </div>
    );
} 