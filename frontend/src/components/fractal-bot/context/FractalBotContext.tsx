import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { FractalBotState, createInitialState, Asset, MessageRole, Message, Agent, AgentType, AgentStatus, AssetStatus, AssetType } from '../types/state';
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
        // Set is_in_db to false for new assets unless it's explicitly set
        const assetWithDbFlag = {
            ...asset,
            is_in_db: asset.is_in_db ?? false
        };
        dispatch({ type: 'ADD_ASSET', payload: { asset: assetWithDbFlag } });
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

        try {
            // Convert the state Asset type to the API Asset type
            const apiAsset = {
                asset_id: asset.asset_id,
                name: asset.name,
                description: asset.description,
                type: asset.type,
                content: asset.content,
                status: asset.status,
                metadata: {
                    ...asset.metadata,
                    status: asset.status,
                    is_in_db: asset.is_in_db
                },
                is_in_db: asset.is_in_db
            };

            const savedAsset = await assetApi.saveAsset(apiAsset);

            // Convert back to state Asset type
            const stateAsset = {
                asset_id: savedAsset.asset_id,
                name: savedAsset.name,
                description: savedAsset.description,
                type: savedAsset.type,
                content: savedAsset.content,
                status: savedAsset.metadata?.status || AssetStatus.PENDING,
                metadata: {
                    ...savedAsset.metadata,
                    status: undefined, // Remove status from metadata since it's a top-level field
                    creator: savedAsset.metadata?.creator || undefined // Convert null to undefined
                },
                is_in_db: true
            };

            updateAsset(assetId, stateAsset);
        } catch (error) {
            console.error('Error saving asset:', error);
            toast({
                title: 'Error',
                description: 'Failed to save asset. Please try again.',
                variant: 'destructive',
                className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
            });
            throw error;
        }
    }, [state.assets, updateAsset, toast]);

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
                metadata: asset.metadata,
                is_in_db: asset.is_in_db
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
            newAssets.forEach(asset => addAsset({ ...asset, is_in_db: false }));

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

        // Determine asset type based on agent type
        const assetType = agent.type === AgentType.EMAIL_LABELS ? AssetType.EMAIL_LIST : AssetType.EMAIL_RESULT;

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
                            lastUpdated: new Date().toISOString()
                        }
                    });
                } else {
                    console.log('Creating new asset:', assetId);
                    // Create new asset with the exact ID
                    addAsset({
                        asset_id: assetId,
                        name: `Output from ${agent.name}`,
                        description: `Output asset from agent ${agent.name}`,
                        type: assetType,
                        content: null,
                        status: AssetStatus.PENDING,
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastUpdated: new Date().toISOString(),
                            agentId
                        },
                        is_in_db: false
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
                                lastUpdated: new Date().toISOString()
                            }
                        });
                    } else {
                        console.log('Adding new output asset:', outputAsset);
                        addAsset({
                            ...outputAsset,
                            status: AssetStatus.READY,
                            metadata: {
                                ...outputAsset.metadata,
                                lastUpdated: new Date().toISOString()
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
                                lastUpdated: new Date().toISOString(),
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