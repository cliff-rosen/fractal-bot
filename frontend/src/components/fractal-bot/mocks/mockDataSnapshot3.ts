import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';
import { mockDataSnapshot2b } from './mockDataSnapshot2b';

// Base state
const baseState = mockDataSnapshot2b;

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
    chatMessages: [
        ...baseState.chatMessages,
        {
            id: 'msg-3',
            role: 'assistant' as const,
            content: "Ok, I've designed a workflow with three stages: Search, Extract, and Generate. Here's the proposed workflow structure. Would you like me to proceed with this plan?",
            timestamp: '2024-01-01T00:02:00Z',
            metadata: {}
        }
    ],
    workspace: {
        ...baseState.workspace,
        type: 'proposedWorkflowDesign',
        title: 'Proposed Workflow',
        content: {
            workflow: proposedWorkflow,
            assets: []
        },
        actionButtons: [
            {
                label: 'Accept',
                onClick: () => console.log('Accept workflow'),
                variant: 'primary'
            },
            {
                label: 'Modify',
                onClick: () => console.log('Modify workflow'),
                variant: 'secondary'
            }
        ],
        updatedAt: '2024-01-01T00:02:00Z'
    },
    workspaceState: {
        ...baseState.workspaceState,
        currentStageId: 'stage-1'
    }
};

// Final state
export const mockDataSnapshot3: MockDataSnapshot = {
    ...baseState,
    ...deltas
}; 