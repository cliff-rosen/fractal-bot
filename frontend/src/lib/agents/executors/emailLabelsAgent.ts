import { AgentType, AssetType, AssetStatus } from '@/components/fractal-bot/types/state';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailLabelsAgentExecutor implements AgentExecutor {
    type = AgentType.EMAIL_ACCESS;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        try {
            const response = await api.get('/api/email/labels');

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch email labels');
            }

            const labels = response.data.data?.labels || [];

            // Create output asset
            const outputAsset = {
                asset_id: `email_labels_${Date.now()}`,
                name: 'Email Labels List',
                description: 'Complete list of email labels and folders',
                type: AssetType.TEXT,
                content: labels.length > 0
                    ? `Email Labels:\n${labels.map((label: any) => `- ${label.name} (${label.type}) [ID: ${label.id}]`).join('\n')}`
                    : "Email Labels Overview\nNo labels found.",
                status: labels.length > 0 ? AssetStatus.READY : AssetStatus.PENDING,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    creator: 'email_access_agent',
                    tags: ['email', 'labels', 'folders'],
                    version: 1
                }
            };

            return {
                success: true,
                outputAssets: [outputAsset],
                metadata: {
                    labelCount: labels.length
                }
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to execute email labels agent'
            };
        }
    }

    validateInputs(context: AgentExecutionContext): boolean {
        return true; // No input validation needed for labels
    }

    getRequiredInputTypes(): string[] {
        return [];
    }
} 