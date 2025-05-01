import React, { useState } from 'react';
import type { Stage, Step } from '../../types';
import { getStatusClass } from './types';
import StageDetails from './StageDetails';
import { useFractalBot } from '@/context/FractalBotContext';

interface CondensedWorkflowProps {
    className?: string;
    stages: Stage[];
    onStageClick: (stage: Stage) => void;
    onStepClick: (step: Step) => void;
}

export default function CondensedWorkflow({
    className = '',
    stages,
    onStageClick,
    onStepClick
}: CondensedWorkflowProps) {
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
    const { state } = useFractalBot();

    const handleStageClick = (stage: Stage) => {
        setSelectedStageId(stage.id);
        onStageClick(stage);
    };

    const selectedStage = selectedStageId
        ? state.currentWorkflow.stages.find(s => s.id === selectedStageId)
        : null;

    return (
        <div className={className}>
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        onClick={() => handleStageClick(stage)}
                        className={`flex-shrink-0 w-64 p-4 rounded-lg cursor-pointer transition-colors ${selectedStageId === stage.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{stage.name}</h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{stage.description}</p>
                    </div>
                ))}
            </div>

            {selectedStage && (
                <div className="mt-6">
                    <StageDetails
                        stage={selectedStage}
                        onStepClick={onStepClick}
                    />
                </div>
            )}
        </div>
    );
} 