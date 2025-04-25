import React from 'react';
import { Workflow } from '../types';

interface ProposedWorkflowProps {
    workflow: Workflow;
}

export default function ProposedWorkflow({ workflow }: ProposedWorkflowProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Proposed Workflow</h2>
                <h1 className="text-2xl font-semibold text-gray-900 mt-1">{workflow.name}</h1>
                <p className="mt-3 text-gray-600 leading-relaxed">
                    {workflow.description}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stages</h3>
                <div className="mt-2 space-y-4">
                    {workflow.stages.map((stage, index) => (
                        <div key={stage.id} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900">{stage.name}</h4>
                            <p className="mt-1 text-sm text-gray-600">{stage.description}</p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                {stage.steps.map((step, stepIndex) => (
                                    <li key={step.id} className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                                        {step.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 