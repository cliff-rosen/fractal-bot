import React from 'react';
import { ArrowRight, Database } from 'lucide-react';
import type { WorkflowVariable, Stage } from '../types';
import { useFractalBot } from '@/context/FractalBotContext';

interface WorkflowVariableBrowserProps {
    className?: string;
    stages: Stage[];
}

const getVariableIcon = (io_type: string) => {
    switch (io_type) {
        case 'input':
            return <ArrowRight className="w-4 h-4 rotate-180" />;
        case 'output':
            return <ArrowRight className="w-4 h-4" />;
        default:
            return <Database className="w-4 h-4" />;
    }
};

export default function WorkflowVariableBrowser({ className = '', stages }: WorkflowVariableBrowserProps) {
    const { state: { selectedStepId } } = useFractalBot();

    // Find the stage and step containing the selected step
    const selectedStage = stages.find(stage =>
        stage.steps.some(step => step.id === selectedStepId)
    );
    const selectedStep = selectedStage?.steps.find(step => step.id === selectedStepId);

    // Get variables for the selected step or all stages if no step is selected
    const variables = selectedStep
        ? [...(selectedStep.inputs || []), ...(selectedStep.outputs || [])]
        : stages.flatMap(stage =>
            stage.steps.flatMap(step =>
                [...(step.inputs || []), ...(step.outputs || [])]
            )
        );

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="px-4 py-3 border-b dark:border-gray-700">
                <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow Variables</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {selectedStep ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">Inputs</h4>
                            <div className="space-y-2">
                                {selectedStep.inputs?.map((variable) => (
                                    <div
                                        key={variable.variable_id}
                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        {getVariableIcon('input')}
                                        <span className="text-sm">{variable.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">Outputs</h4>
                            <div className="space-y-2">
                                {selectedStep.outputs?.map((variable) => (
                                    <div
                                        key={variable.variable_id}
                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        {getVariableIcon('output')}
                                        <span className="text-sm">{variable.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {stages.map((stage) => (
                            <div key={stage.id}>
                                <h4 className="text-xs text-gray-500 dark:text-gray-400">{stage.name}</h4>
                                <div className="space-y-2">
                                    {stage.steps.flatMap(step =>
                                        [...(step.inputs || []), ...(step.outputs || [])].map((variable) => (
                                            <div
                                                key={variable.variable_id}
                                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                                            >
                                                {getVariableIcon(variable.io_type)}
                                                <span className="text-sm">{variable.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 