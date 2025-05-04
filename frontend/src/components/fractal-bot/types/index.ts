// Basic type definitions
export type PrimitiveType = 'string' | 'number' | 'boolean';
export type ComplexType = 'object' | 'file';
export type ValueType = PrimitiveType | ComplexType;

// File value type
export interface FileValue {
    file_id: string;
    name: string;
    description?: string;
    content: Uint8Array;
    mime_type: string;
    size: number;
    extracted_text?: string;
    created_at: string;
    updated_at: string;
}

// Query value type
export interface Query {
    text: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
}

// Search result type
export interface SearchResult {
    id: string;
    score: number;
    content: string;
    metadata?: Record<string, any>;
}

// Knowledge base type
export interface KnowledgeBase {
    id: string;
    name: string;
    description?: string;
    content: string;
    metadata?: Record<string, any>;
}

// Core schema definition that describes the shape/structure of a value
export interface Schema {
    type: ValueType;
    description?: string;
    is_array: boolean;  // If true, the value will be an array of the base type
    // Only used for object type
    fields?: Record<string, Schema>;
    // Format constraints
    format?: string;
    content_types?: string[];
}

// Runtime value type for any schema
export type SchemaValueType =
    | string
    | number
    | boolean
    | object
    | FileValue
    | Query
    | SearchResult
    | KnowledgeBase;

// Base variable type - combines schema with identifiers and value
export interface WorkflowVariable {
    variable_id: string;     // System-wide unique ID
    name: string;           // Reference name in current context
    schema: Schema;         // Structure definition
    value?: SchemaValueType; // Actual data
    description?: string;   // Human-readable description
    io_type: 'input' | 'output' | 'evaluation';
    required?: boolean;
}

// Common status types
export type Status = 'completed' | 'current' | 'pending' | 'failed' | 'in_progress' | 'ready';
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

export type StageGeneratorResult = {
    stages: Stage[];
    inputs: WorkflowVariable[];
    outputs: WorkflowVariable[];
    success_criteria: string[];
    explanation: string;
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
    inputs: WorkflowVariable[];
    outputs: WorkflowVariable[];
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    inputs: WorkflowVariable[];
    outputs: WorkflowVariable[];
    steps?: ToolStep[];
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
export interface Step {
    id: string;
    name: string;
    description: string;
    tool_id: string;
    inputs: WorkflowVariable[];
    outputs: WorkflowVariable[];
    substeps?: Step[];  // Nested steps
    status: string;     // Step status
    assets: Record<string, string[]>;  // Assets associated with the step
    createdAt: string;  // Creation timestamp
    updatedAt: string;  // Update timestamp
    type?: 'atomic' | 'composite';  // Step type
    tool?: Tool;  // Associated tool
    isSubstep?: boolean;  // Whether this is a substep
}

// Stage types
export interface Stage {
    id: string;
    name: string;
    description: string;
    steps: Step[];
    inputs: WorkflowVariable[];
    outputs: WorkflowVariable[];
    status: string;
    success_criteria: string[];
    createdAt: string;
    updatedAt: string;
}

// Workflow types
export interface Workflow {
    id: string;
    name: string;
    description: string;
    status: string;
    stages: Stage[];
    inputs: WorkflowVariable[];
    outputs: WorkflowVariable[];
    createdAt: string;
    updatedAt: string;
}

// Mission types
export interface Mission {
    id: string;
    title: string;
    goal: string;
    status: string;
    workflow: Workflow;
    inputs: WorkflowVariable[];
    resources: string[];  // General resources needed but not specific data objects
    outputs: WorkflowVariable[];
    success_criteria: string[];
    selectedTools: Tool[];
    createdAt: string;
    updatedAt: string;
}

export type MissionProposal = {
    title: string;
    goal: string;
    inputs: WorkflowVariable[];
    resources: string[];  // General resources needed but not specific data objects
    outputs: WorkflowVariable[];
    success_criteria: string[];
    selectedTools: Tool[];
    has_sufficient_info: boolean;
    missing_info_explanation: string;
}

// Chat message types
export type DataFromLine = {
    token: string | null;
    status: string | null;
    mission_proposal: MissionProposal | null;
    error: string | null;
    message: string | null;
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

export interface ItemView {
    title: string;
    type: 'tools' | 'assets' | 'proposedMission' | 'proposedWorkflowDesign' | 'thinking' | 'progressUpdate' | 'text' | 'none';
    isOpen: boolean;
} 