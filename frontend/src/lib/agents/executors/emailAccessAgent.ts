import { AgentType } from '@/components/fractal-bot/types/state';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailAccessAgentExecutor implements AgentExecutor {
    type = AgentType.EMAIL_ACCESS;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        try {
            const { agent, state } = context;

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

            // Create output asset
            const outputAsset = {
                asset_id: `email_messages_${Date.now()}`,
                name: 'Email Messages',
                description: 'Collection of email messages from search results',
                type: 'text',
                content: messages.length > 0
                    ? `Email Messages:\n${messages.map((msg: any) => {
                        const subject = msg.headers?.subject || 'No Subject';
                        const from = msg.headers?.from || 'Unknown Sender';
                        const date = msg.headers?.date || 'No Date';
                        const snippet = msg.snippet || '';
                        return `- Subject: ${subject}\n  From: ${from}\n  Date: ${date}\n  ${snippet ? `Preview: ${snippet}\n` : ''}`;
                    }).join('\n')}`
                    : "Email Messages Overview\nNo messages found.",
                status: messages.length > 0 ? 'ready' : 'pending',
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                }
            };

            return {
                success: true,
                outputAssets: [outputAsset],
                metadata: {
                    messageCount: messages.length
                }
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to execute email access agent'
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