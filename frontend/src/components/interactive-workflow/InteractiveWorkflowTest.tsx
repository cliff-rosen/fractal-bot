import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { JourneyCard } from './JourneyCard';
import { EnhancedChatPanel } from './EnhancedChatPanel';
import { WorkflowViewer } from './WorkflowViewer';
import { AssetPanel } from './AssetPanel';
import { AgentPanel } from './AgentPanel';
import {
    Journey,
    Workflow,
    WorkflowStep,
    Asset,
    Tool,
    Agent,
    ChatMessage,
    MessageReaction,
    AssetVersion,
    WorkflowState
} from './types';

const InteractiveWorkflowTest: React.FC = () => {
    // State
    const [journey, setJourney] = useState<Journey | null>(null);
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [workflowState, setWorkflowState] = useState<WorkflowState>({
        phase: 'setup',
        setupStage: 'initial',
        executionStage: 'started',
        currentStepIndex: 0,
        isProcessing: false
    });
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

    // Load initial data
    useEffect(() => {
        // TODO: Load data from API or sample data
        // For now, we'll use sample data
        const sampleJourney: Journey = {
            id: uuidv4(),
            title: 'Sample Journey',
            goal: 'Analyze text data for insights',
            status: 'active',
            creator: 'User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ['analysis', 'text', 'demo'],
            deliverableType: 'summary'
        };

        const sampleWorkflow: Workflow = {
            id: uuidv4(),
            journeyId: sampleJourney.id,
            steps: [],
            status: 'pending',
            currentStepIndex: 0,
            assets: []
        };

        setJourney(sampleJourney);
        setWorkflow(sampleWorkflow);
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

    const handleAssetSelect = (asset: Asset) => {
        setSelectedAsset(asset);
    };

    const handleAssetVersionSelect = (asset: Asset, version: AssetVersion) => {
        // TODO: Implement version switching
        console.log('Switching to version:', version);
    };

    const handleAssetTagsUpdate = (asset: Asset, tags: string[]) => {
        setAssets(prev => prev.map(a =>
            a.id === asset.id
                ? { ...a, metadata: { ...a.metadata, tags } }
                : a
        ));
    };

    const handleAgentSelect = (agent: Agent) => {
        setSelectedAgent(agent);
    };

    const handleToolSelect = (tool: Tool) => {
        // TODO: Implement tool selection
        console.log('Selected tool:', tool);
    };

    const handleStepSelect = (stepIndex: number) => {
        if (!workflow) return;
        setWorkflow({ ...workflow, currentStepIndex: stepIndex });
    };

    const handleStepReorder = (fromIndex: number, toIndex: number) => {
        if (!workflow) return;
        const newSteps = [...workflow.steps];
        const [movedStep] = newSteps.splice(fromIndex, 1);
        newSteps.splice(toIndex, 0, movedStep);
        setWorkflow({ ...workflow, steps: newSteps });
    };

    const handleStepToggle = (stepIndex: number) => {
        if (!workflow) return;
        const newSteps = workflow.steps.map((step, index) =>
            index === stepIndex
                ? { ...step, isExpanded: !step.isExpanded }
                : step
        );
        setWorkflow({ ...workflow, steps: newSteps });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Orchestrator
                    </h1>
                    {journey && (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Current Journey:
                            </span>
                            <JourneyCard
                                journey={journey}
                                onSelect={() => { }}
                                className="w-64"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Chat */}
                <div className="w-[400px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                    <EnhancedChatPanel
                        messages={messages}
                        inputMessage=""
                        isProcessing={workflowState.isProcessing}
                        onSendMessage={handleSendMessage}
                    />
                </div>

                {/* Center Panel - Workflow */}
                <div className="flex-1 flex flex-col">
                    {workflow && (
                        <WorkflowViewer
                            steps={workflow.steps}
                            currentStepIndex={workflow.currentStepIndex}
                            onStepSelect={handleStepSelect}
                            onStepReorder={handleStepReorder}
                            onStepToggle={handleStepToggle}
                            className="flex-1"
                        />
                    )}
                </div>

                {/* Right Panel - Assets & Agents */}
                <div className={`
                    w-[400px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
                    transform transition-transform duration-300
                    ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="h-1/2 border-b border-gray-200 dark:border-gray-700">
                        <AssetPanel
                            assets={assets}
                            onAssetSelect={handleAssetSelect}
                            onAssetVersionSelect={handleAssetVersionSelect}
                            onAssetTagsUpdate={handleAssetTagsUpdate}
                        />
                    </div>
                    <div className="h-1/2">
                        <AgentPanel
                            agents={agents}
                            tools={tools}
                            onAgentSelect={handleAgentSelect}
                            onToolSelect={handleToolSelect}
                        />
                    </div>
                </div>

                {/* Toggle Button for Right Panel */}
                <button
                    onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                    className={`
                        fixed right-0 top-1/2 transform -translate-y-1/2
                        p-2 bg-white dark:bg-gray-800 rounded-l-lg shadow-lg
                        border border-gray-200 dark:border-gray-700 border-r-0
                        transition-transform duration-300
                        ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-0'}
                    `}
                >
                    <svg
                        className={`w-6 h-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isRightPanelOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default InteractiveWorkflowTest; 