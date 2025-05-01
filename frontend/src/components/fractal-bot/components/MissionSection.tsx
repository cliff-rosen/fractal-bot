import React from 'react';
import Mission from './Mission';
import Workflow from './workflow/Workflow';
import DetailsPanel from './workflow/DetailsPanel';
import type { Workflow as WorkflowType, WorkspaceState, Stage, Step } from '../types/index';

interface MissionSectionProps {
    workflow: WorkflowType;
    workspaceState: WorkspaceState;
    selectedItem: {
        item: Stage | Step;
        type: 'stage' | 'step' | 'substep';
    } | null;
    onItemSelect: (item: Stage | Step, type: 'stage' | 'step' | 'substep') => void;
}

export default function MissionSection({
    workflow,
    workspaceState,
    selectedItem,
    onItemSelect
}: MissionSectionProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Mission Header */}
            <div className="flex-none">
                <Mission />
            </div>

            {/* Two-column layout for workflow and details */}
            <div className="flex flex-1 overflow-hidden">
                {/* Workflow Explorer Column */}
                <div className="w-1/2 overflow-y-auto pr-4">
                    <Workflow
                        workflow={workflow}
                        workspaceState={workspaceState}
                        onStageClick={(stage) => onItemSelect(stage, 'stage')}
                        onStepClick={(step) => onItemSelect(step, 'step')}
                    />
                </div>

                {/* Details Column */}
                <div className="w-1/2 overflow-y-auto pl-4 border-l border-gray-100 dark:border-gray-700">
                    {selectedItem ? (
                        <DetailsPanel item={selectedItem.item} type={selectedItem.type} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            Select a stage or step to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 