export enum AssetType {
    FILE = 'FILE',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    AUDIO = 'AUDIO',
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    OTHER = 'OTHER',
    EMAIL_LIST = 'EMAIL_LIST',
    EMAIL_RESULT = 'EMAIL_RESULT'
}

export enum AssetStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    ERROR = 'ERROR'
}

export interface AssetMetadata {
    status?: AssetStatus;
    createdAt?: string;
    updatedAt?: string;
    creator?: string | null;
    tags?: string[];
    agent_associations?: string[];
    version?: number;
    subtype?: string;
    is_in_db?: boolean;
    name?: string;
    type?: string;
    size?: number;
    lastModified?: number;
    lastUpdated?: string;
    operation?: string;
    searchParams?: {
        folders?: string[];
        query_terms?: string[];
        max_results?: number;
        include_attachments?: boolean;
        include_metadata?: boolean;
    };
    error?: string;
    agentId?: string;
}

export interface Asset {
    asset_id: string;
    name: string;
    description?: string;
    type: AssetType;
    content: any;
    status: AssetStatus;
    metadata?: AssetMetadata;
    is_in_db: boolean;
} 