import { FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent, AgentType } from '@/types/agent';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailAccessAgentExecutor implements AgentExecutor {
    type = AgentType.GET_MESSAGES;
    dataType = DataType.EMAIL_LIST;
    fileType = FileType.JSON;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        try {
            const { agent } = context;
            const { input_parameters } = agent;
            const {
                operation = 'get_messages',
                folders,
                query_terms,
                max_results = 100,
                include_attachments = false,
                include_metadata = true
            } = input_parameters;

            const response = await api.post('/api/email/messages', {
                folders,
                query_terms,
                max_results,
                include_attachments,
                include_metadata
            });

            const messages = response.data;
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
                fileType: this.fileType,
                dataType: this.dataType,
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