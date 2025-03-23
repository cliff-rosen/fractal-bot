import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FractalBotState, StateUpdateAction, createInitialState, Asset, AssetType, AssetStatus, MessageRole, Message, Agent } from '../types/state';
import { fractalBotReducer } from '../state/reducer';
import { botApi } from '@/lib/api/botApi';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface FractalBotContextType {
    state: FractalBotState;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
    addAsset: (asset: Asset) => void;
    updateAsset: (assetId: string, updates: Partial<Asset>) => void;
    removeAsset: (assetId: string) => void;
    addAgent: (agent: Agent) => void;
    updateAgent: (agentId: string, updates: Partial<Agent>) => void;
    removeAgent: (agentId: string) => void;
    updateMetadata: (updates: Partial<FractalBotState['metadata']>) => void;
    resetState: () => void;
    processMessage: (message: string) => Promise<void>;
    searchEmails: (assetId: string, params: {
        folders?: string[];
        query_terms?: string[];
        max_results?: number;
        include_attachments?: boolean;
        include_metadata?: boolean;
    }) => Promise<void>;
    listEmailLabels: (assetId: string) => Promise<void>;
}

const FractalBotContext = createContext<FractalBotContextType | undefined>(undefined);

export function FractalBotProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(fractalBotReducer, createInitialState());
    const { toast } = useToast();

    const addMessage = useCallback((message: Message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: { message } });
    }, []);

    const clearMessages = useCallback(() => {
        dispatch({ type: 'CLEAR_MESSAGES' });
    }, []);

    const addAsset = useCallback((asset: Asset) => {
        dispatch({ type: 'ADD_ASSET', payload: { asset } });
    }, []);

    const updateAsset = useCallback((assetId: string, updates: Partial<Asset>) => {
        dispatch({ type: 'UPDATE_ASSET', payload: { assetId, updates } });
    }, []);

    const removeAsset = useCallback((assetId: string) => {
        dispatch({ type: 'REMOVE_ASSET', payload: { assetId } });
    }, []);

    const addAgent = useCallback((agent: Agent) => {
        dispatch({ type: 'ADD_AGENT', payload: { agent } });
    }, []);

    const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { agentId, updates } });
    }, []);

    const removeAgent = useCallback((agentId: string) => {
        dispatch({ type: 'REMOVE_AGENT', payload: { agentId } });
    }, []);

    const updateMetadata = useCallback((updates: Partial<FractalBotState['metadata']>) => {
        dispatch({ type: 'UPDATE_METADATA', payload: { updates } });
    }, []);

    const resetState = useCallback(() => {
        dispatch({ type: 'RESET_STATE' });
    }, []);

    const processMessage = useCallback(async (message: string) => {
        if (!message.trim()) return;

        // Add user message first
        const userMessage: Message = {
            message_id: Date.now().toString(),
            role: MessageRole.USER,
            content: message,
            timestamp: new Date(),
            metadata: {}
        };
        addMessage(userMessage);

        // Update metadata to show processing state
        updateMetadata({ isProcessing: true });

        try {
            // Send message to backend with history
            const response = await botApi.sendMessage(message, state.messages);

            // Add bot's response to messages
            addMessage(response.message);

            // Handle side effects
            const sideEffects = response.sideEffects || {};
            const newAssets = sideEffects.assets || [];
            const newAgents = sideEffects.agents || [];

            // Add new assets
            newAssets.forEach(asset => addAsset(asset));

            // Add new agents
            newAgents.forEach(agent => addAgent(agent));

        } catch (error) {
            console.error('Error processing message:', error);
            toast({
                title: 'Error',
                description: 'Failed to process message. Please try again.',
                variant: 'destructive'
            });
        } finally {
            updateMetadata({ isProcessing: false });
        }
    }, [state.messages, addMessage, addAsset, addAgent, updateMetadata, toast]);

    const searchEmails = useCallback(async (assetId: string, params: {
        folders?: string[];
        query_terms?: string[];
        max_results?: number;
        include_attachments?: boolean;
        include_metadata?: boolean;
    }) => {
        try {
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

            const assetContent = response.data.data?.messages
                ? `Email Messages:\n${response.data.data.messages.map((msg: any) => `- ${msg.subject}`).join('\n')}`
                : "Email Messages Overview\nNo messages found.";

            // Update the existing asset
            updateAsset(assetId, {
                content: assetContent,
                status: response.data.data?.messages ? AssetStatus.READY : AssetStatus.PENDING,
                metadata: {
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[assetId]?.metadata?.version || 0) + 1
                }
            });

            addMessage({
                message_id: Date.now().toString(),
                role: MessageRole.ASSISTANT,
                content: 'I\'ve retrieved your email messages. You can find them in the assets panel.',
                timestamp: new Date(),
                metadata: {}
            });

            toast({
                title: 'Messages Retrieved',
                description: 'Email messages have been successfully retrieved.',
                variant: 'default'
            });

        } catch (error: any) {
            console.error('Error fetching email messages:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to retrieve email messages. Please try again.',
                variant: 'destructive'
            });
        }
    }, [state.assets, updateAsset, addMessage, toast]);

    const listEmailLabels = useCallback(async (assetId: string) => {
        try {
            const response = await api.get('/api/email/labels');

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch email labels');
            }

            const assetContent = response.data.data?.labels
                ? `Email Labels:\n${response.data.data.labels.map((label: any) => `- ${label.name} (${label.type})`).join('\n')}`
                : "Email Labels Overview\nNo labels found.";

            // Update the existing asset
            updateAsset(assetId, {
                content: assetContent,
                status: response.data.data?.labels ? AssetStatus.READY : AssetStatus.PENDING,
                metadata: {
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[assetId]?.metadata?.version || 0) + 1
                }
            });

            addMessage({
                message_id: Date.now().toString(),
                role: MessageRole.ASSISTANT,
                content: 'I\'ve retrieved your Gmail labels. You can find them in the assets panel.',
                timestamp: new Date(),
                metadata: {}
            });

            toast({
                title: 'Labels Retrieved',
                description: 'Email labels have been successfully retrieved.',
                variant: 'default'
            });

        } catch (error: any) {
            console.error('Error fetching email labels:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to retrieve email labels. Please try again.',
                variant: 'destructive'
            });
        }
    }, [state.assets, updateAsset, addMessage, toast]);

    const value = {
        state,
        addMessage,
        clearMessages,
        addAsset,
        updateAsset,
        removeAsset,
        addAgent,
        updateAgent,
        removeAgent,
        updateMetadata,
        resetState,
        processMessage,
        searchEmails,
        listEmailLabels
    };

    return (
        <FractalBotContext.Provider value={value}>
            {children}
        </FractalBotContext.Provider>
    );
}

export function useFractalBot() {
    const context = useContext(FractalBotContext);
    if (context === undefined) {
        throw new Error('useFractalBot must be used within a FractalBotProvider');
    }
    return context;
} 