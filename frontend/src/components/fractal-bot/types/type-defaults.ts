import { Asset, ChatMessage, Mission, Workflow, Workspace, WorkspaceState, Tool, MissionProposal, Stage, WorkflowVariable } from './index';
import { createMissionFromProposal } from '../utils/utils';

// default workspace object
export const workspaceTemplate: Workspace = {
    id: 'workspace-template',
    type: 'text',
    title: '',
    status: 'completed',
    content: {
        text: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

// default chat message object
export const chatMessageTemplate: ChatMessage = {
    id: 'chat-message-template',
    role: 'user',
    content: '',
    timestamp: new Date().toISOString(),
}

// default workflow object
export const workflowTemplate: Workflow = {
    id: 'workflow-template',
    name: '',
    description: '',
    status: 'pending',
    stages: [],
    childVariables: [],
    inputMappings: [],
    outputMappings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

export const toolsTemplate: Tool[] = [
    {
        id: 'tool1',
        name: 'Web Search',
        description: 'Search the web for information',
        category: 'Data Retrieval',
        inputs: [{
            name: 'query',
            description: 'The search query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The search query to look for'
            },
            required: true
        }],
        outputs: [{
            name: 'results',
            description: 'The search results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of search results'
            }
        }]
    },
    {
        id: 'tool2',
        name: 'Email Search',
        description: 'Search through emails',
        category: 'Data Retrieval',
        inputs: [{
            name: 'query',
            description: 'The search query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The search query to look for'
            },
            required: true
        }],
        outputs: [{
            name: 'results',
            description: 'The search results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of search results'
            }
        }]
    },
    {
        id: 'tool3',
        name: 'Extract Info',
        description: 'Extract information from text',
        category: 'Data Processing',
        inputs: [{
            name: 'text',
            description: 'The text to extract information from',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The text to extract information from'
            },
            required: true
        }],
        outputs: [{
            name: 'extracted_info',
            description: 'The extracted information',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of extracted information'
            }
        }]
    },
    {
        id: 'tool4',
        name: 'Add to KB',
        description: 'Add information to knowledge base',
        category: 'Knowledge Management',
        inputs: [{
            name: 'info',
            description: 'The information to add',
            schema: {
                type: 'object',
                is_array: false,
                description: 'The information to add to the knowledge base'
            },
            required: true
        }],
        outputs: [{
            name: 'status',
            description: 'The status of the operation',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The status of the operation'
            }
        }]
    },
    {
        id: 'tool5',
        name: 'Search KB',
        description: 'Search the knowledge base',
        category: 'Knowledge Management',
        inputs: [{
            name: 'query',
            description: 'The search query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The search query to look for'
            },
            required: true
        }],
        outputs: [{
            name: 'results',
            description: 'The search results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of search results'
            }
        }]
    },
    {
        id: 'tool6',
        name: 'Generate Query',
        description: 'Generate a search query',
        category: 'Query Generation',
        inputs: [{
            name: 'context',
            description: 'The context for generating the query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The context for generating the query'
            },
            required: true
        }],
        outputs: [{
            name: 'query',
            description: 'The generated query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The generated query'
            }
        }]
    },
    {
        id: 'tool7',
        name: 'Improve Question',
        description: 'Improve a question for better results',
        category: 'Query Generation',
        inputs: [{
            name: 'question',
            description: 'The question to improve',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The question to improve'
            },
            required: true
        }],
        outputs: [{
            name: 'improved_question',
            description: 'The improved question',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The improved question'
            }
        }]
    }
];

