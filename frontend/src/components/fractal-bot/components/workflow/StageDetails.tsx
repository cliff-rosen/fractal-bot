import React, { useState } from 'react';
import type { Stage, Step, Tool } from '../../types';
import { useFractalBot } from '@/context/FractalBotContext';
import StepItem from './Step';
import { ArrowLeft } from 'lucide-react';

interface StageDetailsProps {
    stage: Stage;
    onStepClick: (step: Step) => void;
}

export default function StageDetails({ stage, onStepClick }: StageDetailsProps) {
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [stepType, setStepType] = useState<'tool' | 'substeps'>('tool');
    const [stepName, setStepName] = useState('');
    const [stepDescription, setStepDescription] = useState('');
    const [selectedTool, setSelectedTool] = useState<string>('');
    const [selectedStep, setSelectedStep] = useState<Step | null>(null);
    const { state, setWorkflow } = useFractalBot();

    const handleAddStep = () => {
        if (!stepName || !stepDescription) return;

        const newStep: Step = {
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
        };

        // Update the workflow with the new step
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? {
                        ...s,
                        steps: s.steps.map(step => {
                            if (selectedStep && step.id === selectedStep.id) {
                                return {
                                    ...step,
                                    substeps: [...(step.substeps || []), newStep]
                                };
                            }
                            return step;
                        })
                    }
                    : s
            )
        };

        setWorkflow(updatedWorkflow);
        setIsAddingStep(false);
        setStepName('');
        setStepDescription('');
        setSelectedTool('');
    };

    const handleStepClick = (step: Step) => {
        setSelectedStep(step);
    };

    const handleAddSubstep = (parentStep: Step) => {
        setSelectedStep(parentStep);
        setIsAddingStep(true);
        setStepType('tool');
    };

    const renderStepDetails = (step: Step) => {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setSelectedStep(null)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{step.name}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>

                {step.tool ? (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tool Configuration</h4>
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-300">{step.tool.name}</p>
                            {/* Add tool configuration UI here */}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Substeps</h4>
                            <button
                                onClick={() => {
                                    setSelectedStep(step);
                                    setIsAddingStep(true);
                                }}
                                className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            >
                                Add Substep
                            </button>
                        </div>
                        <div className="mt-2 space-y-2">
                            {step.substeps && step.substeps.length > 0 ? (
                                step.substeps.map(substep => (
                                    <StepItem
                                        key={substep.id}
                                        step={substep}
                                        onStepClick={handleStepClick}
                                        onAddSubstep={handleAddSubstep}
                                        isSubstep={true}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No substeps added yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {selectedStep ? (
                renderStepDetails(selectedStep)
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{stage.name}</h3>
                        <button
                            onClick={() => setIsAddingStep(!isAddingStep)}
                            className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        >
                            {isAddingStep ? 'Cancel' : 'Add Step'}
                        </button>
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
                                    <StepItem
                                        key={step.id}
                                        step={step}
                                        onStepClick={handleStepClick}
                                        onAddSubstep={handleAddSubstep}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No steps added yet</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 