import React from 'react';
import type { Step } from '../../types/index';
import { getStatusClass } from './types';

interface StepRendererProps {
    step: Step;
    level?: number;
    isCurrent?: boolean;
    onStepClick?: (step: Step) => void;
}

export default function     ({ step, level = 0, isCurrent = false, onStepClick }: StepRendererProps) {
    const handleClick = () => {
        if (onStepClick) {
            onStepClick(step);
        }
    };

    return (
        <div className={`ml-${level * 4} mb-2`}>
            <div
                className={`p-3 rounded-lg border transition-all cursor-pointer
                    ${isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                onClick={handleClick}
            >
                {/* Step Header */}
                <div className="flex items-center gap-3">
                    {/* Status Indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${getStatusClass(step.status)} dark:bg-opacity-20`}>
                        {step.id.split('-')[2]}
                    </div>

                    {/* Step Name and Description */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {step.name}
                        </h4>
                        {step.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {step.description}
                            </p>
                        )}
                    </div>

                    {/* Tool Indicator */}
                    {step.tool && (
                        <div className="flex-shrink-0">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {step.tool.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Inputs and Outputs */}
                {(step.inputs.length > 0 || step.outputs.length > 0) && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {step.inputs.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Inputs</h5>
                                <ul className="space-y-1">
                                    {step.inputs.map((input, index) => (
                                        <li key={index} className="text-xs text-gray-600 dark:text-gray-300">
                                            {input}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {step.outputs.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Outputs</h5>
                                <ul className="space-y-1">
                                    {step.outputs.map((output, index) => (
                                        <li key={index} className="text-xs text-gray-600 dark:text-gray-300">
                                            {output}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Sub-steps */}
                {step.substeps && step.substeps.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {step.substeps.map((substep) => (
                            <StepRenderer
                                key={substep.id}
                                step={substep}
                                level={level + 1}
                                onStepClick={onStepClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 