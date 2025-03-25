import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { FractalBotState, createInitialState } from '../types/state';
import { Asset, FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent, AgentType, AgentStatus } from '@/types/agent';
import { Message, MessageRole } from '@/types/message';
import { fractalBotReducer } from '../state/reducer';
import { botApi } from '@/lib/api/botApi';
import { assetApi } from '@/lib/api/assetApi';
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
    saveAsset: (assetId: string) => Promise<void>;
    addAgent: (agent: Agent) => void;
    updateAgent: (agentId: string, updates: Partial<Agent>) => void;
    removeAgent: (agentId: string) => void;
    updateMetadata: (updates: Partial<FractalBotState['metadata']>) => void;
    resetState: () => void;
    processMessage: (message: string) => Promise<void>;
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
        // Ensure we have a valid asset_id and persistence info
        const assetWithDefaults = {
            ...asset,
            asset_id: asset.asset_id || `temp_${Date.now()}`,
            persistence: {
                ...asset.persistence,
                isInDb: asset.persistence?.isInDb ?? false
            }
        };
        dispatch({ type: 'ADD_ASSET', payload: { asset: assetWithDefaults } });
    }, []);

    const updateAsset = useCallback((assetId: string, updates: Partial<Asset>) => {
        dispatch({ type: 'UPDATE_ASSET', payload: { assetId, updates } });
    }, []);

    const removeAsset = useCallback((assetId: string) => {
        dispatch({ type: 'REMOVE_ASSET', payload: { assetId } });
    }, []);

    const saveAsset = useCallback(async (assetId: string) => {
        const asset = state.assets[assetId];
        if (!asset) {
            throw new Error(`Asset ${assetId} not found`);
        }

        // Ensure required fields are present
        if (!asset.name) {
            throw new Error('Asset name is required');
        }

        let savedAsset;
        if (asset.persistence.isInDb) {
            // Update existing asset
            savedAsset = await assetApi.updateAsset(assetId, {
                name: asset.name,
                fileType: asset.fileType,
                dataType: asset.dataType,
                description: asset.description,
                content: asset.content,
                metadata: asset.metadata
            });
        } else {
            // Create new asset
            savedAsset = await assetApi.createAsset({
                name: asset.name,
                fileType: asset.fileType,
                dataType: asset.dataType,
                description: asset.description,
                content: asset.content,
                metadata: asset.metadata,
                status: asset.status
            });
        }

        // Update with saved asset data
        updateAsset(assetId, {
            ...savedAsset,
            persistence: {
                ...savedAsset.persistence,
                isInDb: true
            }
        });
    }, [state.assets, updateAsset]);

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
            // Send message to backend with history and assets
            const response = await botApi.sendMessage(message, state.messages, Object.values(state.assets));

            // Add bot's response to messages
            addMessage(response.message);

            // Handle side effects
            const sideEffects = response.sideEffects || {};
            const newAssets = sideEffects.assets || [];
            const newAgents = sideEffects.agents || [];

            // Add new assets with default persistence
            newAssets.forEach(asset => addAsset({
                ...asset,
                persistence: {
                    isInDb: false
                }
            }));

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

        // Get the executor for this agent ID
        const executor = agentRegistry.getExecutor(agentId);
        if (!executor) {
            throw new Error(`No executor found for agent ${agentId}`);
        }

        // Determine asset types based on agent type
        const fileType = FileType.JSON;
        const dataType = agent.type === AgentType.EMAIL_LABELS ? DataType.EMAIL_LIST : DataType.UNSTRUCTURED;

        // Ensure all output assets exist and are in PENDING state
        if (agent.output_asset_ids) {
            for (const assetId of agent.output_asset_ids) {
                console.log('Checking asset:', assetId);
                const existingAsset = state.assets[assetId];
                if (existingAsset) {
                    // Update existing asset to PENDING
                    console.log('Updating existing asset:', assetId);
                    updateAsset(assetId, {
                        status: AssetStatus.PENDING,
                        metadata: {
                            ...existingAsset.metadata,
                            updatedAt: new Date().toISOString()
                        }
                    });
                } else {
                    console.log('Creating new asset:', assetId);
                    const now = new Date().toISOString();
                    // Create new asset with the exact ID
                    addAsset({
                        asset_id: assetId,
                        name: `Output from ${agent.name}`,
                        description: `Output asset from agent ${agent.name}`,
                        fileType,
                        dataType,
                        content: null,
                        status: AssetStatus.PENDING,
                        metadata: {
                            createdAt: now,
                            updatedAt: now,
                            agentId
                        },
                        persistence: {
                            isInDb: false
                        }
                    });
                }
            }
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
            console.log('Executing agent with context:', context);
            const result: AgentExecutionResult = await executor.execute(context);
            console.log('Agent execution result:', result);

            if (!result.success) {
                throw new Error(result.error || 'Agent execution failed');
            }

            // Update output assets with content and ready status
            if (result.outputAssets) {
                for (const outputAsset of result.outputAssets) {
                    const existingAsset = state.assets[outputAsset.asset_id];
                    console.log('Existing asset:', outputAsset.asset_id, existingAsset);
                    if (existingAsset) {
                        console.log('Updating output asset:', outputAsset);
                        updateAsset(outputAsset.asset_id, {
                            ...outputAsset,
                            status: AssetStatus.READY,
                            metadata: {
                                ...existingAsset.metadata,
                                ...outputAsset.metadata,
                                updatedAt: new Date().toISOString()
                            }
                        });
                    } else {
                        console.log('Adding new output asset:', outputAsset);
                        addAsset({
                            ...outputAsset,
                            status: AssetStatus.READY,
                            metadata: {
                                ...outputAsset.metadata,
                                updatedAt: new Date().toISOString()
                            }
                        });
                    }
                }
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
            // Update output assets to error status
            if (agent.output_asset_ids) {
                for (const assetId of agent.output_asset_ids) {
                    const existingAsset = state.assets[assetId];
                    if (existingAsset) {
                        updateAsset(assetId, {
                            status: AssetStatus.ERROR,
                            metadata: {
                                ...existingAsset.metadata,
                                updatedAt: new Date().toISOString(),
                                error: error.message
                            }
                        });
                    }
                }
            }

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
    }, [state.agents, state.assets, addAsset, updateAsset, updateAgent]);


    const value = {
        state,
        addMessage,
        clearMessages,
        addAsset,
        updateAsset,
        removeAsset,
        saveAsset,
        addAgent,
        updateAgent,
        removeAgent,
        updateMetadata,
        resetState,
        processMessage,
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