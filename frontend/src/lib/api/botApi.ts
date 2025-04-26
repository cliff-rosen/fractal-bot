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

        const token = localStorage.getItem('authToken');
        const response = await fetch(`${settings.apiUrl}/api/bot/stream2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No reader available');
        }

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        yield { data: line };
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
}; 