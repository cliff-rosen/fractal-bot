import { Asset, ChatMessage, Mission, Workflow, Workspace, WorkspaceState } from './index';

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

