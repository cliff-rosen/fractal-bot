import { Asset, ChatMessage, Mission, Workflow, Workspace, WorkspaceState, MissionProposal, Stage, WorkflowVariable } from './index';
import { Tool, ToolType, availableTools } from './tools';
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
    state: [],
    inputMappings: [],
    outputMappings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}


// Research workflow example
export const workflowExample: Workflow = {
    id: 'research-workflow',
    name: 'Research and Answer Generation',
    description: 'A comprehensive workflow for researching and answering complex questions using multiple tools',
    status: 'active',
    stages: [
        {
            id: 'question-processing',
            name: 'Question Processing',
            description: 'Improve and analyze the question to create clear requirements',
            steps: [
                {
                    id: 'improve-question',
                    name: 'Improve Question',
                    description: 'Improve and clarify the question',
                    type: 'atomic',
                    tool_id: 'question-improver',
                    status: 'unresolved',
                    state: [],
                    inputMappings: [{
                        sourceVariableId: 'workflow.question',
                        target: {
                            type: 'parameter',
                            name: 'question',
                            schema: {
                                type: 'string',
                                is_array: false,
                                description: 'The question to improve'
                            },
                            required: true
                        }
                    }],
                    outputMappings: [{
                        sourceVariableId: 'improved_question',
                        target: {
                            type: 'variable',
                            variableId: 'workflow.improved_question'
                        }
                    }],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            status: 'pending',
            state: [],
            inputMappings: [{
                sourceVariableId: 'workflow.question',
                target: {
                    type: 'variable',
                    variableId: 'workflow.question'
                }
            }],
            outputMappings: [
                {
                    sourceVariableId: 'workflow.improved_question',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.improved_question'
                    }
                },
                {
                    sourceVariableId: 'workflow.checklist',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.checklist'
                    }
                }
            ],
            success_criteria: [
                'Question is improved and clarified',
                'Requirements checklist is generated'
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'research',
            name: 'Research and Knowledge Building',
            description: 'Conduct research and build knowledge base from multiple sources',
            steps: [],
            status: 'pending',
            state: [],
            inputMappings: [
                {
                    sourceVariableId: 'workflow.improved_question',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.improved_question'
                    }
                },
                {
                    sourceVariableId: 'workflow.checklist',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.checklist'
                    }
                }
            ],
            outputMappings: [{
                sourceVariableId: 'workflow.knowledge_base',
                target: {
                    type: 'variable',
                    variableId: 'workflow.knowledge_base'
                }
            }],
            success_criteria: [
                'Effective search queries are generated',
                'Relevant sources are identified and analyzed',
                'Content is scraped from selected sources',
                'Knowledge base is initialized with relevant information'
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'answer-generation',
            name: 'Answer Generation',
            description: 'Generate and validate the final answer',
            steps: [],
            status: 'pending',
            state: [],
            inputMappings: [
                {
                    sourceVariableId: 'workflow.improved_question',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.improved_question'
                    }
                },
                {
                    sourceVariableId: 'workflow.checklist',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.checklist'
                    }
                },
                {
                    sourceVariableId: 'workflow.knowledge_base',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.knowledge_base'
                    }
                }
            ],
            outputMappings: [
                {
                    sourceVariableId: 'workflow.answer',
                    target: {
                        type: 'variable',
                        variableId: 'workflow.answer'
                    }
                }
            ],
            success_criteria: [
                'Comprehensive answer is generated',
                'Answer meets all requirements',
                'Answer is properly scored and validated'
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    state: [
        {
            variable_id: 'workflow.question',
            name: 'question',
            description: 'The original question',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The question to research'
            },
            io_type: 'input',
            required: true,
            status: 'pending',
            createdBy: 'research-workflow'
        },
        {
            variable_id: 'workflow.improved_question',
            name: 'improved_question',
            description: 'The improved and clarified question',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The improved version of the question'
            },
            io_type: 'output',
            status: 'pending',
            createdBy: 'research-workflow'
        },
        {
            variable_id: 'workflow.checklist',
            name: 'checklist',
            description: 'Requirements checklist for a complete answer',
            schema: {
                type: 'object',
                is_array: true,
                fields: {
                    item_to_score: { type: 'string', is_array: false },
                    current_score: { type: 'number', is_array: false },
                    explanation: { type: 'string', is_array: false }
                }
            },
            io_type: 'output',
            status: 'pending',
            createdBy: 'research-workflow'
        },
        {
            variable_id: 'workflow.knowledge_base',
            name: 'knowledge_base',
            description: 'The knowledge base built from research',
            schema: {
                type: 'object',
                is_array: true,
                fields: {
                    nugget_id: { type: 'string', is_array: false },
                    content: { type: 'string', is_array: false },
                    confidence: { type: 'number', is_array: false },
                    conflicts_with: { type: 'string', is_array: true }
                }
            },
            io_type: 'output',
            status: 'pending',
            createdBy: 'research-workflow'
        },
        {
            variable_id: 'workflow.answer',
            name: 'answer',
            description: 'The final answer',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The generated answer in markdown format',
                format: 'markdown'
            },
            io_type: 'output',
            status: 'pending',
            createdBy: 'research-workflow'
        }
    ],
    inputMappings: [{
        sourceVariableId: 'mission.question',
        target: {
            type: 'variable',
            variableId: 'workflow.question'
        }
    }],
    outputMappings: [
        {
            sourceVariableId: 'workflow.improved_question',
            target: {
                type: 'variable',
                variableId: 'mission.improved_question'
            }
        },
        {
            sourceVariableId: 'workflow.checklist',
            target: {
                type: 'variable',
                variableId: 'mission.checklist'
            }
        },
        {
            sourceVariableId: 'workflow.knowledge_base',
            target: {
                type: 'variable',
                variableId: 'mission.knowledge_base'
            }
        },
        {
            sourceVariableId: 'workflow.answer',
            target: {
                type: 'variable',
                variableId: 'mission.answer'
            }
        }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// default mission object
export const missionTemplate: Mission = {
    id: 'mission-template',
    title: '',
    goal: '',
    status: 'pending',
    workflow: workflowTemplate,
    state: [],
    inputMappings: [],
    outputMappings: [],
    resources: [],
    success_criteria: [],
    selectedTools: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

// Research mission example
export const missionExample: Mission = {
    id: 'research-mission',
    title: 'General Purpose Research Mission',
    goal: 'Research and provide a comprehensive answer to a complex question using multiple tools and sources',
    status: 'active',
    workflow: workflowExample,
    state: [
        {
            variable_id: 'question',
            name: 'question',
            description: 'The question to research',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The question to research'
            },
            io_type: 'input',
            required: true,
            status: 'pending',
            createdBy: 'research-mission'
        },
        {
            variable_id: 'answer',
            name: 'answer',
            description: 'The final answer',
            schema: {
                type: 'string',
                is_array: false,
                description: 'The generated answer in markdown format',
                format: 'markdown'
            },
            io_type: 'output',
            status: 'pending',
            createdBy: 'research-mission'
        }
    ],
    inputMappings: [],
    outputMappings: [],
    resources: [
        'Web Search API',
        'Content Scraping Tools',
        'Natural Language Processing',
        'Knowledge Base Management System'
    ],
    success_criteria: [
        'Question is improved and clarified',
        'Comprehensive research is conducted',
        'Knowledge base is properly maintained',
        'Answer meets all requirements',
        'Answer is properly formatted and validated'
    ],
    selectedTools: availableTools,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const workspaceStateTemplate: WorkspaceState = {
    currentMissionId: null,
    currentStageId: null,
    currentStepPath: [],
    viewMode: 'compact',
}

// default assets object
export const assetsTemplate: Asset[] = [];

