import { FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent, AgentType } from '@/types/agent';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailAccessAgentExecutor implements AgentExecutor {
    type = AgentType.EMAIL_ACCESS;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        try {
            const { agent } = context;
            const { input_parameters } = agent;
            const { query, max_results = 10, include_attachments = false } = input_parameters;

            const response = await api.post('/api/email/search', {
                query,
                max_results,
                include_attachments
            });

            const messages = response.data.messages;
            const transformedMessages = messages.map((msg: any) => ({
                id: msg.id,
                subject: msg.subject,
                from: msg.from,
                to: msg.to,
                date: msg.date,
                body: msg.body,
                attachments: msg.attachments || []
            }));

            const asset = {
                asset_id: `email_list_${Date.now()}`,
                name: `Email Messages (${transformedMessages.length})`,
                description: 'Collection of email messages from search results',
                fileType: FileType.JSON,
                dataType: DataType.EMAIL_LIST,
                content: transformedMessages,
                status: AssetStatus.READY,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    creator: 'email_access_agent',
                    tags: ['email', 'search_results']
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
            console.error('Error in EmailAccessAgentExecutor:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error in EmailAccessAgentExecutor'
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