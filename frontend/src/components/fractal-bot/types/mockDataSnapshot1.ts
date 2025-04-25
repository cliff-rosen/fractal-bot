import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';
import { mockDataSnapshot0 } from './mockDataSnapshot0';

// Base state
const baseState = mockDataSnapshot0;

// Deltas from base state
const deltas: Partial<MockDataSnapshot> = {
    chatMessages: [
        {
            id: 'msg-1',
            role: 'user' as const,
            content: 'I need to analyze our customer feedback to identify key trends',
            timestamp: '2024-01-01T00:00:00Z',
            metadata: {}
        }
    ],
    workspaceState: {
        ...baseState.workspaceState
    }
};

// Final state
export const mockDataSnapshot1: MockDataSnapshot = {
    ...baseState,
    ...deltas
}; 