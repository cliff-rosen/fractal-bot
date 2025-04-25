import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';
import { mockDataSnapshot3a, workflow as baseWorkflow } from './mockDataSnapshot3a';

// Base state
const baseState = mockDataSnapshot3a;


const newStep: Step = {
    id: 'step-1-1',
    name: 'Query Database',
    description: 'Query the customer feedback database',
    status: 'current',
    assets: { inputs: [], outputs: [] },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tool: {
        name: 'Query Database',
        configuration: {
            database: 'customer_feedback',
            query: 'SELECT * FROM feedback'
        }
    }
};

const stages = baseWorkflow?.stages || [];
stages[0].status = 'current';
stages[0].steps.push(newStep);

const workflow: Workflow = {
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
            id: 'msg-4',
            role: 'assistant' as const,
            content: "OK, for the first step, I think we should query the customer feedback database using the 'Query Database' tool. This will fetch all the relevant feedback data for analysis. I've proposed that step in the workspace. If you accept it, the change will get applied to the workflow and executer right away. Would you like me to proceed with this plan?",
            timestamp: '2024-01-01T00:03:00Z',
            metadata: {
                stageId: 'stage-1',
                stepId: 'step-1-1'
            }
        }
    ],
    workspace: {
        ...baseState.workspace,
        type: 'stepDetails',
        title: 'Query Database',
        content: { step: newStep },
        actionButtons: [
            {
                label: 'Execute',
                onClick: () => console.log('Execute query'),
                variant: 'primary'
            },
            {
                label: 'Modify',
                onClick: () => console.log('Modify query'),
                variant: 'secondary'
            }
        ],
        updatedAt: '2024-01-01T00:03:00Z'
    },
    workspaceState: {
        ...baseState.workspaceState,
        currentStepPath: ['step-1-1']
    }
};

// Final state
export const mockDataSnapshot4: MockDataSnapshot = {
    ...baseState,
    ...deltas
}; 