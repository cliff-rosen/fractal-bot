import React from 'react';
import { Journey } from './types';

interface JourneyCardProps {
    journey: Journey;
    onAccept?: () => void;
    onReject?: () => void;
    onStartDesign?: () => void;
    onAcceptWorkflow?: () => void;
    onRejectWorkflow?: () => void;
    workflowStatus?: 'awaiting_journey' | 'awaiting_workflow_design' | 'awaiting_workflow_start';
    isDesigning?: boolean;
    isWorkflowProposed?: boolean;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
    journey,
    onAccept,
    onReject,
    onStartDesign,
    onAcceptWorkflow,
    onRejectWorkflow,
    workflowStatus,
    isDesigning,
    isWorkflowProposed
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3">
                {/* First Row: Title and Status/Actions */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {journey.title}
                    </h2>
                    {workflowStatus === 'awaiting_journey' ? (
                        <div className="flex gap-2">
                            <button
                                onClick={onAccept}
                                className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800"
                            >
                                Accept Journey
                            </button>
                            <button
                                onClick={onReject}
                                className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800"
                            >
                                Reject Journey
                            </button>
                        </div>
                    ) : workflowStatus === 'awaiting_workflow_design' ? (
                        isDesigning ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                Workflow Design in Progress
                            </span>
                        ) : isWorkflowProposed ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={onAcceptWorkflow}
                                    className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800"
                                >
                                    Accept Workflow
                                </button>
                                <button
                                    onClick={onRejectWorkflow}
                                    className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800"
                                >
                                    Reject Workflow
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={onStartDesign}
                                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800"
                                >
                                    Yes, Design Workflow
                                </button>
                            </div>
                        )
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                            Workflow Design Pending Approval
                        </span>
                    )}
                </div>

                {/* Second Row: Goal and Deliverable */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {journey.goal}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Deliverable: {journey.deliverableType}
                        </span>
                        <div className="flex gap-1">
                            {journey.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 