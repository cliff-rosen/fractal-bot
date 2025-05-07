import React, { useState } from 'react';
import { useFractalBot } from '@/context/FractalBotContext';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Stage } from '../types';
import StepsList from './workflow/StepsList';

interface WorkflowProps {
    className?: string;
}

export default function Workflow({ className = '' }: WorkflowProps) {
    const { state, generateWorkflow, setCurrentStage } = useFractalBot();

    const workflow = state.currentWorkflow;

    const handleGenerateWorkflowClick = async () => {
        try {
            await generateWorkflow();
        } catch (error) {
            console.error('Failed to generate workflow:', error);
        }
    };

    const handleStageClick = (stageIdx: number) => {
        console.log('handleStageClick', stageIdx);
        setCurrentStage(stageIdx);
    };

    // Show generate button only when mission is ready and workflow is not ready
    const shouldShowGenerateButton = state.currentMission.status === 'ready' && workflow.status !== 'ready';

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
            {/* Vertical Line from Mission to Stages */}
            <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>

                {/* Workflow Header */}
                <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                            <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow Stages</h2>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{workflow.name || 'No Workflow'}</h3>
                        </div>
                        {shouldShowGenerateButton && (
                            <button
                                onClick={handleGenerateWorkflowClick}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                                Generate Workflow
                            </button>
                        )}
                    </div>
                </div>

                {/* Horizontal Stages */}
                <div className="relative py-12">
                    <div className="flex justify-center items-start gap-16">
                        {workflow.stages.map((stage: Stage, index: number) => (
                            <div key={stage.id} className="relative w-80">
                                {/* Stage Card */}
                                <div
                                    className="bg-gray-50 dark:bg-[#252b3b] rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                    onClick={() => handleStageClick(index)}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {stage.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                {stage.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${stage.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                stage.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                {stage.status.toUpperCase()}
                                            </span>
                                            {state.currentStageIdx === index ? (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Stage Inputs and Outputs */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Stage Inputs */}
                                        <div>
                                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Inputs</h5>
                                            <ul className="space-y-1">
                                                {stage.childVariables?.filter(v => v.io_type === 'input').map((input) => (
                                                    <li key={input.variable_id} className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{input.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Stage Outputs */}
                                        <div>
                                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Outputs</h5>
                                            <ul className="space-y-1">
                                                {stage.childVariables?.filter(v => v.io_type === 'output').map((output) => (
                                                    <li key={output.variable_id} className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{output.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Line to Steps */}
                                {state.currentStageIdx === index && (
                                    <div className="absolute left-1/2 top-full w-0.5 h-8 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Stage Details */}
                {state.currentStageIdx !== null && (
                    <div className="relative px-4 pb-4">
                        <StepsList stage={workflow.stages[state.currentStageIdx]} />
                    </div>
                )}
            </div>
        </div>
    );
} 