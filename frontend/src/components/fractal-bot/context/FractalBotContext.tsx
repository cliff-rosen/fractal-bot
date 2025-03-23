import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { FractalBotState, createInitialState, Asset, MessageRole, Message, Agent, AgentType, AgentStatus } from '../types/state';
import { fractalBotReducer } from '../state/reducer';
import { botApi } from '@/lib/api/botApi';
import { useToast } from '@/components/ui/use-toast';
import { agentRegistry, AgentExecutionContext, AgentExecutionResult } from '@/lib/agents';
import { registerAgentExecutors } from '@/lib/agents';

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
    executeAgent: (agentId: string) => Promise<AgentExecutionResult>;
}

const FractalBotContext = createContext<FractalBotContextType | undefined>(undefined);

export function FractalBotProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(fractalBotReducer, createInitialState());
    const { toast } = useToast();

    // Register agent executors on mount
    useEffect(() => {
        registerAgentExecutors();
    }, []);

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
                variant: 'destructive',
                className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
            });
        } finally {
            updateMetadata({ isProcessing: false });
        }
    }, [state.messages, state.assets, addMessage, addAsset, addAgent, updateMetadata, toast]);

    const executeAgent = useCallback(async (agentId: string) => {
        const agent = state.agents[agentId];
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        // Get the executor for this agent type
        const executor = agentRegistry.getExecutor(agent.type);
        if (!executor) {
            throw new Error(`No executor found for agent type ${agent.type}`);
        }

        // Prepare execution context
        const context: AgentExecutionContext = {
            agent,
            inputAssets: agent.input_asset_ids?.map(id => state.assets[id]).filter(Boolean) || [],
            outputAssets: agent.output_asset_ids?.map(id => state.assets[id]).filter(Boolean) || [],
            state
        };

        // Validate inputs if the executor provides validation
        if (executor.validateInputs && !executor.validateInputs(context)) {
            throw new Error(`Invalid inputs for agent ${agentId}`);
        }

        // Update agent status to running
        updateAgent(agentId, { status: AgentStatus.RUNNING });

        try {
            // Execute the agent
            const result: AgentExecutionResult = await executor.execute(context);

            if (!result.success) {
                throw new Error(result.error || 'Agent execution failed');
            }

            // Add output assets if any
            if (result.outputAssets) {
                result.outputAssets.forEach(asset => addAsset(asset));
            }

            // Update agent status and metadata
            updateAgent(agentId, {
                status: AgentStatus.COMPLETED,
                metadata: {
                    ...agent.metadata,
                    lastRunAt: new Date().toISOString(),
                    completionTime: new Date().toISOString(),
                    ...result.metadata
                }
            });

            return result;

        } catch (error: any) {
            // Update agent status to error
            updateAgent(agentId, {
                status: AgentStatus.ERROR,
                metadata: {
                    ...agent.metadata,
                    lastError: error.message,
                    lastRunAt: new Date().toISOString()
                }
            });

            throw error;
        }
    }, [state.agents, state.assets, addAsset, updateAgent]);

    const searchEmails = useCallback(async (assetId: string, params: {
        folders?: string[];
        query_terms?: string[];
        max_results?: number;
        include_attachments?: boolean;
        include_metadata?: boolean;
    }) => {
        // Create a new agent for email search
        const agentId = `email_search_${Date.now()}`;
        const agent: Agent = {
            agent_id: agentId,
            type: AgentType.EMAIL_ACCESS,
            description: 'Search for email messages',
            status: AgentStatus.IDLE,
            input_parameters: params,
            metadata: {
                createdAt: new Date().toISOString()
            }
        };

        // Add the agent to state
        addAgent(agent);

        try {
            // Execute the agent
            const result = await executeAgent(agentId);

            if (!result.success) {
                throw new Error(result.error || 'Failed to search emails');
            }

            // Add a success message
            addMessage({
                message_id: Date.now().toString(),
                role: MessageRole.ASSISTANT,
                content: `I've retrieved ${result.metadata?.messageCount || 0} email messages. You can find them in the assets panel.`,
                timestamp: new Date(),
                metadata: {}
            });

            toast({
                title: 'Success',
                description: `Retrieved ${result.metadata?.messageCount || 0} messages`,
                variant: 'default',
                className: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg'
            });

        } catch (error: any) {
            console.error('Error searching emails:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to retrieve messages',
                variant: 'destructive',
                className: 'bg-white dark:bg-gray-900 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800 shadow-lg'
            });
        }
    }, [addAgent, executeAgent, addMessage, toast]);

    const listEmailLabels = useCallback(async (assetId?: string) => {
        // Create a new agent for listing labels
        const agentId = `email_labels_${Date.now()}`;
        const agent: Agent = {
            agent_id: agentId,
            type: AgentType.EMAIL_ACCESS,
            description: 'List email labels and folders',
            status: AgentStatus.IDLE,
            metadata: {
                createdAt: new Date().toISOString()
            }
        };

        // Add the agent to state
        addAgent(agent);

        try {
            // Execute the agent
            const result = await executeAgent(agentId);

            if (!result.success) {
                throw new Error(result.error || 'Failed to list email labels');
            }

            // Add a success message
            addMessage({
                message_id: Date.now().toString(),
                role: MessageRole.ASSISTANT,
                content: 'I\'ve retrieved your Gmail labels. You can find them in the assets panel.',
                timestamp: new Date(),
                metadata: {}
            });

            toast({
                title: 'Success',
                description: 'Email labels have been successfully retrieved.',
                variant: 'default',
                className: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg'
            });

        } catch (error: any) {
            console.error('Error listing email labels:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to retrieve email labels. Please try again.',
                variant: 'destructive',
                className: 'bg-white dark:bg-gray-900 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800 shadow-lg'
            });
        }
    }, [addAgent, executeAgent, addMessage, toast]);

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
        listEmailLabels,
        executeAgent
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