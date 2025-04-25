import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';
import { mockDataSnapshot2 } from './mockDataSnapshot2';

// Base state
const baseState = mockDataSnapshot2;

// Mission proposal data
const missionProposal: Mission = {
    id: 'mission-1',
    title: 'Customer Feedback Analysis',
    description: 'Analyze customer feedback to identify key insights and trends',
    goal: 'Create a report on customer feedback that contains the most common issues and suggestions for improvement',
    status: 'pending',
    workflow: {
        id: '',
        name: '',
        description: '',
        status: 'pending',
        stages: [],
        assets: [],
        createdAt: '',
        updatedAt: ''
    },
    assets: [],
    inputs: ['Customer feedback database'],
    outputs: ['Analysis report with key insights'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
};

// Deltas from base state
const deltas: Partial<MockDataSnapshot> = {
    chatMessages: [
        ...baseState.chatMessages,
        {
            id: 'msg-2a1',
            role: 'assistant' as const,
            content: "Have a look at this proposed mission and then let me know if you want to accept or modify it.",
            timestamp: '2024-01-01T00:02:00Z',
            metadata: {}
        }
    ],
    workspace: {
        ...baseState.workspace,
        type: 'proposedMission',
        title: 'Proposed Mission',
        content: {
            mission: missionProposal,
            assets: []
        },
        status: 'pending',
        actionButtons: [
            {
                label: 'Accept',
                onClick: () => console.log('Accept mission'),
                variant: 'primary'
            },
            {
                label: 'Modify',
                onClick: () => console.log('Modify mission'),
                variant: 'secondary'
            }
        ],
        updatedAt: '2024-01-01T00:01:00Z'
    },
    workspaceState: {
        ...baseState.workspaceState,
        currentMissionId: 'mission-1'
    }
};

// Final state
export const mockDataSnapshot2a: MockDataSnapshot = {
    ...baseState,
    ...deltas
}; 