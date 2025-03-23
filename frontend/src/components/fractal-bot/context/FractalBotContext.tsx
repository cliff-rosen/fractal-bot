import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FractalBotState, StateUpdateAction, Asset } from '../types/state';
import { fractalBotReducer } from '../state/reducer';
import { createInitialState } from '../types/state';
import { ChatMessage } from '../../interactive-workflow/types';
import { Stage } from '../data/fractal_bot_data';

interface FractalBotContextType {
    state: FractalBotState;
    setStage: (stage: Stage) => void;
    addMessage: (stage: Stage, message: ChatMessage) => void;
    addAsset: (asset: Asset) => void;
    updateMetadata: (updates: Partial<FractalBotState['metadata']>) => void;
}

const FractalBotContext = createContext<FractalBotContextType | undefined>(undefined);

export const FractalBotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(fractalBotReducer, createInitialState());

    const setStage = useCallback((stage: Stage) => {
        dispatch({ type: 'SET_STAGE', payload: { stage } });
    }, []);

    const addMessage = useCallback((stage: Stage, message: ChatMessage) => {
        dispatch({ type: 'ADD_MESSAGE', payload: { stage, message } });
    }, []);

    const addAsset = useCallback((asset: Asset) => {
        dispatch({ type: 'ADD_ASSET', payload: { asset } });
    }, []);

    const updateMetadata = useCallback((updates: Partial<FractalBotState['metadata']>) => {
        dispatch({ type: 'UPDATE_METADATA', payload: { updates } });
    }, []);

    const value = {
        state,
        setStage,
        addMessage,
        addAsset,
        updateMetadata
    };

    return (
        <FractalBotContext.Provider value={value}>
            {children}
        </FractalBotContext.Provider>
    );
};

export const useFractalBot = () => {
    const context = useContext(FractalBotContext);
    if (context === undefined) {
        throw new Error('useFractalBot must be used within a FractalBotProvider');
    }
    return context;
}; 