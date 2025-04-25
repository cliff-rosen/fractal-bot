import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';
import { mockDataSnapshot3 } from './mockDataSnapshot3';

// Base state
const baseState = mockDataSnapshot3;

// Workflow data (moved from workspace to mission)
const baseWorkflow = baseState.workspace.content?.workflow;


const stages = baseWorkflow?.stages || [];
stages[0].status = 'current';

export const workflow: Workflow = {
    id: baseWorkflow?.id || 'workflow-1',
    name: baseWorkflow?.name || 'Default Workflow',
    description: baseWorkflow?.description || '',
    status: 'current',
    stages: stages || [],
    assets: baseWorkflow?.assets || [],
    createdAt: baseWorkflow?.createdAt || '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:03:00Z'
};

// Mission with updated workflow
const mission: Mission = {
    ...baseState.mission,
    workflow,
    updatedAt: '2024-01-01T00:03:00Z'
};

// Deltas from base state
const deltas: Partial<MockDataSnapshot> = {
    mission,
    chatMessages: [
        ...baseState.chatMessages,
        {
            id: 'msg-3b',
            role: 'assistant' as const,
            content: "Great, let's proceed with that plan. Let me analyze the first stage of the workflow and find a good tool for the initial step.",
            timestamp: '2024-01-01T00:03:00Z',
            metadata: {
                stageId: 'stage-1',
                stepId: 'step-1-1'
            }
        },
        {
            id: 'msg-3c',
            role: 'assistant' as const,
            content: "Thinking...",
            timestamp: '2024-01-01T00:03:00Z',

        }
    ],
    workspace: {
        ...baseState.workspace,
        type: 'thinking',
        title: 'Thinking...',
        content: { text: "Thinking..." },
        actionButtons: [],
    },
    workspaceState: {
        ...baseState.workspaceState,
        currentStepPath: ['step-1-1']
    }
};

// Final state
export const mockDataSnapshot3a: MockDataSnapshot = {
    ...baseState,
    ...deltas
}; 