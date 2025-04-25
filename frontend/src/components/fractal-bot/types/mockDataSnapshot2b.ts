import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';
import { mockDataSnapshot2a } from './mockDataSnapshot2a';
import { mockThinkingWorkspace } from './data';

// Base state
const baseState = mockDataSnapshot2a;

// Mission data (moved from workspace to main mission)
var mission: Mission | undefined = baseState.workspace.content?.mission;
if (mission) {
    mission.status = 'current';
}

// Proposed workflow for the workspace
const proposedWorkflow: Workflow = {
    id: 'workflow-1',
    name: 'Customer Feedback Analysis Workflow',
    description: 'Standard workflow for analyzing customer feedback',
    status: 'pending',
    stages: [
        {
            id: 'stage-1',
            name: 'Search',
            description: 'Search and filter customer feedback',
            status: 'pending',
            steps: [],
            assets: {
                inputs: [],
                outputs: []
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        },
        {
            id: 'stage-2',
            name: 'Extract',
            description: 'Extract and analyze feedback data',
            status: 'pending',
            steps: [],
            assets: {
                inputs: [],
                outputs: []
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        },
        {
            id: 'stage-3',
            name: 'Generate',
            description: 'Generate insights from the analyzed data',
            status: 'pending',
            steps: [],
            assets: {
                inputs: [],
                outputs: []
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    ],
    assets: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
};

// Deltas from base state
const deltas: Partial<MockDataSnapshot> = {
    mission,
    chatMessages: [
        ...baseState.chatMessages,
        {
            id: 'msg-2b1',
            role: 'assistant' as const,
            content: "Great! Let me design a workflow for you.",
            timestamp: '2024-01-01T00:02:00Z',
            metadata: {}
        },
        {
            id: 'msg-2b2',
            role: 'assistant' as const,
            content: "Thinking...",
            timestamp: '2024-01-01T00:02:00Z',
            metadata: {}
        }
    ],
    workspace: {
        ...baseState.workspace,
        type: 'thinking',
        title: 'Thinking...',
        content: {
            text: "Thinking..."
        },
        actionButtons: [
        ],
        updatedAt: '2024-01-01T00:02:00Z'
    },
    workspaceState: {
        ...baseState.workspaceState,
        currentStageId: 'stage-1'
    }
};

// Final state
export const mockDataSnapshot2b: MockDataSnapshot = {
    ...baseState,
    ...deltas
}; 