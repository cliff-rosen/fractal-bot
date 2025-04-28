import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Asset, ChatMessage, Mission as MissionType, Workflow as WorkflowType, Workspace as WorkspaceType, WorkspaceState, Tool, ItemView as ItemViewType, MissionProposal, DataFromLine } from '@/components/fractal-bot/types/index';
import { assetsTemplate, missionTemplate, workflowTemplate, workspaceStateTemplate, workspaceTemplate, toolsTemplate } from '@/components/fractal-bot/types/type-defaults';
import { botApi } from '@/lib/api/botApi';
import { Message, MessageRole } from '@/types/message';
import { createMissionFromProposal, getDataFromLine } from '@/components/fractal-bot/utils/utils';

// Define the state interface
interface FractalBotState {
    currentMission: MissionType;
    currentMissionProposal: MissionProposal | undefined;
    currentWorkspaceState: WorkspaceState;
    currentMessages: ChatMessage[];
    currentStreamingMessage: string;
    currentWorkflow: WorkflowType;
    currentWorkspace: WorkspaceType;
    currentTools: Tool[];
    currentAssets: Asset[];
    selectedToolIds: string[];
    currentItemView: ItemViewType;
    activeView: 'workspace' | 'history';
    statusHistory: string[];
}

// Define action types
type FractalBotAction =
    | { type: 'SET_MISSION'; payload: MissionType }
    | { type: 'SET_MISSION_PROPOSAL'; payload: MissionProposal | undefined }
    | { type: 'SET_WORKSPACE_STATE'; payload: WorkspaceState }
    | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
    | { type: 'SET_STREAMING_MESSAGE'; payload: string }
    | { type: 'SET_WORKFLOW'; payload: WorkflowType }
    | { type: 'SET_WORKSPACE'; payload: WorkspaceType }
    | { type: 'SET_TOOLS'; payload: Tool[] }
    | { type: 'SET_ASSETS'; payload: Asset[] }
    | { type: 'SET_SELECTED_TOOL_IDS'; payload: string[] }
    | { type: 'SET_ITEM_VIEW'; payload: ItemViewType }
    | { type: 'SET_ACTIVE_VIEW'; payload: 'workspace' | 'history' }
    | { type: 'SET_STATUS_HISTORY'; payload: string[] }
    | { type: 'RESET_STATE' };

// Initial state
const initialState: FractalBotState = {
    currentMission: missionTemplate,
    currentMissionProposal: undefined,
    currentWorkspaceState: workspaceStateTemplate,
    currentMessages: [],
    currentStreamingMessage: '',
    currentWorkflow: workflowTemplate,
    currentWorkspace: workspaceTemplate,
    currentTools: toolsTemplate,
    currentAssets: assetsTemplate,
    selectedToolIds: [],
    currentItemView: {
        title: '',
        type: 'none',
        isOpen: false
    },
    activeView: 'history',
    statusHistory: []
};

// Create context
const FractalBotContext = createContext<{
    state: FractalBotState;
    dispatch: React.Dispatch<FractalBotAction>;
    sendMessage: (message: ChatMessage) => Promise<void>;
    generateWorkflow: () => void;
    resetState: () => void;
} | undefined>(undefined);

// Reducer function
function fractalBotReducer(state: FractalBotState, action: FractalBotAction): FractalBotState {
    switch (action.type) {
        case 'SET_MISSION':
            return { ...state, currentMission: action.payload };
        case 'SET_MISSION_PROPOSAL':
            return { ...state, currentMissionProposal: action.payload };
        case 'SET_WORKSPACE_STATE':
            return { ...state, currentWorkspaceState: action.payload };
        case 'SET_MESSAGES':
            return { ...state, currentMessages: action.payload };
        case 'SET_STREAMING_MESSAGE':
            return { ...state, currentStreamingMessage: action.payload };
        case 'SET_WORKFLOW':
            return { ...state, currentWorkflow: action.payload };
        case 'SET_WORKSPACE':
            return { ...state, currentWorkspace: action.payload };
        case 'SET_TOOLS':
            return { ...state, currentTools: action.payload };
        case 'SET_ASSETS':
            return { ...state, currentAssets: action.payload };
        case 'SET_SELECTED_TOOL_IDS':
            return { ...state, selectedToolIds: action.payload };
        case 'SET_ITEM_VIEW':
            return { ...state, currentItemView: action.payload };
        case 'SET_ACTIVE_VIEW':
            return { ...state, activeView: action.payload };
        case 'SET_STATUS_HISTORY':
            return { ...state, statusHistory: action.payload };
        case 'RESET_STATE':
            return initialState;
        default:
            return state;
    }
}

