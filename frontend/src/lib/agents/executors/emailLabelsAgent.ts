import { FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent, AgentType } from '@/types/agent';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailLabelsAgentExecutor implements AgentExecutor {
    type = AgentType.LIST_LABELS;
    dataType = DataType.GENERIC_LIST;
    fileType = FileType.JSON;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        try {
            const { agent, outputAssets } = context;
            const { input_parameters } = agent;
            const { operation = 'list_labels', include_system_labels = true } = input_parameters || {};

            const response = await api.get('/api/email/labels', {
                params: {
                    include_system_labels
                }
            });
            const labels = response.data.data.labels;
            console.log('Email Labels Response:', response.data);
            console.log('Email Labels:', labels);

            // Use the existing asset ID from the first output asset
            const outputAsset = outputAssets[0];
            if (!outputAsset) {
                throw new Error('No output asset found in context');
            }

            const asset = {
                ...outputAsset,
                name: 'Email Labels',
                description: 'List of available email labels',
                fileType: this.fileType,
                dataType: this.dataType,
                content: labels,
                status: AssetStatus.READY,
                metadata: {
                    ...outputAsset.metadata,
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    creator: 'email_labels_agent',
                    tags: ['email', 'labels']
                }
            };

            return {
                success: true,
                outputAssets: [asset]
            };
        } catch (error) {
            console.error('Error in EmailLabelsAgentExecutor:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error in EmailLabelsAgentExecutor'
            };
        }
    }

    validateInputs(context: AgentExecutionContext): boolean {
        return true; // No required inputs for this agent
    }

    getRequiredInputTypes(): string[] {
        return []; // No required input types
    }
} 