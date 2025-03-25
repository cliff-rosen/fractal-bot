import { FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent, AgentType } from '@/types/agent';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailLabelsAgentExecutor implements AgentExecutor {
    type = AgentType.EMAIL_LABELS;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        try {
            const response = await api.get('/api/email/labels');
            const labels = response.data.labels;

            const asset = {
                asset_id: `email_labels_${Date.now()}`,
                name: 'Email Labels',
                description: 'List of available email labels',
                fileType: FileType.JSON,
                dataType: DataType.GENERIC_LIST,
                content: labels,
                status: AssetStatus.READY,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    creator: 'email_labels_agent',
                    tags: ['email', 'labels']
                },
                persistence: {
                    isInDb: false
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
        return true; // No inputs required for this agent
    }

    getRequiredInputTypes(): string[] {
        return []; // No required input types
    }
} 