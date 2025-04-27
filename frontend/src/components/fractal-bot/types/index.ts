// Common status types
export type Status = 'completed' | 'current' | 'pending' | 'failed' | 'in_progress';
export type AssetStatus = 'pendingCompletion' | 'pendingApproval' | 'ready' | 'archived' | 'error';

// Workspace types
export type WorkspaceType = 'proposedMission' | 'proposedWorkflowDesign' | 'workflowStepStatus' | 'stepDetails' | 'thinking' | 'progressUpdate' | 'text';

export type ProgressUpdate = {
    id: string;
    timestamp: string;
    title: string;
    details: string;
    status?: Status;
    progress?: number; // Optional progress percentage (0-100)
    icon?: string; // Optional icon name
};

export type Workspace = {
    id: string;
    type: WorkspaceType;
    title: string;
    status: Status;
    content?: {
        text?: string;
        step?: Step;
        mission?: Mission;
        workflow?: Workflow;
        assets?: Asset[];
        progressUpdates?: ProgressUpdate[]; // Array of progress updates
    };
    actionButtons?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
        disabled?: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
}


// Asset types
export type Asset = {
    id: string;
    name: string;
    type: string;
    status: AssetStatus;
    content: any;
    createdAt: string;
    updatedAt: string;
    version: number;
}

// Step types
export type Step = {
    id: string;
    name: string;
    description: string;
    status: Status;
    assets: {
        inputs: string[]; // Asset IDs
        outputs: string[]; // Asset IDs
    };
    tool?: {
        name: string;
        configuration: Record<string, any>;
    };
    substeps?: Step[];
    createdAt: string;
    updatedAt: string;
}

// Stage types
export type Stage = {
    id: string;
    name: string;
    description: string;
    status: Status;
    steps: Step[];
    assets: {
        inputs: string[]; // Asset IDs
        outputs: string[]; // Asset IDs
    };
    createdAt: string;
    updatedAt: string;
}

// Workflow types
export type Workflow = {
    id: string;
    name: string;
    description: string;
    status: Status;
    stages: Stage[];
    assets: Asset[];
    createdAt: string;
    updatedAt: string;
}

// Mission types
export type Mission = {
    id: string;
    title: string;
    description: string;
    goal: string;
    status: Status;
    workflow: Workflow;
    assets: Asset[];
    inputs: string[]; // Asset IDs
    outputs: string[]; // Asset IDs
    createdAt: string;
    updatedAt: string;
}

export type MissionProposal = {
    title: string;
    description: string;
    goal: string;
    inputs: string[];
    outputs: string[];
    success_criteria: string[];
}

// Chat message types
export type DataFromLine = {
    token: string | null;
    status: string | null;
    mission_proposal: MissionProposal | null;
    error: string | null;
}

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
        missionId?: string;
        stageId?: string;
        stepId?: string;
        assetId?: string;
    };
}

// Workspace types
export type WorkspaceState = {
    currentMissionId: string | null;
    currentStageId: string | null;
    // Array of step IDs representing the path through the step hierarchy
    // First element is the top-level step, last element is the current step
    currentStepPath: string[];
    viewMode: 'compact' | 'expanded';
}

export interface SchemaType {
    type: 'string' | 'file' | 'object';
    is_array: boolean;
    name: string;
    description: string;
}

export interface ToolStep {
    name: string;
    description: string;
    tool_id: string;
    inputs: SchemaType[];
    outputs: SchemaType[];
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    inputs: SchemaType[];
    outputs: SchemaType[];
    steps?: ToolStep[];
}

export interface ItemView {
    title: string;
    type: 'tools' | 'assets' | 'proposedMission' | 'proposedWorkflowDesign' | 'thinking' | 'progressUpdate' | 'text' | 'none';
    isOpen: boolean;
} 