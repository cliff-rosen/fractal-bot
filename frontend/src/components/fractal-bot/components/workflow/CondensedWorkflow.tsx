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
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
    const { state } = useFractalBot();

    const handleStageClick = (stage: Stage) => {
        setSelectedStage(stage);
        onStageClick(stage);
    };

    return (
        <div className={className}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        onClick={() => handleStageClick(stage)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedStage?.id === stage.id
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