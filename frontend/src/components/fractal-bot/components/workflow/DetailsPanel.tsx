import React from 'react';
import type { Stage, Step } from '../../types/index';

interface DetailsPanelProps {
    item: Stage | Step;
    type: 'stage' | 'step' | 'substep';
}

export default function DetailsPanel({ item, type }: DetailsPanelProps) {
    return (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>

                {/* Inputs and Outputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Inputs</h4>
                        {item.inputs.length > 0 ? (
                            <ul className="space-y-1">
                                {item.inputs.map((input) => (
                                    <li key={input} className="text-sm text-gray-600 dark:text-gray-300">
                                        {input}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500">No inputs</p>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Outputs</h4>
                        {item.outputs.length > 0 ? (
                            <ul className="space-y-1">
                                {item.outputs.map((output) => (
                                    <li key={output} className="text-sm text-gray-600 dark:text-gray-300">
                                        {output}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500">No outputs</p>
                        )}
                    </div>
                </div>

                {/* Tool Configuration (for steps) */}
                {type !== 'stage' && 'tool' in item && item.tool && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tool Configuration</h4>
                        <div className="space-y-2">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Tool:</span> {item.tool.name}
                            </div>
                            {Object.entries(item.tool.configuration).map(([key, value]) => (
                                <div key={key} className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Success Criteria (for stages) */}
                {type === 'stage' && 'success_criteria' in item && item.success_criteria.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Success Criteria</h4>
                        <ul className="space-y-1">
                            {item.success_criteria.map((criterion, index) => (
                                <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                    {criterion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
} 