import { FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent, AgentType } from '@/types/agent';
import { AgentExecutor, AgentExecutionContext, AgentExecutionResult } from '../types';
import { api } from '@/lib/api';

export class EmailMessageAgentExecutor implements AgentExecutor {
    type = AgentType.GET_MESSAGE;

    async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
        try {
            const { agent } = context;
            const { input_parameters } = agent;
            const {
                operation = 'get_message',
                message_id,
                include_attachments = false,
                include_metadata = true
            } = input_parameters;

            const response = await api.get(`/api/email/messages/${message_id}`, {
                params: {
                    include_attachments,
                    include_metadata
                }
            });

            const message = response.data;
            const transformedMessage = {
                id: message.id,
                subject: message.subject,
                from: message.from,
                to: message.to,
                date: message.date,
                body: message.body,
                attachments: message.attachments || []
            };

            const asset = {
                asset_id: `email_message_${Date.now()}`,
                name: `Email Message: ${transformedMessage.subject}`,
                description: 'Single email message',
                fileType: FileType.JSON,
                dataType: DataType.EMAIL_LIST,
                content: [transformedMessage], // Keep consistent with email list format
                status: AssetStatus.READY,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    creator: 'email_message_agent',
                    tags: ['email', 'single_message']
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
            console.error('Error in EmailMessageAgentExecutor:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error in EmailMessageAgentExecutor'
            };
        }
    }

    validateInputs(context: AgentExecutionContext): boolean {
        const { agent } = context;
        const { input_parameters } = agent;
        return !!input_parameters && !!input_parameters.message_id;
    }

    getRequiredInputTypes(): string[] {
        return ['text'];
    }
} 