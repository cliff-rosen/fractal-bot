import { Mission, Stage, Step, Asset, ChatMessage, Workspace, Workflow, WorkspaceState } from '../types';
import { MockDataSnapshot } from './data';

// Empty mock data snapshot
export const mockDataSnapshot0: MockDataSnapshot = {
    mission: {
        id: '',
        title: '',
        description: '',
        goal: '',
        status: 'pending',
        workflow: {
            id: '',
            name: '',
            description: '',
            status: 'pending',
            stages: [],
            assets: [],
            createdAt: '',
            updatedAt: ''
        },
        assets: [],
        inputs: [],
        outputs: [],
        createdAt: '',
        updatedAt: ''
    },
    workflow: {
        id: '',
        name: '',
        description: '',
        status: 'pending',
        stages: [],
        assets: [],
        createdAt: '',
        updatedAt: ''
    },
    stages: [],
    steps: [],
    assets: [],
    chatMessages: [],
    workspace: {
        id: '',
        type: 'workflowStepStatus',
        title: '',
        status: 'pending',
        content: {
            text: '',
            assets: []
        },
        actionButtons: [],
        createdAt: '',
        updatedAt: ''
    },
    workspaceState: {
        currentMissionId: null,
        currentStageId: null,
        currentStepPath: [],
        viewMode: 'compact'
    }
}; 