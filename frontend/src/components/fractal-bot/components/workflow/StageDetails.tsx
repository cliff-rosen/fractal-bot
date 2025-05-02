import React, { useState } from 'react';
import type { Stage, Step } from '../../types';
import { useFractalBot } from '@/context/FractalBotContext';
import { ChevronDown, ChevronRight, Plus, Trash2, Sparkles } from 'lucide-react';

interface StageDetailsProps {
    stage: Stage;
}

type StepType = 'atomic' | 'composite';

export default function StageDetails({ stage }: StageDetailsProps) {
    const { state, setWorkflow } = useFractalBot();
    const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

    const toggleStepExpansion = (stepId: string) => {
        setExpandedSteps(prev =>
            prev.includes(stepId)
                ? prev.filter(id => !id.startsWith(stepId))
                : [...prev, stepId]
        );
    };

    const handleAddStep = () => {
        const newStep: Step = {
            id: `step-${Date.now()}`,
            name: `Step ${(stage.steps?.length || 0) + 1}`,
            description: '',
            status: 'pending',
            assets: { inputs: [], outputs: [] },
            inputs: [],
            outputs: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

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

    const handleDeleteStep = (stepId: string) => {
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? { ...s, steps: s.steps.filter(step => !step.id.startsWith(stepId)) }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleStepTypeChange = (stepId: string, type: StepType) => {
        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? {
                        ...s,
                        steps: s.steps.map(step =>
                            step.id === stepId
                                ? {
                                    ...step,
                                    tool: type === 'atomic' ? { name: '', configuration: {} } : undefined,
                                    substeps: type === 'composite' ? [] : undefined
                                }
                                : step
                        )
                    }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleToolSelect = (stepId: string, toolId: string) => {
        const selectedTool = state.currentMission.selectedTools.find(t => t.id === toolId);
        if (!selectedTool) return;

        const updatedWorkflow = {
            ...state.currentWorkflow,
            stages: state.currentWorkflow.stages.map(s =>
                s.id === stage.id
                    ? {
                        ...s,
                        steps: s.steps.map(step =>
                            step.id === stepId
                                ? {
                                    ...step,
                                    tool: {
                                        name: selectedTool.name,
                                        configuration: {}
                                    }
                                }
                                : step
                        )
                    }
                    : s
            )
        };
        setWorkflow(updatedWorkflow);
    };

    const handleAISuggest = (stepId: string) => {
        console.log('AI suggestion requested for step:', stepId);
        // TODO: Implement AI suggestion logic
    };

    const renderStep = (step: Step, depth: number = 0) => {
        const isExpanded = expandedSteps.includes(step.id);
        const isComposite = !!step.substeps;

        return (
            <div key={step.id} className="mb-4" style={{ marginLeft: `${depth * 24}px` }}>
                <div className="flex items-center gap-2 mb-2">
                    {step.substeps && (
                        <button
                            onClick={() => toggleStepExpansion(step.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    )}
                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm font-medium">{step.name}</span>
                        <select
                            value={isComposite ? 'composite' : 'atomic'}
                            onChange={(e) => handleStepTypeChange(step.id, e.target.value as StepType)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                        >
                            <option value="atomic">Atomic</option>
                            <option value="composite">Composite</option>
                        </select>
                        {!isComposite && (
                            <select
                                value={step.tool?.name || ''}
                                onChange={(e) => handleToolSelect(step.id, e.target.value)}
                                className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                            >
                                <option value="">Select a tool</option>
                                {state.currentMission.selectedTools.map((tool) => (
                                    <option key={tool.id} value={tool.id}>
                                        {tool.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={() => handleAISuggest(step.id)}
                            className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                            title="AI Suggest"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            title="Delete Step"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {isExpanded && step.substeps && (
                    <div className="mt-4">
                        {step.substeps.map(substep => renderStep(substep, depth + 1))}
                        <button
                            onClick={() => {/* TODO: Add substep */ }}
                            className="mt-2 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded px-2 py-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add Step
                        </button>
                    </div>
                )}
            </div>
        );
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
                {stage.steps.map(step => renderStep(step))}
            </div>
        </div>
    );
} 