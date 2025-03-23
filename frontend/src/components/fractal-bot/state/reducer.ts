import { FractalBotState, StateUpdateAction } from '../types/state';

export const fractalBotReducer = (state: FractalBotState, action: StateUpdateAction): FractalBotState => {
    const newState = { ...state };

    switch (action.type) {
        case 'SET_STAGE': {
            return {
                ...newState,
                currentStage: action.payload.stage,
                metadata: {
                    ...newState.metadata,
                    lastUpdated: new Date().toISOString()
                }
            };
        }

        case 'ADD_MESSAGE': {
            newState.messages.push(action.payload.message);
            newState.metadata.lastUpdated = new Date().toISOString();
            return newState;
        }

        case 'ADD_ASSET': {
            // Check if asset already exists
            const existingIndex = newState.assets.findIndex(a => a.asset_id === action.payload.asset.asset_id);
            if (existingIndex >= 0) {
                // Update existing asset
                newState.assets[existingIndex] = action.payload.asset;
            } else {
                // Add new asset
                newState.assets.push(action.payload.asset);
            }
            newState.metadata.lastUpdated = new Date().toISOString();
            return newState;
        }

        case 'UPDATE_METADATA': {
            newState.metadata = {
                ...newState.metadata,
                ...action.payload.updates,
                lastUpdated: new Date().toISOString()
            };
            return newState;
        }

        default:
            return state;
    }
}; 