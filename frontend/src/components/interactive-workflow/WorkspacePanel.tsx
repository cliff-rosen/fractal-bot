import React from 'react';
import { Journey, Workflow, WorkflowStep, WorkspaceObjectType } from './types';

interface WorkspacePanelProps {
    journey: Journey | null;
}

const renderProposedJourney = (journey: Journey) => {
    return (
        <div className="p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Proposed Journey
                </h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
                        <p className="text-gray-900 dark:text-gray-100">{journey.title}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Goal</h3>
                        <p className="text-gray-900 dark:text-gray-100">{journey.goal}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Deliverable</h3>
                        <p className="text-gray-900 dark:text-gray-100">{journey.deliverable.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const renderProposedWorkflow = (workflow: Workflow) => {
    return (
        <div className="p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Proposed Workflow
                </h2>
                <div className="space-y-4">
                    {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                    {index + 1}
                                </span>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {step.name} • {step.agentType}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const renderWorkflowStep = (step: WorkflowStep) => {
    return (
        <div className="p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {step.name}
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded ${step.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        step.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        }`}>
                        {step.status}
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pending Asset</h3>
                        <div className="flex items-center space-x-2">
                            <div className="animate-pulse text-4xl">📝</div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {step.name} Output
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {step.agentType} • text
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ journey }) => {
    if (!journey) {
        return <div className="text-gray-500 dark:text-gray-400">No journey selected</div>;
    }

    switch (journey.workspace.objectType) {
        case 'proposed_journey':
            return renderProposedJourney(journey.workspace.object as Journey);
        case 'proposed_workflow':
            return renderProposedWorkflow(journey.workspace.object as Workflow);
        case 'workflow_step':
            return renderWorkflowStep(journey.workspace.object as WorkflowStep);
        default:
            return <div className="text-gray-500 dark:text-gray-400">No content to display</div>;
    }
}; 