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
    PENDING = 'pending',
    READY = 'ready',
    ERROR = 'error'
}

export interface AssetMetadata {
    name?: string;
    type?: string;
    size?: number;
    lastModified?: number;
    createdAt?: string;
    updatedAt?: string;
    creator?: string;
    tags?: string[];
    agent_associations?: string[];
    version?: number;
}

export interface Asset {
    asset_id: string;
    name: string;
    description?: string;
    type: AssetType;
    content: any;
    status: AssetStatus;
    metadata?: AssetMetadata;
}

// Agent Types
export enum AgentType {
    DATA_COLLECTION = 'data_collection',
    INFORMATION_RETRIEVAL = 'information_retrieval',
    ANALYSIS = 'analysis',
    EMAIL_ACCESS = 'email_access',
    EMAIL_LABELS = 'email_labels'
}

export enum AgentStatus {
    IDLE = 'idle',
    RUNNING = 'running',
    COMPLETED = 'completed',
    ERROR = 'error'
}

export interface Agent {
    agent_id: string;
    type: AgentType;
    description: string;
    status: AgentStatus;
    metadata?: {
        createdAt?: string;
        progress?: number;
        estimatedCompletion?: string;
        lastRunAt?: string;
        completionTime?: string;
        lastError?: string;
    };
    input_parameters?: Record<string, any>;
    input_asset_ids?: string[];
    output_asset_ids?: string[];
}

// Message Types
export enum MessageRole {
    USER = 'user',
    ASSISTANT = 'assistant'
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
    role: MessageRole;
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

// Chat Response Types
export interface ChatResponse {
    message: Message;
    sideEffects?: {
        assets?: Asset[];
        agents?: Agent[];
        tool_use_history?: Array<{
            iteration: number;
            tool: {
                name: string;
                parameters: Record<string, any>;
            };
            results: any;
        }>;
    };
}

// Main state interface
export interface FractalBotState {
    messages: Message[];
    assets: Record<string, Asset>;
    agents: Record<string, Agent>;
    metadata: {
        isProcessing: boolean;
        lastUpdated: Date;
    };
}

// Initial state factory
export const createInitialState = (): FractalBotState => ({
    messages: [],
    assets: {},
    agents: {},
    metadata: {
        isProcessing: false,
        lastUpdated: new Date()
    }
});

export type StateUpdateAction =
    | { type: 'ADD_MESSAGE'; payload: { message: Message } }
    | { type: 'CLEAR_MESSAGES' }
    | { type: 'ADD_ASSET'; payload: { asset: Asset } }
    | { type: 'UPDATE_ASSET'; payload: { assetId: string; updates: Partial<Asset> } }
    | { type: 'REMOVE_ASSET'; payload: { assetId: string } }
    | { type: 'ADD_AGENT'; payload: { agent: Agent } }
    | { type: 'UPDATE_AGENT'; payload: { agentId: string; updates: Partial<Agent> } }
    | { type: 'REMOVE_AGENT'; payload: { agentId: string } }
    | { type: 'UPDATE_METADATA'; payload: { updates: Partial<FractalBotState['metadata']> } }
    | { type: 'RESET_STATE' }; 