import React, { useState } from 'react';
import type { Stage } from '../../types';
import StageDetails from './StageDetails';
import { useFractalBot } from '@/context/FractalBotContext';


export default function CondensedWorkflow() {
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
    const { state } = useFractalBot();

    const stages = state.currentWorkflow.stages;

    const handleStageClick = (stage: Stage) => {
        setSelectedStageId(stage.id);
    };

    const selectedStage = selectedStageId
        ? state.currentWorkflow.stages.find(s => s.id === selectedStageId)
        : null;

    return (
        <div>
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

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Inputs</h4>
                                <ul className="mt-1 space-y-0.5">
                                    {stage.childVariables?.filter(v => v.io_type === 'input').slice(0, 2).map((input) => (
                                        <li key={input.variable_id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                            {input.name}
                                        </li>
                                    ))}
                                    {stage.childVariables?.filter(v => v.io_type === 'input').length > 2 && (
                                        <li className="text-xs text-gray-500 dark:text-gray-400">
                                            +{stage.childVariables.filter(v => v.io_type === 'input').length - 2} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Outputs</h4>
                                <ul className="mt-1 space-y-0.5">
                                    {stage.childVariables?.filter(v => v.io_type === 'output').slice(0, 2).map((output) => (
                                        <li key={output.variable_id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                            {output.name}
                                        </li>
                                    ))}
                                    {stage.childVariables?.filter(v => v.io_type === 'output').length > 2 && (
                                        <li className="text-xs text-gray-500 dark:text-gray-400">
                                            +{stage.childVariables.filter(v => v.io_type === 'output').length - 2} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedStage && (
                <div className="mt-6">
                    <StageDetails
                        stage={selectedStage}
                    />
                </div>
            )}
        </div>
    );
} 