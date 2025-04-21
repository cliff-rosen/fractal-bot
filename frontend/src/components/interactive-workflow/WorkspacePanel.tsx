import React from 'react';
import { Journey, Workflow, WorkflowStep } from './types';

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
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {step.name}
                                </h3>
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

const renderWorkflowStepDetail = (step: WorkflowStep) => {
    return (
        <div className="p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {step.name}
                </h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                        <p className="text-gray-900 dark:text-gray-100">{step.description}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                        <p className="text-gray-900 dark:text-gray-100">{step.status}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</h3>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${step.progress}%` }}
                            ></div>
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

    // Determine what to render based on journey state
    switch (journey.state) {
        case 'AWAITING_GOAL':
            return renderProposedJourney(journey);
        case 'AWAITING_WORKFLOW_DESIGN':
            return journey.workflow ? renderProposedWorkflow(journey.workflow) : null;
        case 'WORKFLOW_IN_PROGRESS':
            if (journey.workflow) {
                const currentStep = journey.workflow.steps[journey.workflow.currentStepIndex];
                return currentStep ? renderWorkflowStepDetail(currentStep) : null;
            }
            return null;
        default:
            return <div className="text-gray-500 dark:text-gray-400">No content to display</div>;
    }
}; 