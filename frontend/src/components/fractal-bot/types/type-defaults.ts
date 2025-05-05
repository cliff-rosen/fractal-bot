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
    inputs: [],
    outputs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

export const toolsTemplate: Tool[] = [
    {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the web for information',
        category: 'Search',
        inputs: [{
            variable_id: 'search_query',
            name: 'search_query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The search terms to look for on the web'
            },
            io_type: 'input',
            required: true,
            status: 'pending'
        }],
        outputs: [{
            variable_id: 'search_results',
            name: 'search_results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of relevant web search results'
            },
            io_type: 'output',
            status: 'pending'
        }]
    },
    {
        id: 'email-search',
        name: 'Email Search',
        description: 'Search through email content',
        category: 'Search',
        inputs: [{
            variable_id: 'email_query',
            name: 'email_query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The search terms to look for in emails'
            },
            io_type: 'input',
            required: true,
            status: 'pending'
        }],
        outputs: [{
            variable_id: 'email_results',
            name: 'email_results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of matching email content'
            },
            io_type: 'output',
            status: 'pending'
        }]
    },
    {
        id: 'extract-info',
        name: 'Extract Info',
        description: 'Extract information from documents',
        category: 'Document Processing',
        inputs: [{
            variable_id: 'document',
            name: 'document',
            schema: {
                type: 'file',
                is_array: false,
                description: 'The document to extract information from'
            },
            io_type: 'input',
            required: true,
            status: 'pending'
        }],
        outputs: [{
            variable_id: 'extracted_info',
            name: 'extracted_info',
            schema: {
                type: 'object',
                is_array: false,
                description: 'Structured data extracted from the document'
            },
            io_type: 'output',
            status: 'pending'
        }]
    },
    {
        id: 'add-to-kb',
        name: 'Add to KB',
        description: 'Add information to knowledge base',
        category: 'Knowledge Base',
        inputs: [{
            variable_id: 'knowledge_item',
            name: 'knowledge_item',
            schema: {
                type: 'object',
                is_array: false,
                description: 'The information to add to the knowledge base'
            },
            io_type: 'input',
            required: true,
            status: 'pending'
        }, {
            variable_id: 'knowledge_base',
            name: 'knowledge_base',
            schema: {
                type: 'object',
                is_array: false,
                description: 'The knowledge base to add the information to'
            },
            io_type: 'input',
            required: true,
            status: 'pending'
        }],
        outputs: [{
            variable_id: 'updated_kb',
            name: 'updated_kb',
            schema: {
                type: 'object',
                is_array: false,
                description: 'The updated knowledge base'
            },
            io_type: 'output',
            status: 'pending'
        }]
    },
    {
        id: 'search-kb',
        name: 'Search KB',
        description: 'Search the knowledge base',
        category: 'Knowledge Base',
        inputs: [{
            variable_id: 'kb_query',
            name: 'kb_query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The search terms to look for in the knowledge base'
            },
            io_type: 'input',
            required: true,
            status: 'pending'
        }],
        outputs: [{
            variable_id: 'kb_results',
            name: 'kb_results',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of matching knowledge base entries'
            },
            io_type: 'output',
            status: 'pending'
        }]
    },
    {
        id: 'generate-query',
        name: 'Generate Query',
        description: 'Generate optimized search queries',
        category: 'Query Processing',
        inputs: [{
            variable_id: 'question',
            name: 'question',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The question to generate a search query for'
            },
            io_type: 'input',
            required: true,
            status: 'pending'
        }],
        outputs: [{
            variable_id: 'generated_query',
            name: 'generated_query',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The generated search query'
            },
            io_type: 'output',
            status: 'pending'
        }]
    },
    {
        id: 'improve-question',
        name: 'Improve Question',
        description: 'Enhance and clarify questions',
        category: 'Query Processing',
        inputs: [{
            variable_id: 'question',
            name: 'question',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The question to improve'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'improved_question',
            name: 'improved_question',
            schema: {
                type: 'string',
                is_array: false,
                description: 'Enhanced and clarified version of the question'
            },
            io_type: 'output'
        }]
    },
    {
        id: 'retrieval',
        name: 'Retrieval',
        description: 'Retrieve relevant information for a question through a multi-step process',
        category: 'Information Retrieval',
        inputs: [{
            variable_id: 'question',
            name: 'question',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The question to retrieve information for'
            },
            io_type: 'input',
            required: true
        }],
        outputs: [{
            variable_id: 'retrieved_info',
            name: 'retrieved_info',
            schema: {
                type: 'object',
                is_array: true,
                description: 'List of relevant information retrieved for the question'
            },
            io_type: 'output'
        }],
        steps: [
            {
                name: 'Generate Query',
                description: 'Convert the question into an optimized search query',
                tool_id: 'generate-query',
                inputs: [{
                    variable_id: 'question',
                    name: 'question',
                    schema: {
                        type: 'string',
                        is_array: false,
                        description: 'The question to generate a search query for'
                    },
                    io_type: 'input',
                    required: true
                }],
                outputs: [{
                    variable_id: 'search_query',
                    name: 'search_query',
                    schema: {
                        type: 'string',
                        is_array: false,
                        description: 'Optimized search query for the question'
                    },
                    io_type: 'output'
                }]
            },
            {
                name: 'Web Search',
                description: 'Search the web using the generated query',
                tool_id: 'web-search',
                inputs: [{
                    variable_id: 'search_query',
                    name: 'search_query',
                    schema: {
                        type: 'string',
                        is_array: false,
                        description: 'The search terms to look for on the web'
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
                        description: 'List of relevant web search results'
                    },
                    io_type: 'output'
                }]
            },
            {
                name: 'Extract Information',
                description: 'Extract relevant information from search results',
                tool_id: 'extract-info',
                inputs: [{
                    variable_id: 'search_results',
                    name: 'search_results',
                    schema: {
                        type: 'object',
                        is_array: true,
                        description: 'The search results to extract information from'
                    },
                    io_type: 'input',
                    required: true
                }],
                outputs: [{
                    variable_id: 'extracted_info',
                    name: 'extracted_info',
                    schema: {
                        type: 'object',
                        is_array: true,
                        description: 'Structured information extracted from search results'
                    },
                    io_type: 'output'
                }]
            }
        ]
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
            steps: [
                {
                    id: 'step-1',
                    name: 'Search for Colleges',
                    description: 'Find colleges with dance programs',
                    tool_id: 'web-search',
                    inputs: [{
                        variable_id: 'search_query',
                        name: 'search_query',
                        schema: {
                            type: 'string',
                            is_array: false,
                            description: 'Search query for colleges with dance programs'
                        },
                        io_type: 'input',
                        required: true
                    }],
                    outputs: [{
                        variable_id: 'college_list',
                        name: 'college_list',
                        schema: {
                            type: 'object',
                            is_array: true,
                            description: 'List of colleges with dance programs'
                        },
                        io_type: 'output'
                    }],
                    status: 'pending',
                    assets: {},
                    createdAt: '2024-03-20T10:00:00Z',
                    updatedAt: '2024-03-20T10:00:00Z'
                },
                {
                    id: 'step-2',
                    name: 'Extract Program Details',
                    description: 'Extract specific program information',
                    tool_id: 'extract-info',
                    inputs: [{
                        variable_id: 'college_list',
                        name: 'college_list',
                        schema: {
                            type: 'object',
                            is_array: true,
                            description: 'List of colleges to extract program details from'
                        },
                        io_type: 'input',
                        required: true
                    }],
                    outputs: [{
                        variable_id: 'program_details',
                        name: 'program_details',
                        schema: {
                            type: 'object',
                            is_array: true,
                            description: 'Detailed information about dance programs'
                        },
                        io_type: 'output'
                    }],
                    status: 'pending',
                    assets: {},
                    createdAt: '2024-03-20T10:00:00Z',
                    updatedAt: '2024-03-20T10:00:00Z'
                }
            ],
            inputs: [{
                variable_id: 'search_query',
                name: 'search_query',
                schema: {
                    type: 'string',
                    is_array: false,
                    description: 'Search query for colleges with dance programs'
                },
                io_type: 'input',
                required: true
            }],
            outputs: [{
                variable_id: 'program_details',
                name: 'program_details',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Detailed information about dance programs'
                },
                io_type: 'output'
            }],
            status: 'pending',
            success_criteria: ['Gather information from at least 10 colleges'],
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
        },
        {
            id: 'stage-2',
            name: 'Analysis',
            description: 'Analyze and compare programs',
            steps: [
                {
                    id: 'step-3',
                    name: 'Compare Programs',
                    description: 'Compare dance programs across colleges',
                    tool_id: 'search-kb',
                    inputs: [{
                        variable_id: 'program_details',
                        name: 'program_details',
                        schema: {
                            type: 'object',
                            is_array: true,
                            description: 'Program details to compare'
                        },
                        io_type: 'input',
                        required: true
                    }],
                    outputs: [{
                        variable_id: 'comparison_results',
                        name: 'comparison_results',
                        schema: {
                            type: 'object',
                            is_array: true,
                            description: 'Comparison of dance programs'
                        },
                        io_type: 'output'
                    }],
                    status: 'pending',
                    assets: {},
                    createdAt: '2024-03-20T10:00:00Z',
                    updatedAt: '2024-03-20T10:00:00Z'
                }
            ],
            inputs: [{
                variable_id: 'program_details',
                name: 'program_details',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Program details to analyze'
                },
                io_type: 'input',
                required: true
            }],
            outputs: [{
                variable_id: 'comparison_results',
                name: 'comparison_results',
                schema: {
                    type: 'object',
                    is_array: true,
                    description: 'Analysis results of dance programs'
                },
                io_type: 'output'
            }],
            status: 'pending',
            success_criteria: ['Complete comparison of all programs'],
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
        }
    ],
    inputs: [{
        variable_id: 'search_query',
        name: 'search_query',
        schema: {
            type: 'string',
            is_array: false,
            description: 'Search query for colleges with dance programs'
        },
        io_type: 'input',
        required: true
    }],
    outputs: [{
        variable_id: 'comparison_results',
        name: 'comparison_results',
        schema: {
            type: 'object',
            is_array: true,
            description: 'Analysis results of dance programs'
        },
        io_type: 'output'
    }],
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
    inputs: [],
    resources: [],  // General resources needed but not specific data objects
    outputs: [],
    success_criteria: [],
    selectedTools: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

