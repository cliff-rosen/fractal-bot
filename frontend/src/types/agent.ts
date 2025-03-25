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
    input_parameters: Record<string, any>;
    input_asset_ids?: string[];
    output_asset_ids?: string[];
    metadata: {
        lastRunAt?: string;
        completionTime?: string;
        lastError?: string;
        [key: string]: any;
    };
    name: string;
} 