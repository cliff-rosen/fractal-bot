import { Asset, ChatMessage, Mission, Workflow, Workspace, WorkspaceState, Tool } from './index';

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
    description: '',
    status: 'pending',
    goal: '',
    workflow: workflowTemplate,
    assets: [],
    inputs: [],
    outputs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

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
        category: 'Search'
    },
    {
        id: 'email-search',
        name: 'Email Search',
        description: 'Search through email content',
        category: 'Search'
    },
    {
        id: 'extract-info',
        name: 'Extract Info',
        description: 'Extract information from documents',
        category: 'Document Processing'
    },
    {
        id: 'add-to-kb',
        name: 'Add to KB',
        description: 'Add information to knowledge base',
        category: 'Knowledge Base'
    },
    {
        id: 'search-kb',
        name: 'Search KB',
        description: 'Search the knowledge base',
        category: 'Knowledge Base'
    },
    {
        id: 'generate-query',
        name: 'Generate Query',
        description: 'Generate optimized search queries',
        category: 'Query Processing'
    },
    {
        id: 'improve-question',
        name: 'Improve Question',
        description: 'Enhance and clarify questions',
        category: 'Query Processing'
    }
];

