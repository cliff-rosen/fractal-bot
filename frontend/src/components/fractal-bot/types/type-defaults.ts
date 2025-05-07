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
    name: 'Newsletter Processing Workflow',
    description: 'A workflow to retrieve, extract, and summarize information from email newsletters',
    status: 'active',
    stages: [
        {
            id: 'stage-1',
            name: 'Email Retrieval',
            description: 'Connect to email and retrieve newsletters from specified senders',
            steps: [],
            childVariables: [{
                variable_id: 'email_credentials',
                name: 'email_credentials',
                schema: {
                    type: 'object',
                    is_array: false,
                    description: 'Email account credentials and configuration',
                    fields: {
                        email: { type: 'string', is_array: false, description: 'Email address' },
                        password: { type: 'string', is_array: false, description: 'Email password or app token' },
                        folders: { type: 'string', is_array: true, description: 'Email folders to search' }
                    }
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'stage-1'
            }, {
                variable_id: 'retrieved_emails',
                name: 'retrieved_emails',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Retrieved newsletter emails',
                    fields: {
                        subject: { type: 'string', is_array: false, description: 'Email subject' },
                        sender: { type: 'string', is_array: false, description: 'Sender email' },
                        date: { type: 'string', is_array: false, description: 'Date received' },
                        content: { type: 'string', is_array: false, description: 'Email content' }
                    }
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'stage-1'
            }],
            inputMappings: [],
            outputMappings: [],
            status: 'pending',
            success_criteria: ['Successfully connect to email account', 'Retrieve all newsletters from last 30 days'],
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
        },
        {
            id: 'stage-2',
            name: 'Content Extraction',
            description: 'Extract key information from newsletter content',
            steps: [],
            childVariables: [{
                variable_id: 'retrieved_emails',
                name: 'retrieved_emails',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Retrieved newsletter emails'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'stage-2'
            }, {
                variable_id: 'extracted_info',
                name: 'extracted_info',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Extracted key information from newsletters',
                    fields: {
                        title: { type: 'string', is_array: false, description: 'Article title' },
                        topics: { type: 'string', is_array: true, description: 'Main topics' },
                        key_points: { type: 'string', is_array: true, description: 'Key points' },
                        source: { type: 'string', is_array: false, description: 'Newsletter source' }
                    }
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'stage-2'
            }],
            inputMappings: [],
            outputMappings: [],
            status: 'pending',
            success_criteria: ['Extract structured information from each newsletter', 'Identify main topics and key points'],
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
        },
        {
            id: 'stage-3',
            name: 'Summary Generation',
            description: 'Generate concise summaries and insights from extracted information',
            steps: [],
            childVariables: [{
                variable_id: 'extracted_info',
                name: 'extracted_info',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Extracted newsletter information'
                },
                io_type: 'input',
                required: true,
                status: 'pending',
                createdBy: 'stage-3'
            }, {
                variable_id: 'newsletter_summary',
                name: 'newsletter_summary',
                schema: {
                    type: 'object',
                    is_array: false,
                    description: 'Comprehensive summary of newsletters',
                    fields: {
                        overview: { type: 'string', is_array: false, description: 'High-level overview' },
                        key_trends: { type: 'string', is_array: true, description: 'Identified trends' },
                        highlights: { type: 'string', is_array: true, description: 'Important highlights' },
                        recommendations: { type: 'string', is_array: true, description: 'Action items or recommendations' }
                    }
                },
                io_type: 'output',
                status: 'pending',
                createdBy: 'stage-3'
            }],
            inputMappings: [],
            outputMappings: [],
            status: 'pending',
            success_criteria: ['Generate comprehensive summary', 'Identify trends across newsletters', 'Provide actionable insights'],
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
        }
    ],
    childVariables: [{
        variable_id: 'email_credentials',
        name: 'email_credentials',
        schema: {
            type: 'object',
            is_array: false,
            description: 'Email account credentials and configuration'
        },
        io_type: 'input',
        required: true,
        status: 'pending',
        createdBy: 'workflow-1'
    }, {
        variable_id: 'newsletter_summary',
        name: 'newsletter_summary',
        schema: {
            type: 'object',
            is_array: false,
            description: 'Final summary and insights from newsletters'
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
    title: 'Newsletter Intelligence',
    goal: 'Process and analyze email newsletters to extract key information and generate actionable insights',
    status: 'active',
    workflow: workflowExample,
    childVariables: [{
        variable_id: 'email_credentials',
        name: 'email_credentials',
        schema: {
            type: 'object',
            is_array: false,
            description: 'Email account credentials and configuration'
        },
        io_type: 'input',
        required: true,
        status: 'pending',
        createdBy: 'mission-1'
    }, {
        variable_id: 'newsletter_summary',
        name: 'newsletter_summary',
        schema: {
            type: 'object',
            is_array: false,
            description: 'Final summary and insights from newsletters'
        },
        io_type: 'output',
        status: 'pending',
        createdBy: 'mission-1'
    }],
    inputMappings: [],
    outputMappings: [],
    resources: ['Email API', 'Natural Language Processing Tools', 'Text Analysis Libraries'],
    success_criteria: [
        'Successfully process all newsletters from the last 30 days',
        'Extract meaningful insights and trends',
        'Generate actionable recommendations'
    ],
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