export const workflowExample: Workflow = {
    id: 'workflow-1',
    name: 'College Research Workflow',
    description: 'A workflow to research and analyze college programs',
    status: 'active',
    stages: [
        {
            id: 'stage-1',
            name: 'Data Collection',
            description: 'Gather information about colleges and programs',
            steps: [],
            childVariables: [{
                variable_id: 'search_query',
                name: 'search_query',
                schema: {
                    type: 'string',
                    is_array: false,
                    description: 'Search query for colleges with dance programs'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'stage-1'
            }, {
                variable_id: 'program_details',
                name: 'program_details',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Detailed information about dance programs'
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'stage-1'
            }],
            inputMappings: [],
            outputMappings: [],
            status: 'pending',
            success_criteria: ['Gather information from at least 10 colleges'],
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
        },
        {
            id: 'stage-2',
            name: 'Analysis',
            description: 'Analyze and compare programs',
            steps: [],
            childVariables: [{
                variable_id: 'program_details',
                name: 'program_details',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Program details to analyze'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'stage-2'
            }, {
                variable_id: 'comparison_results',
                name: 'comparison_results',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Analysis results of dance programs'
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'stage-2'
            }],
            inputMappings: [],
            outputMappings: [],
            status: 'pending',
            success_criteria: ['Complete comparison of all programs'],
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
        }
    ],
    childVariables: [{
        variable_id: 'search_query',
        name: 'search_query',
        schema: {
            type: 'string',
            is_array: false,
            description: 'Search query for colleges with dance programs'
        },
        io_type: 'input',
        required: true,
        status: 'pending',
        createdBy: 'workflow-1'
    }, {
        variable_id: 'comparison_results',
        name: 'comparison_results',
        schema: {
            type: 'object',
            is_array: true,
            description: 'Analysis results of dance programs'
        },
        io_type: 'output',
        status: 'pending',
        createdBy: 'workflow-1'
    }],
    inputMappings: [],
    outputMappings: [],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
};

// default mission object
export const missionTemplate: Mission = {
    id: 'mission-template',
    title: '',
    goal: '',
    status: 'pending',
    workflow: workflowTemplate,
    childVariables: [],
    inputMappings: [],
    outputMappings: [],
    resources: [],  // General resources needed but not specific data objects
    success_criteria: [],
    selectedTools: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

export const missionProposalTemplate: MissionProposal = {
    title: "Top 10 Dance Colleges in the United States",
    goal: "To produce a ranked list of the top 10 colleges for dance in the United States based on specified criteria.",
    childVariables: [{
        variable_id: "ranking_criteria",
        name: "ranking_criteria",
        schema: {
            type: "string",
            is_array: true,
            description: "List of potential criteria (faculty quality, facilities, alumni success)"
        },
        io_type: "input",
        required: true,
        status: 'pending',
        createdBy: 'mission-proposal'
    }, {
        variable_id: "geographic_scope",
        name: "geographic_scope",
        schema: {
            type: "string",
            is_array: false,
            description: "Geographic scope (United States)"
        },
        io_type: "input",
        required: true,
        status: 'pending',
        createdBy: 'mission-proposal'
    }, {
        variable_id: "ranked_list",
        name: "ranked_list",
        schema: {
            type: "object",
            is_array: true,
            description: "Ranked list of top 10 colleges with justification for each ranking"
        },
        io_type: "output",
        status: 'pending',
        createdBy: 'mission-proposal'
    }],
    inputMappings: [],
    outputMappings: [],
    resources: ["College databases", "Dance program directories", "Ranking methodologies"],
    success_criteria: ["The list includes 10 colleges", "Each college ranking is justified with data", "Criteria for ranking are consistently applied"],
    selectedTools: [{
        id: "tool1",
        name: "College Database Search",
        description: "A tool to search and retrieve data from college databases.",
        category: "Data Retrieval",
        inputs: [{
            name: "search_query",
            description: "The search query to find colleges offering dance programs.",
            schema: {
                type: "string",
                is_array: false,
                description: "The search query to find colleges offering dance programs."
            },
            required: true
        }],
        outputs: [{
            name: "college_list",
            description: "List of colleges matching the search criteria.",
            schema: {
                type: "object",
                is_array: true,
                description: "List of colleges matching the search criteria."
            }
        }]
    }],
    has_sufficient_info: true,
    missing_info_explanation: ""
};

export const missionExample: Mission = {
    id: 'mission-1',
    title: 'Research Dance Programs',
    goal: 'Find and analyze dance programs at top colleges',
    status: 'active',
    workflow: workflowExample,
    childVariables: [{
        variable_id: 'search_query',
        name: 'search_query',
        schema: {
            type: 'string',
            is_array: false,
            description: 'Search query for colleges with dance programs'
        },
        io_type: 'input',
        required: true,
        status: 'pending',
        createdBy: 'mission-1'
    }, {
        variable_id: 'comparison_results',
        name: 'comparison_results',
        schema: {
            type: 'object',
            is_array: true,
            description: 'Analysis results of dance programs'
        },
        io_type: 'output',
        status: 'pending',
        createdBy: 'mission-1'
    }],
    inputMappings: [],
    outputMappings: [],
    resources: ['College databases', 'Dance program directories'],
    success_criteria: ['Find at least 10 colleges', 'Compare programs based on criteria'],
    selectedTools: toolsTemplate,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
};

export const workspaceStateTemplate: WorkspaceState = {
    currentMissionId: null,
    currentStageId: null,
    currentStepPath: [],
    viewMode: 'compact',
}

// default assets object
export const assetsTemplate: Asset[] = [];

