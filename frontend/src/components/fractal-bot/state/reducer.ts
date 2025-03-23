import { FractalBotState, StateUpdateAction } from '../types/state';

export const fractalBotReducer = (state: FractalBotState, action: StateUpdateAction): FractalBotState => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload.message],
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'CLEAR_MESSAGES':
            return {
                ...state,
                messages: [],
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'ADD_ASSET':
            return {
                ...state,
                assets: {
                    ...state.assets,
                    [action.payload.asset.asset_id]: action.payload.asset
                },
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'UPDATE_ASSET':
            return {
                ...state,
                assets: {
                    ...state.assets,
                    [action.payload.assetId]: {
                        ...state.assets[action.payload.assetId],
                        ...action.payload.updates
                    }
                },
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'REMOVE_ASSET':
            const { [action.payload.assetId]: removed, ...remainingAssets } = state.assets;
            return {
                ...state,
                assets: remainingAssets,
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'ADD_AGENT':
            return {
                ...state,
                agents: {
                    ...state.agents,
                    [action.payload.agent.agent_id]: action.payload.agent
                },
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'UPDATE_AGENT':
            return {
                ...state,
                agents: {
                    ...state.agents,
                    [action.payload.agentId]: {
                        ...state.agents[action.payload.agentId],
                        ...action.payload.updates
                    }
                },
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'REMOVE_AGENT':
            const { [action.payload.agentId]: removedAgent, ...remainingAgents } = state.agents;
            return {
                ...state,
                agents: remainingAgents,
                metadata: {
                    ...state.metadata,
                    lastUpdated: new Date()
                }
            };

        case 'UPDATE_METADATA':
            return {
                ...state,
                metadata: {
                    ...state.metadata,
                    ...action.payload.updates,
                    lastUpdated: new Date()
                }
            };

        case 'RESET_STATE':
            return {
                messages: [],
                assets: {},
                agents: {},
                metadata: {
                    isProcessing: false,
                    lastUpdated: new Date()
                }
            };

        default:
            return state;
    }
}; 