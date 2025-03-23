import { Message, ChatResponse, Asset } from '../../components/fractal-bot/types/state';
import { api, handleApiError } from './index';

export interface MessageHistory {
    role: string;
    content: string;
    timestamp: Date;
}

export interface SendMessageRequest {
    message: string;
    history: MessageHistory[];
    assets: Asset[];
}

export interface SendMessageResponse extends ChatResponse { }

export const botApi = {
    sendMessage: async (message: string, history: Message[], assets: Asset[]): Promise<SendMessageResponse> => {
        try {
            // Convert Message[] to MessageHistory[]
            const messageHistory: MessageHistory[] = history.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
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
    }
}; 