import React, { useState } from 'react';
import type { Stage, Step } from '../../types';
import { useFractalBot } from '@/context/FractalBotContext';
import StepComponent from './Step';
import { Sparkles } from 'lucide-react';

interface StageDetailsProps {
    stage: Stage;
}

export default function StageDetails({ stage }: StageDetailsProps) {
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [stepType, setStepType] = useState<'tool' | 'substeps'>('tool');
    const [stepName, setStepName] = useState('');
    const [stepDescription, setStepDescription] = useState('');
    const [selectedTool, setSelectedTool] = useState<string>('');
    const { state, setWorkflow } = useFractalBot();

    const createNewStep = (): Step => ({
        id: `step-${Date.now()}`,
        name: stepName,
        description: stepDescription,
        status: 'pending',
        assets: { inputs: [], outputs: [] },
        inputs: [],
        outputs: [],
        tool: stepType === 'tool' ? {
            name: state.currentMission.selectedTools.find(t => t.id === selectedTool)?.name || '',
            configuration: {}
        } : undefined,
        substeps: stepType === 'substeps' ? [] : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const handleAddStep = () => {
        if (!stepName || !stepDescription) return;

        const newStep = createNewStep();
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? { ...s, steps: [...(s.steps || []), newStep] }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
        resetForm();
    };

    const handleAddSubstep = (parentStep: Step) => {
        const newStep: Step = {
            id: `step-${Date.now()}`,
            name: `Substep ${(parentStep.substeps?.length || 0) + 1}`,
            description: 'New substep',
            status: 'pending',
            assets: { inputs: [], outputs: [] },
            inputs: [],
            outputs: [],
            tool: undefined,
            substeps: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedParentStep = {
            ...parentStep,
            substeps: [...(parentStep.substeps || []), newStep]
        };

        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? {
                        ...s,
                        steps: s.steps.map(step =>
                            step.id === parentStep.id ? updatedParentStep : step
                        )
                    }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleClearAllSteps = () => {
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? { ...s, steps: [] }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleEditStep = (step: Step) => {
        console.log('Editing step:', step);
        // TODO: Implement step editing UI
    };

    const handleAISuggestion = async () => {
        // TODO: Implement AI suggestion logic
        console.log('Requesting AI suggestion for stage:', stage.id);
    };

    const resetForm = () => {
        setIsAddingStep(false);
        setStepName('');
        setStepDescription('');
        setSelectedTool('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{stage.name}</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={handleClearAllSteps}
                        className="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                        Clear All Steps
                    </button>
                    <button
                        onClick={handleAISuggestion}
                        className="px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg flex items-center gap-1"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Suggest
                    </button>
                    <button
                        onClick={() => setIsAddingStep(!isAddingStep)}
                        className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                        {isAddingStep ? 'Cancel' : 'Add Step'}
                    </button>
                </div>
            </div>

            {isAddingStep ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Step Type
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="tool"
                                    checked={stepType === 'tool'}
                                    onChange={(e) => setStepType(e.target.value as 'tool' | 'substeps')}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Tool Step</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="substeps"
                                    checked={stepType === 'substeps'}
                                    onChange={(e) => setStepType(e.target.value as 'tool' | 'substeps')}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Step with Substeps</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Step Name
                        </label>
                        <input
                            type="text"
                            value={stepName}
                            onChange={(e) => setStepName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Enter step name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Step Description
                        </label>
                        <textarea
                            value={stepDescription}
                            onChange={(e) => setStepDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            placeholder="Enter step description"
                            rows={3}
                        />
                    </div>

                    {stepType === 'tool' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Tool
                            </label>
                            <select
                                value={selectedTool}
                                onChange={(e) => setSelectedTool(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="">Select a tool</option>
                                {state.currentMission.selectedTools.map((tool) => (
                                    <option key={tool.id} value={tool.id}>
                                        {tool.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleAddStep}
                            disabled={!stepName || !stepDescription || (stepType === 'tool' && !selectedTool)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Step
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {stage.steps && stage.steps.length > 0 ? (
                        stage.steps.map(step => (
                            <StepComponent
                                key={step.id}
                                step={step}
                                onAddSubstep={handleAddSubstep}
                                onEditStep={handleEditStep}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No steps added yet</p>
                    )}
                </div>
            )}
        </div>
    );
} 