import { AgentType, AssetType, AssetStatus } from '@/components/fractal-bot/types/state';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailAccessAgentExecutor implements AgentExecutor {
    type = AgentType.EMAIL_ACCESS;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        console.log('EmailAccessAgentExecutor execute');
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

            // Debug logging
            console.log('API Response:', response.data);

            // Get messages from the correct location in the response
            const rawMessages = response.data.data.messages?.content
            if (!Array.isArray(rawMessages)) {
                console.log('Raw messages are not an array:', rawMessages);
            }
            console.log('Raw messages:', rawMessages);

            if (rawMessages.length === 0) {
                console.log('No messages found in response');
            }

            // Transform messages into the format expected by EmailListView
            const transformedMessages = rawMessages.map((msg: any) => {
                if (!msg || typeof msg !== 'object') {
                    console.warn('Invalid message object:', msg);
                    return null;
                }

                // The backend already formats these fields correctly
                const transformed = {
                    id: msg.id,
                    date: msg.date || msg.internalDate,
                    from: msg.from,
                    to: msg.to,
                    subject: msg.subject,
                    body: msg.body,
                    snippet: msg.snippet || ''
                };

                console.log('Transformed email:', transformed);
                return transformed;
            }).filter(Boolean); // Remove any null entries

            console.log('Transformed messages:', transformedMessages);

            // Create output asset
            const outputAsset = {
                asset_id: `email_messages_${Date.now()}`,
                name: `Email Messages (${transformedMessages.length})`,
                description: 'Collection of email messages from search results',
                type: AssetType.EMAIL_LIST,
                content: transformedMessages,
                status: AssetStatus.READY,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    creator: "email_service",
                    tags: ["email", "gmail"]
                }
            };

            return {
                success: true,
                outputAssets: [outputAsset],
                metadata: {
                    messageCount: transformedMessages.length
                }
            };

        } catch (error: any) {
            console.error('EmailAccessAgent error:', error);
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