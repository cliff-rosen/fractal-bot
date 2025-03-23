import { AgentType, AssetType, AssetStatus } from '@/components/fractal-bot/types/state';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailMessagesAgentExecutor implements AgentExecutor {
    type = AgentType.EMAIL_ACCESS;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        console.log('Executing Email Messages Agent', context);
        try {
            const { agent, state } = context;
            const targetAssetId = agent.output_asset_ids?.[0] || `email_messages_${Date.now()}`;

            // Create initial asset with pending status
            const initialAsset = {
                asset_id: targetAssetId,
                name: 'Email Messages',
                type: AssetType.TEXT,
                content: 'Fetching email messages...',
                status: AssetStatus.PENDING,
                metadata: {
                    createdAt: state.assets[targetAssetId]?.metadata?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[targetAssetId]?.metadata?.version || 0) + 1
                }
            };

            // Get the search parameters from agent input
            const params = agent.input_parameters || {};

            // Call the email API
            const response = await api.post('/api/email/messages', {
                folders: params.folders,
                query_terms: params.query_terms,
                max_results: params.max_results || 100,
                include_attachments: params.include_attachments,
                include_metadata: params.include_metadata
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch email messages');
            }

            const messages = response.data.data?.messages || [];
            const assetContent = messages.length > 0
                ? `Email Messages:\n${messages.map((msg: any) => {
                    const subject = msg.subject || msg.headers?.subject || 'No Subject';
                    const from = msg.from || msg.headers?.from || 'Unknown Sender';
                    const date = msg.date || msg.headers?.date || 'No Date';
                    const snippet = msg.snippet || '';
                    return `- Subject: ${subject}\n  From: ${from}\n  Date: ${date}\n  ${snippet ? `Preview: ${snippet}\n` : ''}`;
                }).join('\n')}`
                : "Email Messages Overview\nNo messages found.";

            // Create output asset with results
            const outputAsset = {
                ...initialAsset,
                content: assetContent,
                status: messages.length > 0 ? AssetStatus.READY : AssetStatus.PENDING,
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
                    messageCount: messages.length,
                    assetId: targetAssetId
                }
            };

        } catch (error: any) {
            // Create error asset
            const errorAsset = {
                asset_id: `email_messages_${Date.now()}`,
                name: 'Email Messages Error',
                type: AssetType.TEXT,
                content: `Error fetching email messages: ${error.message || 'Unknown error'}`,
                status: AssetStatus.ERROR,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                }
            };

            return {
                success: false,
                error: error.message || 'Failed to execute email messages agent',
                outputAssets: [errorAsset]
            };
        }
    }

    validateInputs(context: AgentExecutionContext): boolean {
        const { agent } = context;
        return !!agent.input_parameters;
    }

    getRequiredInputTypes(): string[] {
        return ['text'];
    }
} 