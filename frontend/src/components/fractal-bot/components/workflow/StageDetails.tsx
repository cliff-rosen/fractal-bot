import React, { useState } from 'react';
import type { Stage, Step, Tool } from '../../types';
import { useFractalBot } from '@/context/FractalBotContext';
import { Plus } from 'lucide-react';
import StepComponent from './Step';
import { getDirectSubsteps, getStepWithUpdatedType, stepHasChildren } from '../../types/step-utils';

interface StageDetailsProps {
    stage: Stage;
}

const getNewStep = (stage: Stage) => {
    const stepId = `step-${Date.now()}`;
    const newStep: Step = {
        id: stepId,
        name: `Step ${(stage.steps?.length || 0) + 1}`,
        description: '',
        status: 'pending',
        type: 'atomic',
        assets: { inputs: [], outputs: [] },
        inputs: [],
        outputs: [],
        isSubstep: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    return newStep;
};

export default function StageDetails({ stage }: StageDetailsProps) {
    const { state, addStep, addSubstep, deleteStep, updateStepType, updateStepTool } = useFractalBot();

    const handleAddStep = () => {
        const newStep = getNewStep(stage);
        addStep(stage.id, newStep);
    };

    const handleAddSubstep = (parentStep: Step) => {
        const newStep = getNewStep(stage);
        newStep.isSubstep = true;
        addSubstep(stage.id, parentStep.id, newStep);
    };

    const handleDeleteStep = (stepId: string) => {
        deleteStep(stage.id, stepId);
    };

    const handleStepTypeChange = (targetStep: Step, type: 'atomic' | 'composite') => {
        updateStepType(stage.id, targetStep.id, type);
    };

    const handleToolSelect = (targetStep: Step, toolId: string) => {
        const selectedTool = state.currentMission.selectedTools.find((t: Tool) => t.id === toolId);
        if (!selectedTool) return;

        updateStepTool(stage.id, targetStep.id, {
            id: selectedTool.id,
            name: selectedTool.name,
            configuration: {}
        });
    };

    const handleEditStep = (step: Step) => {
        // TODO: Implement step editing logic
        console.log('Edit step:', step);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{stage.name}</h3>
                <button
                    onClick={handleAddStep}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded px-3 py-1"
                >
                    <Plus className="w-4 h-4" />
                    Add Step
                </button>
            </div>

            <div className="space-y-2">
                {stage.steps.map(step => (
                    <StepComponent
                        key={step.id}
                        step={step}
                        onAddSubstep={handleAddSubstep}
                        onEditStep={handleEditStep}
                        onDeleteStep={handleDeleteStep}
                        onStepTypeChange={handleStepTypeChange}
                        onToolSelect={handleToolSelect}
                        availableTools={state.currentMission.selectedTools}
                    />
                ))}
            </div>
        </div>
    );
} 