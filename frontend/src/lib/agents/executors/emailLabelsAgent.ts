import { AgentType, AssetType, AssetStatus } from '@/components/fractal-bot/types/state';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailLabelsAgentExecutor implements AgentExecutor {
    type = AgentType.EMAIL_LABELS;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        console.log('Executing Email Labels Agent', context);
        try {
            const { agent, state } = context;
            const targetAssetId = agent.output_asset_ids?.[0] || `email_labels_${Date.now()}`;

            // Create initial asset with pending status
            const initialAsset = {
                asset_id: targetAssetId,
                name: 'Email Labels',
                type: AssetType.TEXT,
                content: 'Fetching email labels...',
                status: AssetStatus.PENDING,
                metadata: {
                    createdAt: state.assets[targetAssetId]?.metadata?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[targetAssetId]?.metadata?.version || 0) + 1
                }
            };

            // Call the email API
            const response = await api.get('/api/email/labels');

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch email labels');
            }

            const labels = response.data.data?.labels || [];
            const assetContent = labels.length > 0
                ? `Email Labels:\n${labels.map((label: any) => `- ${label.name} (${label.type}) [ID: ${label.id}]`).join('\n')}`
                : "Email Labels Overview\nNo labels found.";

            // Create output asset with results
            const outputAsset = {
                ...initialAsset,
                content: assetContent,
                status: labels.length > 0 ? AssetStatus.READY : AssetStatus.PENDING,
                metadata: {
                    ...initialAsset.metadata,
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[targetAssetId]?.metadata?.version || 0) + 1
                }
            };

            return {
                success: true,
                outputAssets: [outputAsset],
                metadata: {
                    labelCount: labels.length,
                    assetId: targetAssetId
                }
            };

        } catch (error: any) {
            // Create error asset
            const errorAsset = {
                asset_id: `email_labels_${Date.now()}`,
                name: 'Email Labels Error',
                type: AssetType.TEXT,
                content: `Error fetching email labels: ${error.message || 'Unknown error'}`,
                status: AssetStatus.ERROR,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                }
            };

            return {
                success: false,
                error: error.message || 'Failed to execute email labels agent',
                outputAssets: [errorAsset]
            };
        }
    }

    validateInputs(context: AgentExecutionContext): boolean {
        return true; // No input parameters required for listing labels
    }

    getRequiredInputTypes(): string[] {
        return []; // No input types required
    }
} 