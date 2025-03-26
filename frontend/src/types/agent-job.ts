import { FileType, DataType } from './asset';

/**
 * Configuration for an output asset that will be created by an agent
 */
export interface AssetConfig {
    name: string;
    description: string;
    fileType: FileType;
    dataType: DataType;
}

export interface AgentJob {
    agentType: string;
    input_parameters: Record<string, any>;
    output_asset_configs: AssetConfig[];
} 