import React, { useState } from 'react';
import { JourneyCard } from './JourneyCard';
import { WorkflowCard } from './WorkflowCard';
import { StepDetailsCard } from './StepDetailsCard';
import { EnhancedChatPanel } from './EnhancedChatPanel';
import { uiSnapshots } from './workflowTransitionData';

const InteractiveWorkflowTest: React.FC = () => {
    const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
    const currentSnapshot = uiSnapshots[currentSnapshotIndex];

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
                            messages={currentSnapshot.messages}
                            inputMessage=""
                            isProcessing={false}
                            onSendMessage={() => { }}
                        />
                    </div>
                </div>

                {/* Right: Journey Card + Workflow + Step Details */}
                <div className="flex-1 flex flex-col">
                    {currentSnapshot.journey && <JourneyCard journey={currentSnapshot.journey} />}
                    {currentSnapshot.workflow && <WorkflowCard workflow={currentSnapshot.workflow} />}
                    {currentSnapshot.workflow?.steps[currentSnapshot.workflow.currentStepIndex] && (
                        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow-sm">
                            <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Step Details</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <StepDetailsCard step={currentSnapshot.workflow.steps[currentSnapshot.workflow.currentStepIndex]} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractiveWorkflowTest; 