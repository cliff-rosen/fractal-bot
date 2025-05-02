import { Asset, ChatMessage, Mission, Workflow, Workspace, WorkspaceState, Tool } from './index';
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
    assets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}
// default mission object
export const missionTemplate: Mission = {
    id: 'mission-template',
    title: '',
    goal: '',
    status: 'pending',
    workflow: workflowTemplate,
    assets: [],
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
    inputs: ["Ranking criteria (e.g., faculty quality, facilities, alumni success)", "Geographic scope (United States)"],
    resources: ["College databases", "Dance program directories", "Ranking methodologies"],
    outputs: ["Ranked list of top 10 colleges with justification for each ranking"],
    success_criteria: ["The list includes 10 colleges", "Each college ranking is justified with data", "Criteria for ranking are consistently applied"],
    selectedTools: [{"id": "tool1", "name": "College Database Search", "description": "A tool to search and retrieve data from college databases.", "category": "Data Retrieval", "inputs": [{"type": "string", "is_array": false, "name": "Search Query", "description": "The search query to find colleges offering dance programs."}], "outputs": [{"type": "array", "is_array": true, "name": "College List", "description": "A list of colleges retrieved from the database."}], "steps": null}, {"id": "tool2", "name": "Ranking Methodology Application", "description": "A tool to apply ranking methodologies to the list of colleges.", "category": "Data Analysis", "inputs": [{"type": "array", "is_array": true, "name": "College List", "description": "The list of colleges to be ranked."}, {"type": "array", "is_array": true, "name": "Ranking Criteria", "description": "The criteria used to rank the colleges."}], "outputs": [{"type": "array", "is_array": true, "name": "Ranked College List", "description": "A list of colleges ranked according to the specified criteria."}], "steps": null}], "has_sufficient_info": true, "missing_info_explanation": ""
}

export const missionExample = createMissionFromProposal(missionProposalTemplate);


export const workspaceStateTemplate: WorkspaceState = {
    currentMissionId: null,
    currentStageId: null,
    currentStepPath: [],
    viewMode: 'compact',
}

// default assets object
export const assetsTemplate: Asset[] = [];

export const toolsTemplate: Tool[] = [
    {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the web for information',
        category: 'Search',
        inputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Search Query',
                description: 'The search terms to look for on the web'
            }
        ],
        outputs: [
            {
                type: 'string',
                is_array: true,
                name: 'Search Results',
                description: 'List of relevant web search results'
            }
        ]
    },
    {
        id: 'email-search',
        name: 'Email Search',
        description: 'Search through email content',
        category: 'Search',
        inputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Search Query',
                description: 'The search terms to look for in emails'
            }
        ],
        outputs: [
            {
                type: 'string',
                is_array: true,
                name: 'Email Results',
                description: 'List of matching email content'
            }
        ]
    },
    {
        id: 'extract-info',
        name: 'Extract Info',
        description: 'Extract information from documents',
        category: 'Document Processing',
        inputs: [
            {
                type: 'file',
                is_array: false,
                name: 'Document',
                description: 'The document to extract information from'
            }
        ],
        outputs: [
            {
                type: 'object',
                is_array: false,
                name: 'Extracted Information',
                description: 'Structured data extracted from the document'
            }
        ]
    },
    {
        id: 'add-to-kb',
        name: 'Add to KB',
        description: 'Add information to knowledge base',
        category: 'Knowledge Base',
        inputs: [
            {
                type: 'object',
                is_array: false,
                name: 'Knowledge Item',
                description: 'The information to add to the knowledge base'
            },
            {
                type: 'object',
                is_array: false,
                name: 'Knowledge KB',
                description: 'The knowledge base to add the information to'
            }
        ],
        outputs: [
            {
                type: 'object',
                is_array: false,
                name: 'Knowledge KB',
                description: 'The updated knowledge base'
            }
        ]
    },
    {
        id: 'search-kb',
        name: 'Search KB',
        description: 'Search the knowledge base',
        category: 'Knowledge Base',
        inputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Search Query',
                description: 'The search terms to look for in the knowledge base'
            }
        ],
        outputs: [
            {
                type: 'object',
                is_array: true,
                name: 'Knowledge Results',
                description: 'List of matching knowledge base entries'
            }
        ]
    },
    {
        id: 'generate-query',
        name: 'Generate Query',
        description: 'Generate optimized search queries',
        category: 'Query Processing',
        inputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Question',
                description: 'The question to generate a search query for'
            }
        ],
        outputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Search Query',
                description: 'Optimized search query for the question'
            }
        ]
    },
    {
        id: 'improve-question',
        name: 'Improve Question',
        description: 'Enhance and clarify questions',
        category: 'Query Processing',
        inputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Question',
                description: 'The question to improve'
            }
        ],
        outputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Improved Question',
                description: 'Enhanced and clarified version of the question'
            }
        ]
    },
    {
        id: 'retrieval',
        name: 'Retrieval',
        description: 'Retrieve relevant information for a question through a multi-step process',
        category: 'Information Retrieval',
        inputs: [
            {
                type: 'string',
                is_array: false,
                name: 'Question',
                description: 'The question to retrieve information for'
            }
        ],
        outputs: [
            {
                type: 'object',
                is_array: true,
                name: 'Retrieved Information',
                description: 'List of relevant information retrieved for the question'
            }
        ],
        steps: [
            {
                name: 'Generate Query',
                description: 'Convert the question into an optimized search query',
                tool_id: 'generate-query',
                inputs: [
                    {
                        type: 'string',
                        is_array: false,
                        name: 'Question',
                        description: 'The question to generate a search query for'
                    }
                ],
                outputs: [
                    {
                        type: 'string',
                        is_array: false,
                        name: 'Search Query',
                        description: 'Optimized search query for the question'
                    }
                ]
            },
            {
                name: 'Web Search',
                description: 'Search the web using the generated query',
                tool_id: 'web-search',
                inputs: [
                    {
                        type: 'string',
                        is_array: false,
                        name: 'Search Query',
                        description: 'The search terms to look for on the web'
                    }
                ],
                outputs: [
                    {
                        type: 'string',
                        is_array: true,
                        name: 'Search Results',
                        description: 'List of relevant web search results'
                    }
                ]
            },
            {
                name: 'Extract Information',
                description: 'Extract relevant information from search results',
                tool_id: 'extract-info',
                inputs: [
                    {
                        type: 'string',
                        is_array: true,
                        name: 'Search Results',
                        description: 'The search results to extract information from'
                    }
                ],
                outputs: [
                    {
                        type: 'object',
                        is_array: true,
                        name: 'Extracted Information',
                        description: 'Structured information extracted from search results'
                    }
                ]
            }
        ]
    }
];

