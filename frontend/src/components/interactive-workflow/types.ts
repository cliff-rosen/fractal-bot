export type WorkflowPhase = 'setup' | 'execution';
export type SetupSubPhase =
    | 'question_development'
    | 'workflow_development'
    | 'workflow_designing'
    | 'workflow_ready';

export type SetupStage =
    | 'initial'                    // Initial welcome message
    | 'goal_definition'           // User defining their goal/intent
    | 'clarification'             // Copilot asking for clarification
    | 'workflow_design'           // Copilot designing workflow
    | 'workflow_review'           // User reviewing proposed workflow
    | 'workflow_ready';           // Ready to execute

export type ExecutionStage =
    | 'started'                   // Workflow execution started
    | 'in_progress'              // Steps being executed
    | 'paused'                   // Execution paused
    | 'completed'                // Workflow completed
    | 'failed';                  // Workflow failed

export interface WorkflowState {
    phase: WorkflowPhase;
    setupStage: SetupStage;
    executionStage: ExecutionStage;
    currentStepIndex: number;
    isProcessing: boolean;
}

export type WorkflowStep = {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    agentType: string;
    level: number;              // Depth in the tree (0 for main steps)
    tools: string[];           // Tools used in this step
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    progress: number;          // Progress percentage (0-100)
    assets: Asset[];          // Assets generated in this step
    subSteps?: WorkflowStep[]; // Nested steps
    parentId?: string;        // Reference to parent step
    isExpanded?: boolean;
};

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: {
        type: 'goal' | 'clarification' | 'suggestion' | 'confirmation' | 'status' | 'result' | 'error';
        phase?: WorkflowPhase;
        stepId?: string;
        assetIds?: string[];
        toolIds?: string[];
        reactionIds?: string[];
    };
    reactions?: MessageReaction[];
    thread?: ChatMessage[];
};

export type WorkflowStepTemplate = {
    id: string;
    name: string;
    description: string;
    agentType: string;
};

export type InformationAsset = {
    id: string;
    stepId: string;            // ID of the step that generated this asset
    type: 'search_result' | 'generated_content' | 'analysis_output' | 'intermediate_finding';
    content: any;              // The actual content of the asset
    metadata: {
        tool?: string;         // Tool used to generate this asset
        timestamp: string;     // When the asset was created
        tags: string[];       // For organization/filtering
    };
};

export type StepDetails = {
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    status: string;
    progress: number;
    assets: InformationAsset[];  // Track assets generated in this step
};

export type ToolTemplate = {
    id: string;
    name: string;
    description: string;
    category: 'search' | 'list' | 'analysis' | 'generation';
    icon: string;
};

export interface Asset {
    id: string;
    title: string;
    type: 'input' | 'output' | 'intermediate';
    format: 'text' | 'json' | 'pdf' | 'image' | 'other';
    content: any;
    metadata: {
        creator: string;
        createdAt: string;
        updatedAt: string;
        tags: string[];
        stepId?: string;
        toolId?: string;
    };
    version: number;
    history: AssetVersion[];
};

export interface AssetVersion {
    version: number;
    content: any;
    updatedAt: string;
    updatedBy: string;
};

export interface MessageReaction {
    id: string;
    type: '👍' | '👎' | '⭐' | '❓' | '💡';
    userId: string;
    timestamp: string;
};

export interface Tool {
    id: string;
    name: string;
    description: string;
    category: 'search' | 'analysis' | 'generation' | 'transformation';
    capabilities: string[];
    parameters: ToolParameter[];
    icon: string;
    metrics?: {
        usageCount: number;
        avgDuration: number;
        successRate: number;
    };
};

export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    required: boolean;
    default?: any;
};

export interface Journey {
    id: string;
    title: string;
    goal: string;
    status: 'draft' | 'active' | 'completed' | 'failed';
    creator: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    deliverableType: 'summary' | 'draft' | 'report' | 'dataset' | 'visual' | 'decision' | 'plan';
    workflow?: Workflow;
};

export interface Workflow {
    id: string;
    journeyId: string;
    steps: WorkflowStep[];
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
    currentStepIndex: number;
    assets: Asset[];
};

export interface Agent {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    tools: string[];
    configuration: Record<string, any>;
    metrics?: {
        usageCount: number;
        avgDuration: number;
        successRate: number;
    };
}; 