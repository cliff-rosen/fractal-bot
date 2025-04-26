import React, { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import CondensedWorkflow from './workflow/CondensedWorkflow';
import FullWorkflow from './workflow/FullWorkflow';
import type { Workflow, WorkspaceState } from '../types/index';

interface WorkflowProps {
    className?: string;
    workflow: Workflow;
    workspaceState: WorkspaceState;
}

export default function Workflow({ className = '', workflow, workspaceState }: WorkflowProps) {
    const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');

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
                <CondensedWorkflow className="mt-4" stages={workflow.stages} />
            ) : (
                <FullWorkflow className="mt-4" stages={workflow.stages} workspaceState={workspaceState} />
            )}
        </div>
    );
} 