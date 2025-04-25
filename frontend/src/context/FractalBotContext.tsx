import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Asset, FileType, DataType, AssetStatus } from '@/types/asset';
import { Agent, AgentType, AgentStatus } from '@/types/agent';
import { Message, MessageRole } from '@/types/message';
import { AgentJob, AssetConfig } from '@/types/agent-job';
import { botApi } from '@/lib/api/botApi';
import { assetApi } from '@/lib/api/assetApi';
import { useToast } from '@/components/ui/use-toast';
import { agentRegistry, AgentExecutionContext, AgentExecutionResult } from '@/lib/agents';
import { registerAgentExecutors } from '@/lib/agents';
import { createAgent } from '@/lib/agents/factory';

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

interface ChatResponseSideEffects {
    final_response?: string;
    assets?: Asset[];
    agent_jobs?: AgentJob[];
    tool_use_history?: Array<{
        iteration: number;
        tool: { name: string; parameters: Record<string, any> };
        results: any;
    }>;
}

interface ChatResponse {
    message: Message;
    sideEffects: ChatResponseSideEffects;
}

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
            });
        } else {
            // Create new asset
            savedAsset = await assetApi.createAsset({
                name: asset.name,
                fileType: asset.fileType,
                dataType: asset.dataType,
                description: asset.description,
                content: asset.content,
            });
        }

        const updatedAsset = {
            ...savedAsset,
            persistence: {
                ...savedAsset.persistence,
                isInDb: true,
                isDirty: false,
                lastSyncedAt: new Date().toISOString()
            },
            metadata: {
                ...savedAsset.metadata,
                updatedAt: new Date().toISOString()
            }
        };
        console.log('updatedAsset', updatedAsset);

        // Update with saved asset data
        updateAsset(assetId, updatedAsset);
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
            const response = await botApi.sendMessage(message, state.messages, Object.values(state.assets)) as ChatResponse;

            // Add bot's response to messages
            addMessage(response.message);

            // Handle side effects
            const sideEffects = response.sideEffects || {};
            const newAssets = sideEffects.assets || [];
            const agentJobs = sideEffects.agent_jobs || [];

            // Add new assets with default persistence
            newAssets.forEach(asset => addAsset({
                ...asset,
                persistence: {
                    isInDb: false
                }
            }));

            // Process agent jobs and create agents
            agentJobs.forEach((job: AgentJob) => {
                // Create the agent using the factory
                const agent = createAgent({
                    agentType: job.agentType as AgentType,
                    name: `${job.agentType} Agent`,
                    description: `Agent to execute ${job.agentType} operation`,
                    inputParameters: job.input_parameters,
                    inputAssetIds: job.input_asset_ids || [],
                    outputAssetConfigs: job.output_asset_configs,
                    metadata: {
                        createdAt: new Date().toISOString()
                    }
                });
                addAgent(agent);

                // Create placeholder output assets
                job.output_asset_configs.forEach((config: AssetConfig, index: number) => {
                    const assetId = agent.output_asset_ids![index];
                    addAsset({
                        asset_id: assetId,
                        name: config.name,
                        description: config.description,
                        fileType: config.fileType,
                        dataType: config.dataType,
                        content: null,
                        status: AssetStatus.PENDING,
                        metadata: {
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            creator: 'bot',
                            agentId: agent.agent_id
                        },
                        persistence: {
                            isInDb: false
                        }
                    });
                });
            });

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

    const executeAgent = useCallback(async (agentId: string): Promise<AgentExecutionResult> => {
        const agent = state.agents[agentId];
        console.log('executeAgent', agent)
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        // Update agent status to running
        updateAgent(agentId, { status: AgentStatus.RUNNING });

        try {
            // Get the agent executor
            const executor = agentRegistry.getExecutor(agent.type);
            if (!executor) {
                throw new Error(`No executor found for agent type: ${agent.type}`);
            }

            // Create execution context
            const context: AgentExecutionContext = {
                agent,
                inputAssets: agent.input_asset_ids?.map(id => state.assets[id]).filter(Boolean) as Asset[],
                outputAssets: agent.output_asset_ids?.map(id => state.assets[id]).filter(Boolean) as Asset[],
                state: state
            };

            // Execute the agent
            const result = await executor.execute(context);

            // Update output assets with the results
            if (result.success && result.outputAssets) {
                result.outputAssets.forEach((outputAsset, index) => {
                    const assetId = agent.output_asset_ids?.[index];
                    if (assetId) {
                        updateAsset(assetId, {
                            ...outputAsset,
                            status: AssetStatus.READY,
                            metadata: {
                                ...outputAsset.metadata,
                                updatedAt: new Date().toISOString(),
                                agentId: agent.agent_id
                            }
                        });
                    }
                });
            }

            // Update agent status to completed
            updateAgent(agentId, {
                status: AgentStatus.COMPLETED,
                metadata: {
                    ...agent.metadata,
                    lastExecutedAt: new Date().toISOString(),
                    lastExecutionResult: result
                }
            });

            return result;
        } catch (error) {
            console.error(`Error executing agent ${agentId}:`, error);

            // Update agent status to error
            updateAgent(agentId, {
                status: AgentStatus.ERROR,
                metadata: {
                    ...agent.metadata,
                    lastExecutedAt: new Date().toISOString(),
                    lastError: error instanceof Error ? error.message : 'Unknown error'
                }
            });

            throw error;
        }
    }, [state.agents, state.assets, updateAgent, updateAsset]);

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