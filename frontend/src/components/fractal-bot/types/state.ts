// Basic types
export type Phase = 'setup' | 'execution' | 'complete';

export type MessageType =
    | 'text'
    | 'action_prompt'
    | 'agent_update'
    | 'asset_added';

// Message types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    type: MessageType;
    actionButton?: {
        label: string;
        action: string;
        disabled?: boolean;
    };
}

// Asset Types
export enum AssetType {
    TEXT = 'text',
    DATA = 'data',
    PDF = 'pdf',
    SPREADSHEET = 'spreadsheet',
    IMAGE = 'image',
    CODE = 'code',
    DOCUMENT = 'document'
}

export enum AssetStatus {
    PROPOSED = 'proposed',
    PENDING = 'pending',
    READY = 'ready',
    ERROR = 'error'
}

export interface Asset {
    asset_id: string;
    type: AssetType;
    content: any;
    metadata: {
        status: AssetStatus;
        createdAt: Date;
        updatedAt: Date;
        creator: string;  // user/bot/agent
        tags: string[];
        agent_associations: string[];  // agent_ids
        version: number;
    };
}

// Agent Types
export enum AgentType {
    DATA_COLLECTION = 'data_collection',
    INFORMATION_RETRIEVAL = 'information_retrieval',
    ANALYSIS = 'analysis'
}

export enum AgentStatus {
    IDLE = 'idle',
    RUNNING = 'running',
    COMPLETED = 'completed',
    ERROR = 'error'
}

export interface Agent {
    agent_id: string;
    type: string;
    description: string;
    status: AgentStatus;
    metadata: {
        createdAt: Date;
        lastRunAt?: Date;
        progress?: number;
        estimatedCompletion?: Date;
    };
}

// Message Types
export enum MessageRole {
    USER = 'user',
    BOT = 'bot'
}

export enum ActionType {
    CREATE_ASSET = 'create_asset',
    START_AGENT = 'start_agent',
    APPROVE_AGENT = 'approve_agent',
    REJECT_AGENT = 'reject_agent',
    LAUNCH_AGENT = 'launch_agent',
    MODIFY_ASSET = 'modify_asset',
    NEXT_STEP = 'next_step'
}

export interface ActionButton {
    label: string;
    action: ActionType;
}

export interface Message {
    message_id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    metadata?: {
        actionButtons?: ActionButton[];
    };
}

// Chat Response Types
export interface ChatResponse {
    message: Message;
    sideEffects?: {
        assets?: Asset[];
        agents?: Agent[];
    };
}

// Workflow Types
export enum WorkflowStatus {
    IDLE = 'idle',
    RUNNING = 'running',
    COMPLETED = 'completed',
    ERROR = 'error'
}

export interface WorkflowState {
    currentStep: number;
    totalSteps: number;
    status: WorkflowStatus;
}

// Turn state represents a single interaction cycle
export interface TurnState {
    messages: ChatMessage[];
    newAgents: Agent[];
    updatedAgents: Record<string, Partial<Agent>>;
    newAssets: Asset[];
}

// Main state interface
export interface FractalBotState {
    phase: Phase;
    messages: ChatMessage[];
    agents: Record<string, Agent>;
    assets: Asset[];
    currentTurn?: TurnState;
    metadata: {
        lastUpdated: string;
        isProcessing: boolean;
        [key: string]: any;
    };
}

// Action creators for managing turns
export const createTurn = (): TurnState => ({
    messages: [],
    newAgents: [],
    updatedAgents: {},
    newAssets: []
});

// Initial state factory
export const createInitialState = (): FractalBotState => ({
    phase: 'setup',
    messages: [],
    agents: {
        'fact-checker-agent': {
            id: 'fact-checker-agent',
            title: 'Fact Checker',
            description: 'Verify and validate information across multiple sources',
            status: 'completed',
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
        }
    },
    assets: [],
    metadata: {
        lastUpdated: new Date().toISOString(),
        isProcessing: false
    }
}); 