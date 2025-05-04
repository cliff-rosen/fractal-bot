import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState, Tool, WorkflowVariable } from '../types/index';
import { mockDataSnapshot0 } from './mockDataSnapshot0';
import { mockDataSnapshot1 } from './mockDataSnapshot1';
import { mockDataSnapshot2 } from './mockDataSnapshot2';
import { mockDataSnapshot2a } from './mockDataSnapshot2a';
import { mockDataSnapshot2b } from './mockDataSnapshot2b';
import { mockDataSnapshot3 } from './mockDataSnapshot3';
import { mockDataSnapshot3a } from './mockDataSnapshot3a';
import { mockDataSnapshot4 } from './mockDataSnapshot4';

// Mock data snapshot type
export type MockDataSnapshot = {
    mission: Mission;
    workflow: Workflow;
    stages: Stage[];
    steps: Step[];
    assets: Asset[];
    chatMessages: ChatMessage[];
    workspace: Workspace;
    workspaceState: WorkspaceState;
}

// Array of mock data snapshots type
export type MockDataSnapshots = MockDataSnapshot[];

export const mockThinkingWorkspace: Workspace = {
    id: 'ws-1',
    type: 'thinking',
    title: 'Thinking...',
    status: 'pending',
    content: {
        text: "Thinking..."
    },
    actionButtons: [
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
}

export const mockAssets: Asset[] = [
    {
        id: 'asset-1',
        name: 'Customer Feedback Dataset',
        type: 'dataset',
        status: 'ready',
        content: { /* dataset content */ },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1
    },
    {
        id: 'asset-2',
        name: 'Analysis Report',
        type: 'document',
        status: 'pendingApproval',
        content: { /* document content */ },
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        version: 1
    }
];

export const mockTools: Tool[] = [
    {
        id: 'tool1',
        name: 'Search Tool',
        description: 'Search for information',
        category: 'search',
        inputs: [{
            variable_id: 'query',
            name: 'query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'Search query'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'results',
            name: 'results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'Search results'
            },
            io_type: 'output'
        }]
    },
    {
        id: 'tool2',
        name: 'File Tool',
        description: 'File operations',
        category: 'file',
        inputs: [{
            variable_id: 'file',
            name: 'file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'File to process'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'processed_file',
            name: 'processed_file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'Processed file'
            },
            io_type: 'output'
        }]
    }
];

