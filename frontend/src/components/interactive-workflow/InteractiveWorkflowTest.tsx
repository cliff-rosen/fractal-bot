import React, { useState } from 'react';
import { JourneyCard } from './JourneyCard';
import { WorkflowCard } from './WorkflowCard';
import { StepDetailsCard } from './StepDetailsCard';
import { EnhancedChatPanel } from './EnhancedChatPanel';
import { uiSnapshots } from './workflowTransitionData';

const InteractiveWorkflowTest: React.FC = () => {
    const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
    const currentSnapshot = uiSnapshots[currentSnapshotIndex];
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = () => {
        if (currentSnapshotIndex < uiSnapshots.length - 1) {
            setCurrentSnapshotIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentSnapshotIndex > 0) {
            setCurrentSnapshotIndex(prev => prev - 1);
        }
    };

    const handleAcceptJourney = () => {
        // Move to the next snapshot which should be the journey acceptance state
        handleNext();
    };

    const handleRejectJourney = () => {
        // For demo purposes, we'll just move to the next snapshot
        handleNext();
    };

    const handleStartDesign = () => {
        // Move to the next snapshot which should be the workflow design state
        handleNext();
    };

    const handleAcceptWorkflow = () => {
        // Move to the next snapshot which should be the workflow acceptance state
        handleNext();
    };

    const handleRejectWorkflow = () => {
        // For demo purposes, we'll just move to the next snapshot
        handleNext();
    };

    const handleSendMessage = (message: string) => {
        setIsProcessing(true);
        // Simulate processing
        setTimeout(() => {
            setIsProcessing(false);
            setInputMessage('');
        }, 1000);
    };

    // Determine workflow status based on current snapshot
    const getWorkflowStatus = () => {
        if (!currentSnapshot.journey) return 'awaiting_journey';
        if (currentSnapshot.journey.status === 'draft') return 'awaiting_journey';
        if (!currentSnapshot.journey.workflow) return 'awaiting_workflow_design';
        if (currentSnapshot.journey.workflow.status === 'pending') return 'awaiting_workflow_start';
        return 'awaiting_workflow_start';
    };

    // Determine if workflow is currently being designed
    const isDesigning = () => {
        if (!currentSnapshot.journey || currentSnapshot.journey.status !== 'active') return false;
        if (currentSnapshot.journey.workflow) return false;
        // Check if the current message indicates design is in progress
        const lastMessage = currentSnapshot.journey.messages[currentSnapshot.journey.messages.length - 1];
        return lastMessage?.content?.includes('designing a workflow');
    };

    // Determine if workflow has been proposed
    const isWorkflowProposed = () => {
        if (!currentSnapshot.journey || currentSnapshot.journey.status !== 'active') return false;
        if (currentSnapshot.journey.workflow) return false;
        // Check if the current message contains a workflow proposal
        const lastMessage = currentSnapshot.journey.messages[currentSnapshot.journey.messages.length - 1];
        return lastMessage?.content?.includes('I have designed a workflow');
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="h-12 bg-white dark:bg-gray-800 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Orchestrator Demo
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevious}
                        disabled={currentSnapshotIndex === 0}
                        className="px-3 py-1 text-sm rounded bg-gray-200 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentSnapshotIndex === uiSnapshots.length - 1}
                        className="px-3 py-1 text-sm rounded bg-blue-500 text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left: Chat Panel */}
                <div className="w-[400px] flex flex-col bg-white dark:bg-gray-800 shadow-sm">
                    <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Chat</h2>
                    </div>
                    <div className="flex-1">
                        <EnhancedChatPanel
                            messages={currentSnapshot.journey?.messages || []}
                            inputMessage={inputMessage}
                            isProcessing={isProcessing}
                            onSendMessage={handleSendMessage}
                        />
                    </div>
                </div>

                {/* Right: Journey Card + Workflow + Step Details */}
                <div className="flex-1 flex flex-col">
                    {currentSnapshot.journey && (
                        <JourneyCard
                            journey={currentSnapshot.journey}
                            onAccept={handleAcceptJourney}
                            onReject={handleRejectJourney}
                            onStartDesign={handleStartDesign}
                            onAcceptWorkflow={handleAcceptWorkflow}
                            onRejectWorkflow={handleRejectWorkflow}
                            workflowStatus={getWorkflowStatus()}
                            isDesigning={isDesigning()}
                            isWorkflowProposed={isWorkflowProposed()}
                        />
                    )}
                    {currentSnapshot.journey?.workflow && (
                        <WorkflowCard workflow={currentSnapshot.journey.workflow} />
                    )}
                    {currentSnapshot.journey?.workflow?.steps[currentSnapshot.journey.workflow.currentStepIndex] && (
                        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow-sm">
                            <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Step Details</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <StepDetailsCard step={currentSnapshot.journey.workflow.steps[currentSnapshot.journey.workflow.currentStepIndex]} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractiveWorkflowTest; 