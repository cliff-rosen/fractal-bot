import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState, Tool, WorkflowVariable } from '../types/index';

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
            name: 'query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'Search query'
            },
            required: true
        }],
        outputs: [{
            name: 'results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'Search results'
            }
        }]
    },
    {
        id: 'tool2',
        name: 'File Tool',
        description: 'File operations',
        category: 'file',
        inputs: [{
            name: 'file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'File to process'
            },
            required: true
        }],
        outputs: [{
            name: 'processed_file',
            schema: {
                type: 'file',
                is_array: false,
                description: 'Processed file'
            }
        }]
    }
];

export const mockSteps: Step[] = [
    {
        id: 'step-1',
        name: 'Web Search',
        description: 'Search the web for relevant information',
        type: 'atomic',
        childVariables: [
            {
                variable_id: 'step-1-input-1',
                name: 'search_query',
                schema: {
                    type: 'string',
                    is_array: false,
                    description: 'The search terms to look for'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'step-1'
            },
            {
                variable_id: 'step-1-output-1',
                name: 'search_results',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'List of search results'
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'step-1'
            }
        ],
        inputMappings: [
            {
                sourceVariableId: 'stage-1-input-1',
                target: {
                    type: 'variable',
                    variableId: 'step-1-input-1'
                }
            }
        ],
        outputMappings: [
            {
                sourceVariableId: 'step-1-output-1',
                target: {
                    type: 'variable',
                    variableId: 'stage-1-output-1'
                }
            }
        ],
        tool_id: 'web-search',
        status: 'unresolved',
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z'
    },
    {
        id: 'step-2',
        name: 'Email Search',
        description: 'Search through email content',
        type: 'atomic',
        childVariables: [
            {
                variable_id: 'step-2-input-1',
                name: 'email_query',
                schema: {
                    type: 'string',
                    is_array: false,
                    description: 'The search terms to look for in emails'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'step-2'
            },
            {
                variable_id: 'step-2-output-1',
                name: 'email_results',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'List of matching email content'
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'step-2'
            }
        ],
        inputMappings: [
            {
                sourceVariableId: 'stage-1-input-1',
                target: {
                    type: 'variable',
                    variableId: 'step-2-input-1'
                }
            }
        ],
        outputMappings: [
            {
                sourceVariableId: 'step-2-output-1',
                target: {
                    type: 'variable',
                    variableId: 'stage-1-output-1'
                }
            }
        ],
        tool_id: 'email-search',
        status: 'unresolved',
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z'
    },
    {
        id: 'step-3',
        name: 'Extract Info',
        description: 'Extract information from documents',
        type: 'atomic',
        childVariables: [
            {
                variable_id: 'step-3-input-1',
                name: 'data_to_analyze',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'The data to be analyzed'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'step-3'
            },
            {
                variable_id: 'step-3-output-1',
                name: 'analysis_results',
                schema: {
                    type: 'object',
                    is_array: false,
                    description: 'Results of the analysis'
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'step-3'
            }
        ],
        inputMappings: [
            {
                sourceVariableId: 'stage-2-input-1',
                target: {
                    type: 'variable',
                    variableId: 'step-3-input-1'
                }
            }
        ],
        outputMappings: [
            {
                sourceVariableId: 'step-3-output-1',
                target: {
                    type: 'variable',
                    variableId: 'stage-2-output-1'
                }
            }
        ],
        tool_id: 'extract-info',
        status: 'unresolved',
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z'
    }
];

export const mockStages: Stage[] = [
    {
        id: 'stage-1',
        name: 'Data Collection',
        description: 'Gather and organize relevant information',
        status: 'pending',
        steps: [mockSteps[0], mockSteps[1]],
        childVariables: [
            {
                variable_id: 'stage-1-input-1',
                name: 'search_query',
                schema: {
                    type: 'string',
                    is_array: false,
                    description: 'The search terms to look for'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'stage-1'
            },
            {
                variable_id: 'stage-1-output-1',
                name: 'search_results',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'List of search results'
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'stage-1'
            }
        ],
        inputMappings: [
            {
                sourceVariableId: 'mission-input-1',
                target: {
                    type: 'variable',
                    variableId: 'stage-1-input-1'
                }
            }
        ],
        outputMappings: [
            {
                sourceVariableId: 'stage-1-output-1',
                target: {
                    type: 'variable',
                    variableId: 'workflow-output-1'
                }
            }
        ],
        success_criteria: ['All required data is collected'],
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z'
    },
    {
        id: 'stage-2',
        name: 'Analysis',
        description: 'Process and analyze the collected data',
        status: 'pending',
        steps: [mockSteps[2]],
        childVariables: [
            {
                variable_id: 'stage-2-input-1',
                name: 'data_to_analyze',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'The data to be analyzed'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'stage-2'
            },
            {
                variable_id: 'stage-2-output-1',
                name: 'analysis_results',
                schema: {
                    type: 'object',
                    is_array: false,
                    description: 'Results of the analysis'
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'stage-2'
            }
        ],
        inputMappings: [
            {
                sourceVariableId: 'stage-1-output-1',
                target: {
                    type: 'variable',
                    variableId: 'stage-2-input-1'
                }
            }
        ],
        outputMappings: [
            {
                sourceVariableId: 'stage-2-output-1',
                target: {
                    type: 'variable',
                    variableId: 'workflow-output-2'
                }
            }
        ],
        success_criteria: ['Analysis is complete and results are documented'],
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z'
    }
];

export const mockWorkflow: Workflow = {
    id: 'workflow1',
    name: 'Customer Feedback Analysis Workflow',
    description: 'Workflow to analyze customer feedback and generate insights',
    status: 'pending',
    stages: mockStages,
    childVariables: [{
        variable_id: 'workflow_input',
        name: 'customer_feedback',
        schema: {
            type: 'string',
            is_array: false,
            description: 'Raw customer feedback data'
        },
        io_type: 'input',
        required: true,
        status: 'pending',
        createdBy: 'workflow1'
    }, {
        variable_id: 'workflow_output',
        name: 'analysis_report',
        schema: {
            type: 'object',
            is_array: false,
            description: 'Final analysis report with insights'
        },
        io_type: 'output',
        status: 'pending',
        createdBy: 'workflow1'
    }],
    inputMappings: [{
        sourceVariableId: 'mission_input',
        target: {
            type: 'variable',
            variableId: 'workflow_input'
        }
    }],
    outputMappings: [{
        sourceVariableId: 'workflow_output',
        target: {
            type: 'variable',
            variableId: 'mission_output'
        }
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const mockMission: Mission = {
    id: 'mission1',
    title: 'Customer Feedback Analysis',
    goal: 'Analyze customer feedback to identify key trends and insights',
    status: 'pending',
    workflow: mockWorkflow,
    inputs: [{
        variable_id: 'mission_input',
        name: 'customer_feedback',
        schema: {
            type: 'string',
            is_array: false,
            description: 'Raw customer feedback data'
        },
        io_type: 'input',
        required: true,
        status: 'pending',
        createdBy: 'mission1'
    }],
    outputs: [{
        variable_id: 'mission_output',
        name: 'analysis_report',
        schema: {
            type: 'object',
            is_array: false,
            description: 'Final analysis report with insights'
        },
        io_type: 'output',
        status: 'pending',
        createdBy: 'mission1'
    }],
    resources: ['Customer Feedback Dataset'],
    success_criteria: ['Identified key trends', 'Generated actionable insights'],
    selectedTools: mockTools,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    currentStageId: 'stage-1',
    currentStepPath: ['step-1'],
    viewMode: 'compact'
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
