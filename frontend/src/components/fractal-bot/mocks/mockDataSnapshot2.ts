import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';
import { mockDataSnapshot1 } from './mockDataSnapshot1';

// Base state
const baseState = mockDataSnapshot1;

const mockThinkingWorkspace: Workspace = {
    ...baseState.workspace,
    type: 'thinking',
    title: 'Thinking...',
    content: {
        text: "Thinking..."
    },
    actionButtons: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
};

// Deltas from base state
const deltas: Partial<MockDataSnapshot> = {
    chatMessages: [
        ...baseState.chatMessages,
        {
            id: 'msg-2',
            role: 'assistant' as const,
            content: "I'll help you analyze the customer feedback. Let's start by clarifying the mission. Give me a moment to create a proposed mission based on your request.",
            timestamp: '2024-01-01T00:01:00Z',
            metadata: {}
        },
        {
            id: 'msg-2a',
            role: 'assistant' as const,
            content: "Thinking...",
            timestamp: '2024-01-01T00:02:00Z',
            metadata: {}
        }
    ],
    workspace: mockThinkingWorkspace,
    workspaceState: {
        ...baseState.workspaceState,
        currentMissionId: 'mission-1'
    }
};

// Final state
export const mockDataSnapshot2: MockDataSnapshot = {
    ...baseState,
    ...deltas
}; 