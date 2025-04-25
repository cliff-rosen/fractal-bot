import { Message, ChatResponse, Asset } from '../../components/fractal-bot/types/state';
import { api, handleApiError } from './index';
import { makeStreamRequest, StreamUpdate } from './streamUtils';

export interface MessageHistory {
    role: string;
    content: string;
    timestamp: string;
}

export interface SendMessageRequest {
    message: string;
    history: MessageHistory[];
    assets: Asset[];
}

export interface SendMessageResponse extends ChatResponse { }

export const botApi = {

    runBot1: async (): Promise<SendMessageResponse> => {
        const response = await api.get<SendMessageResponse>('/api/bot/run_bot_1');
        return response.data;
    },

    sendMessage: async (message: string, history: Message[], assets: Asset[]): Promise<SendMessageResponse> => {
        try {
            // Convert Message[] to MessageHistory[]
            const messageHistory: MessageHistory[] = history.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp.toISOString()
            }));

            const response = await api.post<SendMessageResponse>('/api/bot/run', {
                message,
                history: messageHistory,
                assets
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error(handleApiError(error));
        }
    },

    stream: async function* (): AsyncGenerator<StreamUpdate> {
        yield* makeStreamRequest('/api/bot/stream', {});
    }
}; 