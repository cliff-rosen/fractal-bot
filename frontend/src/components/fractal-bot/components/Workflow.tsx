import React, { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import CondensedWorkflow from './workflow/CondensedWorkflow';
import FullWorkflow from './workflow/FullWorkflow';
import type { Workflow, WorkspaceState, Stage, Step } from '../types/index';
import { useFractalBot } from '@/context/FractalBotContext';

interface WorkflowProps {
    className?: string;
    workflow: Workflow;
    workspaceState: WorkspaceState;
    onStageClick: (stage: Stage) => void;
    onStepClick: (step: Step) => void;
}

export default function Workflow({ className = '', workflow, workspaceState, onStageClick, onStepClick }: WorkflowProps) {
    const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');
    const [isGenerating, setIsGenerating] = useState(false);
    const { state, generateWorkflow } = useFractalBot();

    const handleGenerateWorkflowClick = async () => {
        setIsGenerating(true);
        try {
            await generateWorkflow();
        } finally {
            setIsGenerating(false);
        }
    };

    // Show generate button only when mission is ready and workflow is not ready
    const shouldShowGenerateButton = state.currentMission.status === 'ready' && workflow.status !== 'ready';

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow p-6 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow Stages</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode('compact')}
                        className={`p-2 rounded-lg ${viewMode === 'compact'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('expanded')}
                        className={`p-2 rounded-lg ${viewMode === 'expanded'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {viewMode === 'compact' ? (
                <CondensedWorkflow
                    className="mt-4"
                    stages={workflow.stages}
                    onStageClick={onStageClick}
                />
            ) : (
                <FullWorkflow
                    className="mt-4"
                    stages={workflow.stages}
                    workspaceState={workspaceState}
                    onStageClick={onStageClick}
                    onStepClick={onStepClick}
                />
            )}

            {shouldShowGenerateButton && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerateWorkflowClick}
                        disabled={isGenerating}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isGenerating
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40'
                            }`}
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </span>
                        ) : (
                            'Generate Workflow'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
} 