export const missionProposalTemplate: MissionProposal = {
    title: "Top 10 Dance Colleges in the United States",
    goal: "To produce a ranked list of the top 10 colleges for dance in the United States based on specified criteria.",
    inputs: [{
        variable_id: "ranking_criteria",
        name: "ranking_criteria",
        schema: {
            type: "string",
            is_array: true,
            description: "List of potential criteria (faculty quality, facilities, alumni success)"
        },
        io_type: "input",
        required: true
    }, {
        variable_id: "geographic_scope",
        name: "geographic_scope",
        schema: {
            type: "string",
            is_array: false,
            description: "Geographic scope (United States)"
        },
        io_type: "input",
        required: true
    }],
    resources: ["College databases", "Dance program directories", "Ranking methodologies"],
    outputs: [{
        variable_id: "ranked_list",
        name: "ranked_list",
        schema: {
            type: "object",
            is_array: true,
            description: "Ranked list of top 10 colleges with justification for each ranking"
        },
        io_type: "output"
    }],
    success_criteria: ["The list includes 10 colleges", "Each college ranking is justified with data", "Criteria for ranking are consistently applied"],
    selectedTools: [{
        id: "tool1",
        name: "College Database Search",
        description: "A tool to search and retrieve data from college databases.",
        category: "Data Retrieval",
        inputs: [{
            variable_id: "search_query",
            name: "search_query",
            schema: {
                type: "string",
                is_array: false,
                description: "The search query to find colleges offering dance programs."
            },
            io_type: "input",
            required: true
        }],
        outputs: [{
            variable_id: "college_list",
            name: "college_list",
            schema: {
                type: "object",
                is_array: true,
                description: "A list of colleges retrieved from the database."
            },
            io_type: "output"
        }]
    }, {
        id: "tool2",
        name: "Ranking Methodology Application",
        description: "A tool to apply ranking methodologies to the list of colleges.",
        category: "Data Analysis",
        inputs: [{
            variable_id: "college_list",
            name: "college_list",
            schema: {
                type: "object",
                is_array: true,
                description: "The list of colleges to be ranked."
            },
            io_type: "input",
            required: true
        }, {
            variable_id: "ranking_criteria",
            name: "ranking_criteria",
            schema: {
                type: "string",
                is_array: true,
                description: "The criteria used to rank the colleges."
            },
            io_type: "input",
            required: true
        }],
        outputs: [{
            variable_id: "ranked_college_list",
            name: "ranked_college_list",
            schema: {
                type: "object",
                is_array: true,
                description: "A list of colleges ranked according to the specified criteria."
            },
            io_type: "output"
        }]
    }],
    has_sufficient_info: true,
    missing_info_explanation: ""
}

export const missionExample: Mission = {
    id: 'mission-1',
    title: 'College Dance Program Research',
    goal: 'Research and analyze dance programs at various colleges',
    status: 'active',
    workflow: workflowExample,
    inputs: [{
        variable_id: 'search_query',
        name: 'search_query',
        schema: {
            type: 'string',
            is_array: false,
            description: 'Search query for colleges with dance programs'
        },
        io_type: 'input',
        required: true
    }],
    resources: [
        'College databases',
        'Dance program directories',
        'Ranking methodologies'
    ],
    outputs: [{
        variable_id: 'comparison_results',
        name: 'comparison_results',
        schema: {
            type: 'object',
            is_array: true,
            description: 'Analysis results of dance programs'
        },
        io_type: 'output'
    }],
    success_criteria: [
        'Identify top 10 dance programs',
        'Compare program requirements',
        'Analyze faculty qualifications'
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

