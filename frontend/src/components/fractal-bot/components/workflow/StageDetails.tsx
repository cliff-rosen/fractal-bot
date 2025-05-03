import React, { useState } from 'react';
import type { Stage, Step } from '../../types';
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
    const { state, setWorkflow } = useFractalBot();

    const handleAddStep = () => {
        const newStep = getNewStep(stage);
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? { ...s, steps: [...(s.steps || []), newStep] }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleAddSubstep = (parentStep: Step) => {
        const newStep = getNewStep(stage);
        newStep.isSubstep = true;

        const addSubstepToStep = (steps: Step[], targetId: string): Step[] => {
            return steps.map(step => {
                if (step.id === targetId) {
                    return {
                        ...step,
                        substeps: [...(step.substeps || []), newStep]
                    };
                }
                if (step.substeps) {
                    return {
                        ...step,
                        substeps: addSubstepToStep(step.substeps, targetId)
                    };
                }
                return step;
            });
        };

        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? {
                        ...s,
                        steps: addSubstepToStep(s.steps, parentStep.id)
                    }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleDeleteStep = (targetStepId: string) => {
        console.log('Deleting step:', targetStepId);

        const deleteSubstepFromStepTree = (parentStep: Step): Step => {

            if (parentStep.substeps?.length == 0 || parentStep.substeps == undefined)
                return parentStep;

            const initialChildSteps = getDirectSubsteps(parentStep)
            const newChildSteps = initialChildSteps.filter(step => step.id !== targetStepId)

            if (newChildSteps.length < initialChildSteps.length)
                return {
                    ...parentStep,
                    substeps: newChildSteps
                }

            return {
                ...parentStep,
                substeps: initialChildSteps.map(step => deleteSubstepFromStepTree(step))
            }

        };

        var updatedWorkflow = {}
        var updatedSteps = stage.steps.filter(step => step.id !== targetStepId);


        if (updatedSteps.length == stage.steps.length) {
            updatedSteps = updatedSteps.map(step => deleteSubstepFromStepTree(step))
        }

        updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? { ...s, steps: updatedSteps }
                    : s
            )
        }

        setWorkflow(updatedWorkflow);
    };

    const handleStepTypeChange = (targetStep: Step, type: 'atomic' | 'composite') => {

        const getTreeWithUpdatedSubstepType = (step: Step): Step => {

            if (step.id == targetStep.id) {
                return getStepWithUpdatedType(step, type)
            }

            if (!stepHasChildren(step)) {
                return step
            }

            return {
                ...step,
                substeps: step.substeps?.map(substep => getTreeWithUpdatedSubstepType(substep))
            }
        }

        const updatedTree = stage.steps.map(step => getTreeWithUpdatedSubstepType(step))
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? { ...s, steps: updatedTree }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleToolSelect = (targetStep: Step, toolId: string) => {
        const selectedTool = state.currentMission.selectedTools.find(t => t.id === toolId);
        if (!selectedTool) return;

        const getTreeWithUpdatedTool = (step: Step): Step => {
            if (step.id === targetStep.id) {
                return {
                    ...step,
                    tool: {
                        id: selectedTool.id,
                        name: selectedTool.name,
                        configuration: {}
                    }
                };
            }

            if (!stepHasChildren(step)) {
                return step;
            }

            return {
                ...step,
                substeps: step.substeps?.map(substep => getTreeWithUpdatedTool(substep))
            };
        };

        const updatedTree = stage.steps.map(step => getTreeWithUpdatedTool(step));
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? { ...s, steps: updatedTree }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
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