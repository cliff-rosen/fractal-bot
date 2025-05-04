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

// Variable status types
export type VariableStatus = 'pending' | 'ready' | 'error';

// Base variable type - combines schema with identifiers and value
export interface WorkflowVariable {
    variable_id: string;     // System-wide unique ID
    name: string;           // Reference name in current context
    schema: Schema;         // Structure definition
    value?: SchemaValueType; // Actual data
    description?: string;   // Human-readable description
    io_type: 'input' | 'output' | 'evaluation';
    required?: boolean;
    status: VariableStatus;  // Current status of the variable
    error_message?: string;  // Optional error message when status is 'error'
}

// Common status types
export type Status = 'completed' | 'current' | 'pending' | 'failed' | 'in_progress' | 'ready';
export type AssetStatus = 'pendingCompletion' | 'pendingApproval' | 'ready' | 'archived' | 'error';

// Step execution states
export type StepExecutionState = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'blocked';

// Step configuration states
export type StepConfigState = 'unconfigured' | 'configuring' | 'resolved' | 'inputs_pending' | 'error';

// Step status type that combines execution and configuration states
export interface StepStatus {
    executionState: StepExecutionState;
    configState: StepConfigState;
    lastUpdated: string;
    error?: string;
}

// Helper function to check if a step is resolved
export function isStepResolved(step: Step): boolean {
    // Check if all required inputs are ready
    const allInputsReady = step.inputs
        .filter(input => input.required)
        .every(input => input.status === 'ready');

    if (!allInputsReady) {
        return false;
    }

    if (step.type === 'atomic') {
        // Atomic step is resolved if it has a configured tool
        return step.tool !== undefined;
    } else if (step.type === 'composite') {
        // Composite step is resolved if it has at least 2 child steps and all are resolved
        return step.substeps !== undefined &&
            step.substeps.length >= 2 &&
            step.substeps.every(substep => isStepResolved(substep));
    }
    return false;
}

// Helper function to get step status
export function getStepStatus(step: Step): StepStatus {
    const resolved = isStepResolved(step);

    // Check input readiness
    const allInputsReady = step.inputs
        .filter(input => input.required)
        .every(input => input.status === 'ready');

    // Check for input errors
    const hasInputErrors = step.inputs
        .filter(input => input.required)
        .some(input => input.status === 'error');

    let configState: StepConfigState;
    if (hasInputErrors) {
        configState = 'error';
    } else if (!allInputsReady) {
        configState = 'inputs_pending';
    } else if (resolved) {
        configState = 'resolved';
    } else if (step.tool || (step.substeps && step.substeps.length > 0)) {
        configState = 'configuring';
    } else {
        configState = 'unconfigured';
    }

    return {
        executionState: step.status as StepExecutionState,
        configState,
        lastUpdated: step.updatedAt,
        error: step.status === 'failed' ? 'Step execution failed' : undefined
    };
}

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
    status: StepExecutionState;     // Updated to use StepExecutionState type
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
        type?: 'status' | 'error' | 'info';
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