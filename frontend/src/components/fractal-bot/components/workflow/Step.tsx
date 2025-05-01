import React, { useState } from 'react';
import type { Step } from '../../types';
import { ChevronDown, ChevronRight, Pencil, Sparkles } from 'lucide-react';

interface StepProps {
    step: Step;
    onAddSubstep: (step: Step) => void;
    onEditStep?: (step: Step) => void;
    depth?: number;
}

export default function Step({ step, onAddSubstep, onEditStep, depth = 0 }: StepProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEditStep?.(step);
    };

    const handleAISuggestion = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement AI suggestion logic
        console.log('Requesting AI suggestion for step:', step.id);
    };

    return (
        <div className={`${depth > 0 ? 'ml-4' : ''} border-l-2 border-gray-200 dark:border-gray-700 pl-4`}>
            <div
                className="flex items-center space-x-2 cursor-pointer py-2"
                onClick={toggleExpand}
            >
                {(step.substeps || depth > 0) ? (
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
                {(step.tool || step.substeps) && (
                    <button
                        onClick={handleEditClick}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Edit step"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
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
                                <div className="flex space-x-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAISuggestion(e);
                                        }}
                                        className="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        AI Suggest
                                    </button>
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
                            </div>
                            <div className="space-y-2">
                                {step.substeps.map(substep => (
                                    <Step
                                        key={substep.id}
                                        step={substep}
                                        onAddSubstep={onAddSubstep}
                                        onEditStep={onEditStep}
                                        depth={depth + 1}
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