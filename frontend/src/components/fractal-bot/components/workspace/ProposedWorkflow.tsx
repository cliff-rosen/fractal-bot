import React from 'react';
import type { Workflow, Stage, Step } from '../../types/index';

interface ProposedWorkflowProps {
    workflow: Workflow;
}

export default function ProposedWorkflow({ workflow }: ProposedWorkflowProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proposed Workflow</h2>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mt-1">{workflow.name}</h1>
                <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {workflow.description}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stages</h3>
                <div className="mt-2 space-y-4">
                    {workflow.stages.map((stage: Stage, index: number) => (
                        <div key={stage.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200">{stage.name}</h4>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{stage.description}</p>

                            {/* Stage Inputs and Outputs */}
                            <div className="mt-3 grid grid-cols-2 gap-4">
                                <div className="bg-gray-100 dark:bg-gray-600/50 p-3 rounded-lg">
                                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Inputs</h5>
                                    {stage.inputs.length > 0 ? (
                                        <ul className="space-y-1">
                                            {stage.inputs.map((input: string) => (
                                                <li key={input} className="text-sm text-gray-600 dark:text-gray-300">
                                                    {input}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-400 dark:text-gray-500">No inputs</p>
                                    )}
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-600/50 p-3 rounded-lg">
                                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Outputs</h5>
                                    {stage.outputs.length > 0 ? (
                                        <ul className="space-y-1">
                                            {stage.outputs.map((output: string) => (
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

                            {/* Stage Steps */}
                            <div className="mt-4">
                                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Steps</h5>
                                <ul className="space-y-3">
                                    {stage.steps.map((step: Step, stepIndex: number) => (
                                        <li key={step.id} className="bg-gray-100 dark:bg-gray-600/50 p-3 rounded-lg">
                                            <div className="flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2"></span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{step.name}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{step.description}</p>

                                            {/* Step Inputs and Outputs */}
                                            <div className="mt-2 grid grid-cols-2 gap-3">
                                                <div>
                                                    <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Inputs</h6>
                                                    {step.inputs.length > 0 ? (
                                                        <ul className="space-y-1">
                                                            {step.inputs.map((input: string) => (
                                                                <li key={input} className="text-xs text-gray-600 dark:text-gray-300">
                                                                    {input}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">No inputs</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Outputs</h6>
                                                    {step.outputs.length > 0 ? (
                                                        <ul className="space-y-1">
                                                            {step.outputs.map((output: string) => (
                                                                <li key={output} className="text-xs text-gray-600 dark:text-gray-300">
                                                                    {output}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">No outputs</p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 