export const mockSteps: Step[] = [
    {
        id: 'step1',
        name: 'Search Step',
        description: 'Search for information',
        status: 'pending',
        type: 'atomic',
        tool: mockTools[0],
        inputs: [{
            variable_id: 'search_query',
            name: 'search_query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'Search query'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'search_results',
            name: 'search_results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'Search results'
            },
            io_type: 'output'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'step2',
        name: 'File Step',
        description: 'Process file',
        status: 'pending',
        type: 'atomic',
        tool: mockTools[1],
        inputs: [{
            variable_id: 'input_file',
            name: 'input_file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'File to process'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'output_file',
            name: 'output_file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'Processed file'
            },
            io_type: 'output'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const mockStages: Stage[] = [
    {
        id: 'stage1',
        name: 'Search Stage',
        description: 'Stage for searching',
        status: 'pending',
        steps: [mockSteps[0]],
        inputs: [{
            variable_id: 'stage_query',
            name: 'stage_query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'Stage search query'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'stage_results',
            name: 'stage_results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'Stage search results'
            },
            io_type: 'output'
        }],
        success_criteria: ['Found relevant results'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'stage2',
        name: 'File Stage',
        description: 'Stage for file processing',
        status: 'pending',
        steps: [mockSteps[1]],
        inputs: [{
            variable_id: 'stage_file',
            name: 'stage_file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'Stage input file'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'stage_processed_file',
            name: 'stage_processed_file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'Stage processed file'
            },
            io_type: 'output'
        }],
        success_criteria: ['File processed successfully'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const mockWorkflow: Workflow = {
    id: 'workflow-1',
    name: 'Customer Feedback Analysis Workflow',
    description: 'Standard workflow for analyzing customer feedback',
    status: 'current',
    stages: mockStages,
    assets: mockAssets,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T02:00:00Z'
};

export const mockMission: Mission = {
    id: 'mission-1',
    title: 'Customer Feedback Analysis',
    description: 'Analyze customer feedback to identify key insights and trends',
    goal: 'Create a report on customer feedback that contains the most common issues and suggestions for improvement',
    status: 'current',
    workflow: mockWorkflow,
    assets: mockAssets,
    inputs: ['asset-1'],
    outputs: ['asset-2'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T02:00:00Z'
};

export const mockChatMessages: ChatMessage[] = [
    {
        id: 'msg-1',
        role: 'user',
        content: 'I need to analyze our customer feedback to identify key trends',
        timestamp: '2024-01-01T00:00:00Z',
        metadata: {
            missionId: 'mission-1'
        }
    },
    {
        id: 'msg-2',
        role: 'assistant',
        content: "I'll help you analyze the customer feedback. Let's start by gathering the data.",
        timestamp: '2024-01-01T00:01:00Z',
        metadata: {
            missionId: 'mission-1',
            stageId: 'stage-1'
        }
    }
];

export const mockWorkspace: Workspace =
{
    id: 'ws-1',
    type: 'workflowStepStatus',
    title: 'Extraction in Progress',
    status: 'pending',
    content: {
        text: 'Extracting data from input documents...',
        assets: []
    },
    actionButtons: [
        {
            label: 'Cancel',
            onClick: () => console.log('Cancel extraction'),
            variant: 'danger'
        },
        {
            label: 'Complete',
            onClick: () => console.log('Complete extraction'),
            variant: 'primary'
        }
    ],
    createdAt: '2024-03-20T12:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z'
}

export const mockWorkspaceState: WorkspaceState = {
    currentMissionId: 'mission-1',
    currentStageId: 'stage-2',
    currentStepPath: ['step-2-1', 'step-2-2'],
    viewMode: 'expanded',
    getCurrentPath: () => ({
        missionId: 'mission-1',
        stageId: 'stage-2',
        stepPath: ['step-2-1', 'step-2-2']
    })
};
// Complete mock data snapshot
export const mockDataSnapshotSample: MockDataSnapshot = {
    mission: mockMission,
    workflow: mockWorkflow,
    stages: mockStages,
    steps: mockSteps,
    assets: mockAssets,
    chatMessages: mockChatMessages,
    workspace: mockWorkspace,
    workspaceState: mockWorkspaceState
};

// Progress update workspace mock
export const progressUpdateWorkspace: Workspace = {
    id: 'progress-workspace-1',
    type: 'progressUpdate',
    title: 'Workflow Progress',
    status: 'current',
    content: {
        progressUpdates: [
            {
                id: 'update-1',
                timestamp: new Date().toISOString(),
                title: 'Data Collection',
                status: 'completed',
                details: 'Successfully collected all required data points from customer feedback',
                progress: 100,
                icon: '📊'
            },
            {
                id: 'update-3',
                timestamp: new Date().toISOString(),
                title: 'Insight Generation',
                status: 'pending',
                details: 'Will generate actionable insights from the analysis',
                progress: 0,
                icon: '💡'
            }
        ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// Export all mock data snapshots
export const mockDataSnapshots: MockDataSnapshots = [
    mockDataSnapshot0,
    mockDataSnapshot1,
    mockDataSnapshot2,
    mockDataSnapshot2a,
    mockDataSnapshot2b,
    mockDataSnapshot3,
    mockDataSnapshot3a,
    mockDataSnapshot4,
    {
        ...mockDataSnapshot4,
        workspace: progressUpdateWorkspace
    }
];
