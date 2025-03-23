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
    listEmailLabels: (assetId?: string) => Promise<void>;
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
            // Format assets for the backend
            const formattedAssets = Object.values(state.assets).map(asset => ({
                asset_id: asset.asset_id,
                name: asset.name,
                description: asset.description,
                type: asset.type,
                content: asset.content,
                status: asset.status,
                metadata: asset.metadata
            }));

            // Send message to backend with history and assets
            const response = await botApi.sendMessage(message, state.messages, formattedAssets);

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
    }, [state.messages, state.assets, addMessage, addAsset, addAgent, updateMetadata, toast]);

    const searchEmails = useCallback(async (assetId: string, params: {
        folders?: string[];
        query_terms?: string[];
        max_results?: number;
        include_attachments?: boolean;
        include_metadata?: boolean;
    }) => {

        // create a new asset with pending status if needed
        // if no assetId is provided, create a new one
        if (!assetId) {
            assetId = `email_messages_${Date.now()}`;
        }
        if (!state.assets[assetId]) {
            addAsset({
                asset_id: assetId,
                name: 'Email Messages',
                description: 'Collection of email messages from search results',
                type: AssetType.TEXT,
                content: 'Fetching email messages...',
                status: AssetStatus.PENDING,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                }
            });
        }

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

            const messages = response.data.data?.messages || [];
            const assetContent = messages.length > 0
                ? `Email Messages:\n${messages.map((msg: any) => {
                    const subject = msg.headers?.subject || 'No Subject';
                    const from = msg.headers?.from || 'Unknown Sender';
                    const date = msg.headers?.date || 'No Date';
                    const snippet = msg.snippet || '';
                    return `- Subject: ${subject}\n  From: ${from}\n  Date: ${date}\n  ${snippet ? `Preview: ${snippet}\n` : ''}`;
                }).join('\n')}`
                : "Email Messages Overview\nNo messages found.";

            // Update the existing asset
            updateAsset(assetId, {
                content: assetContent,
                status: messages.length > 0 ? AssetStatus.READY : AssetStatus.PENDING,
                metadata: {
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[assetId]?.metadata?.version || 0) + 1
                }
            });

            addMessage({
                message_id: Date.now().toString(),
                role: MessageRole.ASSISTANT,
                content: `I've retrieved ${messages.length} email messages. You can find them in the assets panel.`,
                timestamp: new Date(),
                metadata: {}
            });

            toast({
                title: 'Messages Retrieved',
                description: `Successfully retrieved ${messages.length} email messages.`,
                variant: 'default'
            });

        } catch (error: any) {
            console.error('Error fetching email messages:', error);
            // Update asset to show error state
            updateAsset(assetId, {
                content: `Error fetching email messages: ${error.message || 'Unknown error'}`,
                status: AssetStatus.ERROR,
                metadata: {
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[assetId]?.metadata?.version || 0) + 1
                }
            });
            toast({
                title: 'Error',
                description: error.message || 'Failed to retrieve email messages. Please try again.',
                variant: 'destructive'
            });
        }
    }, [state.assets, updateAsset, addMessage, toast]);

    const listEmailLabels = useCallback(async (assetId?: string) => {
        try {
            const response = await api.get('/api/email/labels');

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch email labels');
            }

            const assetContent = response.data.data?.labels
                ? `Email Labels:\n${response.data.data.labels.map((label: any) => `- ${label.name} (${label.type}) [ID: ${label.id}]`).join('\n')}`
                : "Email Labels Overview\nNo labels found.";

            // If no assetId provided, create a new one
            const targetAssetId = assetId || `email_labels_${Date.now()}`;

            // Create or update the asset with all required fields
            if (!state.assets[targetAssetId]) {
                addAsset({
                    asset_id: targetAssetId,
                    name: 'Email Labels List',
                    description: 'Complete list of email labels and folders',
                    type: AssetType.TEXT,
                    content: 'Fetching email labels...',
                    status: AssetStatus.PENDING,
                    metadata: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        creator: 'email_access_agent',
                        tags: ['email', 'labels', 'folders'],
                        version: 1
                    }
                });
            }

            // Update the existing asset
            updateAsset(targetAssetId, {
                content: assetContent,
                status: response.data.data?.labels ? AssetStatus.READY : AssetStatus.PENDING,
                metadata: {
                    updatedAt: new Date().toISOString(),
                    version: (state.assets[targetAssetId]?.metadata?.version || 0) + 1
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