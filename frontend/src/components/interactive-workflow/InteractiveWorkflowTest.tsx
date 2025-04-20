import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { JourneyCard } from './JourneyCard';
import { WorkflowCard } from './WorkflowCard';
import { StepDetailsCard } from './StepDetailsCard';
import { EnhancedChatPanel } from './EnhancedChatPanel';
import {
    Journey,
    Workflow,
    ChatMessage,
    WorkflowState
} from './types';
import {
    sampleJourney,
    sampleWorkflow,
    sampleMessages,
    initialWorkflowState
} from './sampleData';

const InteractiveWorkflowTest: React.FC = () => {
    // State
    const [journey, setJourney] = useState<Journey | null>(null);
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [workflowState, setWorkflowState] = useState(initialWorkflowState);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

    // Load initial data
    useEffect(() => {
        setJourney(sampleJourney);
        setWorkflow({ ...sampleWorkflow, currentStepIndex: initialWorkflowState.currentStepIndex });
        setMessages(sampleMessages);
    }, []);

    // Handlers
    const handleSendMessage = (message: string) => {
        const newMessage: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            metadata: {
                type: 'goal',
                phase: workflowState.phase
            }
        };

        setMessages(prev => [...prev, newMessage]);

        // TODO: Process message and generate response
        // For now, we'll just echo back
        setTimeout(() => {
            const response: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: `Received: ${message}`,
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'confirmation',
                    phase: workflowState.phase
                }
            };
            setMessages(prev => [...prev, response]);
        }, 1000);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="h-12 bg-white dark:bg-gray-800 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Orchestrator
                </h1>
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
                            messages={messages}
                            inputMessage=""
                            isProcessing={workflowState.isProcessing}
                            onSendMessage={handleSendMessage}
                        />
                    </div>
                </div>

                {/* Right: Journey Card + Workflow + Step Details */}
                <div className="flex-1 flex flex-col">
                    {journey && <JourneyCard journey={journey} />}
                    {workflow && <WorkflowCard workflow={workflow} />}
                    {workflow?.steps[workflow.currentStepIndex] && (
                        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow-sm">
                            <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Step Details</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <StepDetailsCard step={workflow.steps[workflow.currentStepIndex]} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractiveWorkflowTest; 