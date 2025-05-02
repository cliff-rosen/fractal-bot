import React from 'react';
import type { Step } from '../../types';
import { Pencil, Sparkles, Plus, Trash2 } from 'lucide-react';

interface StepProps {
    step: Step;
    onAddSubstep: (step: Step) => void;
    onEditStep?: (step: Step) => void;
    onDeleteStep?: (stepId: string) => void;
    onStepTypeChange?: (stepId: string, type: 'atomic' | 'composite') => void;
    onToolSelect?: (stepId: string, toolId: string) => void;
    availableTools?: any[];
    depth?: number;
}

export default function Step({
    step,
    onAddSubstep,
    onEditStep,
    onDeleteStep,
    onStepTypeChange,
    onToolSelect,
    availableTools = [],
    depth = 0
}: StepProps) {
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEditStep?.(step);
    };

    const handleAISuggestion = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement AI suggestion logic
        console.log('Requesting AI suggestion for step:', step.id);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteStep?.(step.id);
    };

    const handleStepTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onStepTypeChange?.(step.id, e.target.value as 'atomic' | 'composite');
    };

    const handleToolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onToolSelect?.(step.id, e.target.value);
    };

    const isComposite = step.type === 'composite';

    return (
        <div className={`${depth > 0 ? 'ml-4' : ''} border-l-2 border-gray-200 dark:border-gray-700 pl-4`}>
            <div className="flex items-center space-x-2 py-2">
                <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={step.type}
                            onChange={handleStepTypeChange}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="atomic">Atomic</option>
                            <option value="composite">Composite</option>
                        </select>
                        {!isComposite && (
                            <select
                                value={step.tool?.name || ''}
                                onChange={handleToolSelect}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">Select a tool</option>
                                {availableTools.map((tool) => (
                                    <option key={tool.id} value={tool.id}>
                                        {tool.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {isComposite && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddSubstep(step);
                                }}
                                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                title="Add Substep"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={handleAISuggestion}
                            className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                            title="AI Suggest"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleEditClick}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit step"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        {onDeleteStep && (
                            <button
                                onClick={handleDeleteClick}
                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                title="Delete Step"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {step.substeps && (
                <div className="mt-2 space-y-2">
                    {step.substeps.map(substep => (
                        <Step
                            key={substep.id}
                            step={substep}
                            onAddSubstep={onAddSubstep}
                            onEditStep={onEditStep}
                            onDeleteStep={onDeleteStep}
                            onStepTypeChange={onStepTypeChange}
                            onToolSelect={onToolSelect}
                            availableTools={availableTools}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 