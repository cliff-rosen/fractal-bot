import React, { useMemo } from 'react';
import type { Stage, Step, Tool, WorkflowVariable } from '../../types';
import { useFractalBot } from '@/context/FractalBotContext';
import { Plus } from 'lucide-react';
import StepComponent from './Step';
import { getAvailableInputs } from '../../utils/utils';

interface StageDetailsProps {
    stage: Stage;
}

const getNewStep = (stage: Stage) => {
    const stepId = `step-${Date.now()}`;
    const newStep: Step = {
        id: stepId,
        name: `Step ${(stage.steps?.length || 0) + 1}`,
        description: '',
        status: 'unresolved',
        type: 'atomic',
        tool_id: '',
        childVariables: [],
        inputMappings: [],
        outputMappings: [],
        isSubstep: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    return newStep;
};

export default function StageDetails({ stage }: StageDetailsProps) {
    const { state, addStep, addSubstep, deleteStep, updateStepType, updateStepTool, updateStepInput, updateStepOutput } = useFractalBot();

    // Get all available inputs (workflow inputs + previous step outputs)
    const availableInputs = useMemo(() => {
        if (!state.currentWorkflow) return [];
        return getAvailableInputs(state.currentWorkflow);
    }, [state.currentWorkflow]);

    // Calculate available inputs for each step
    const stepsWithAvailableInputs = useMemo(() => {
        return stage.steps.map(step => ({
            ...step,
            availableInputs: getAvailableInputs(state.currentWorkflow, step)
        }));
    }, [stage.steps, state.currentWorkflow]);

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

        updateStepTool(stage.id, targetStep.id, selectedTool);
    };

    const handleInputSelect = (targetStep: Step, input: WorkflowVariable) => {
        updateStepInput(stage.id, targetStep.id, input);
    };

    const handleOutputSelect = (targetStep: Step, output: WorkflowVariable) => {
        updateStepOutput(stage.id, targetStep.id, output);
    };

    const handleEditStep = (step: Step) => {
        // TODO: Implement step editing logic
        console.log('Edit step:', step);
    };

    const handleUpdateStep = (step: Step) => {
        // Update the step in the stage
        const updatedSteps = stage.steps.map(s => s.id === step.id ? step : s);
        // TODO: Implement step update logic
        console.log('Update step:', step);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stage</h3>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stage.name}</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {stage.description}
                        </p>
                    </div>
                    <button
                        onClick={handleAddStep}
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded px-2 py-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add Step
                    </button>
                </div>
            </div>

            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-[#252b3b] p-2 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Inputs</h4>
                        <ul className="mt-1 space-y-0.5">
                            {stage.childVariables?.filter(v => v.io_type === 'input').slice(0, 3).map((input: WorkflowVariable) => (
                                <li key={input.variable_id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                    {input.name}
                                </li>
                            ))}
                            {stage.childVariables?.filter(v => v.io_type === 'input').length > 3 && (
                                <li className="text-xs text-gray-500 dark:text-gray-400">
                                    +{stage.childVariables.filter(v => v.io_type === 'input').length - 3} more
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#252b3b] p-2 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Outputs</h4>
                        <ul className="mt-1 space-y-0.5">
                            {stage.childVariables?.filter(v => v.io_type === 'output').slice(0, 3).map((output: WorkflowVariable) => (
                                <li key={output.variable_id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                    {output.name}
                                </li>
                            ))}
                            {stage.childVariables?.filter(v => v.io_type === 'output').length > 3 && (
                                <li className="text-xs text-gray-500 dark:text-gray-400">
                                    +{stage.childVariables.filter(v => v.io_type === 'output').length - 3} more
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="p-4">
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
                            onInputSelect={handleInputSelect}
                            onOutputSelect={handleOutputSelect}
                            onUpdateStep={handleUpdateStep}
                            availableTools={state.currentMission.selectedTools}
                            availableInputs={availableInputs}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 