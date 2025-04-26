import { Message, ChatResponse, Asset } from '../../components/fractal-bot/types/state';
import { api, handleApiError } from './index';
import { makeStreamRequest, StreamUpdate } from './streamUtils';
import settings from '../../config/settings';

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


    streamMessage: async function* (message: string, history: Message[]): AsyncGenerator<StreamUpdate> {
        // Convert Message[] to MessageHistory[]
        const messageHistory: MessageHistory[] = history.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
        }));

        const requestBody = {
            message,
            history: messageHistory,
            assets: [] // We can add assets support later if needed
        };

        yield* makeStreamRequest('/api/bot/stream', requestBody, 'POST');
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

}; 