// Provider component
export function FractalBotProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(fractalBotReducer, initialState);

    const processBotMessage = useCallback((data: DataFromLine) => {
        if (data.token) {
            dispatch({
                type: 'SET_STREAMING_MESSAGE',
                payload: state.currentStreamingMessage + data.token
            });
        }

        if (data.status) {
            const newStatusMessage = data.status;
            const currentContent = state.currentWorkspace.content;
            const newContent = { ...currentContent, text: newStatusMessage };

            dispatch({
                type: 'SET_WORKSPACE',
                payload: {
                    ...state.currentWorkspace,
                    status: "current",
                    content: newContent
                }
            });

            let message = "";
            let error = "";
            if (data.message) {
                message = data.message;
            }
            if (data.error) {
                error = data.error;
            }
            const messageToAdd = newStatusMessage + " " + message + " " + error;

            dispatch({
                type: 'SET_STATUS_HISTORY',
                payload: [...state.statusHistory, messageToAdd]
            });
        }

        if (data.mission_proposal) {
            const new_mission = createMissionFromProposal(data.mission_proposal);
            dispatch({
                type: 'SET_MISSION',
                payload: new_mission
            });
            dispatch({
                type: 'SET_MISSION_PROPOSAL',
                payload: data.mission_proposal
            });
        }

        return data.token || "";
    }, [state]);

    const sendMessage = useCallback(async (message: ChatMessage) => {
        dispatch({
            type: 'SET_MESSAGES',
            payload: [...state.currentMessages, message]
        });

        let finalContent = '';

        try {
            // Convert ChatMessage[] to Message[]
            const messages: Message[] = state.currentMessages.map(msg => ({
                message_id: msg.id,
                role: msg.role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT,
                content: msg.content,
                timestamp: new Date(msg.timestamp)
            }));

            // Get the full tool objects for selected tool IDs
            const selectedToolObjects = state.currentTools.filter(tool => state.selectedToolIds.includes(tool.id));

            for await (const update of botApi.streamMessage(message.content, messages, state.currentMission, selectedToolObjects)) {
                const lines = update.data.split('\n');
                for (const line of lines) {
                    const data = getDataFromLine(line);
                    finalContent += processBotMessage(data);
                }
            }

            if (finalContent.length === 0) {
                finalContent = "No direct response from the bot. Check item view for more information.";
            }

            // Update the final message with the complete content
            const finalMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: finalContent,
                timestamp: new Date().toISOString()
            };

            dispatch({
                type: 'SET_MESSAGES',
                payload: [...state.currentMessages, finalMessage]
            });

            dispatch({
                type: 'SET_WORKSPACE',
                payload: {
                    ...state.currentWorkspace,
                    status: 'completed'
                }
            });

        } catch (error) {
            console.error('Error streaming message:', error);
        } finally {
            dispatch({
                type: 'SET_STREAMING_MESSAGE',
                payload: ''
            });
        }
    }, [state, processBotMessage]);

    const setWorkspaceToProposedWorkflow = useCallback((workflow: any) => {
        const now = new Date().toISOString();

        // Update the workspace to show the proposed workflow
        dispatch({
            type: 'SET_WORKSPACE',
            payload: {
                ...state.currentWorkspace,
                type: 'proposedWorkflowDesign',
                title: 'Proposed Workflow',
                status: 'current',
                content: {
                    ...state.currentWorkspace.content,
                    workflow: {
                        ...workflowTemplate,
                        name: 'Proposed Workflow',
                        description: workflow.explanation,
                        stages: workflow.steps.map((step: any, index: number) => ({
                            id: `stage-${index}`,
                            name: step.description,
                            description: step.description,
                            status: 'pending',
                            steps: [{
                                id: `step-${index}`,
                                name: step.description,
                                description: step.description,
                                status: 'pending',
                                tool: step.tool_id !== 'deferred' ? {
                                    name: step.tool_id,
                                    configuration: {}
                                } : undefined,
                                assets: {
                                    inputs: [],
                                    outputs: []
                                },
                                inputs: step.inputs || [],
                                outputs: step.outputs || [],
                                createdAt: now,
                                updatedAt: now
                            }],
                            assets: {
                                inputs: [],
                                outputs: []
                            },
                            inputs: step.inputs || [],
                            outputs: step.outputs || [],
                            createdAt: now,
                            updatedAt: now
                        })),
                        createdAt: now,
                        updatedAt: now
                    }
                }
            }
        });

        // Switch to workspace view
        dispatch({
            type: 'SET_ACTIVE_VIEW',
            payload: 'workspace'
        });
    }, [state]);

    const generateWorkflow = useCallback(async () => {
        try {
            // Stream the workflow generation
            for await (const update of botApi.streamWorkflow(
                state.currentMission,
                state.currentTools.filter(tool => state.selectedToolIds.includes(tool.id))
            )) {
                const lines = update.data.split('\n');
                for (const line of lines) {
                    const data = getDataFromLine(line);

                    // Handle status updates
                    if (data.status) {
                        dispatch({
                            type: 'SET_STATUS_HISTORY',
                            payload: [...state.statusHistory, data.status]
                        });
                    }

                    // Handle the final workflow
                    if (data.steps_generator) {
                        setWorkspaceToProposedWorkflow(data.steps_generator);
                    }

                    // Handle the token
                    if (data.token) {
                        const newMessage: ChatMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: data.token,
                            timestamp: new Date().toISOString()
                        };
                        dispatch({
                            type: 'SET_MESSAGES',
                            payload: [...state.currentMessages, newMessage]
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error generating workflow:', error);
            dispatch({
                type: 'SET_STATUS_HISTORY',
                payload: [...state.statusHistory, `Error: ${error}`]
            });
        }
    }, [state, setWorkspaceToProposedWorkflow]);

    const resetState = useCallback(() => {
        dispatch({ type: 'RESET_STATE' });
    }, [dispatch]);

    return (
        <FractalBotContext.Provider value={{ state, dispatch, sendMessage, generateWorkflow, resetState }}>
            {children}
        </FractalBotContext.Provider>
    );
}

// Custom hook for using the context
export function useFractalBot() {
    const context = useContext(FractalBotContext);
    if (context === undefined) {
        throw new Error('useFractalBot must be used within a FractalBotProvider');
    }
    return context;
}
