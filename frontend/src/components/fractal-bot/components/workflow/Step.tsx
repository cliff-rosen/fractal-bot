import React, { useMemo } from 'react';
import type { Step, Tool, WorkflowVariable, StepStatus, VariableStatus, VariableMapping } from '../../types';
import { Pencil, Sparkles, Plus, Trash2, AlertCircle, CheckCircle2, Clock, Settings, ArrowRight, XCircle, HelpCircle } from 'lucide-react';
import { getFilteredInputs, getStepStatus, getAvailableInputs } from '../../utils/utils';
import { doSchemasMatch } from '../../types';
import { useFractalBot } from '@/context/FractalBotContext';

interface StepProps {
    step: Step;
    parentStep?: Step;
    onAddSubstep: (step: Step) => void;
    onEditStep?: (step: Step) => void;
    onDeleteStep?: (stepId: string) => void;
    onStepTypeChange?: (step: Step, type: 'atomic' | 'composite') => void;
    onToolSelect?: (step: Step, toolId: string) => void;
    onInputSelect?: (step: Step, input: WorkflowVariable) => void;
    onOutputSelect?: (step: Step, output: WorkflowVariable) => void;
    onUpdateStep: (step: Step) => void;
    availableTools?: Tool[];
    availableInputs?: WorkflowVariable[];
    depth?: number;
}

// Helper component for variable status badge
const VariableStatusBadge = ({ status, error_message }: { status: VariableStatus; error_message?: string }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'ready':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'error':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'ready':
                return <CheckCircle2 className="w-3 h-3" />;
            case 'error':
                return <AlertCircle className="w-3 h-3" />;
            default:
                return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{status}</span>
            {error_message && (
                <span className="ml-1 text-xs opacity-75">({error_message})</span>
            )}
        </div>
    );
};

// Helper component for step status display
const StepStatusDisplay = ({ status }: { status: StepStatus }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'ready':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pending_inputs_ready':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'ready':
            case 'completed':
                return <CheckCircle2 className="w-3 h-3" />;
            case 'failed':
                return <AlertCircle className="w-3 h-3" />;
            case 'in_progress':
                return <ArrowRight className="w-3 h-3" />;
            case 'pending_inputs_ready':
                return <Clock className="w-3 h-3" />;
            default:
                return <Settings className="w-3 h-3" />;
        }
    };

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{status}</span>
        </div>
    );
};

// Helper component for variable list
const VariableList = ({
    variables,
    onSelect,
    availableVariables = [],
    isInput = true
}: {
    variables: WorkflowVariable[];
    onSelect: (variable: WorkflowVariable) => void;
    availableVariables?: WorkflowVariable[];
    isInput?: boolean;
}) => {
    return (
        <div className="space-y-1">
            {variables.map((variable) => (
                <div key={variable.variable_id} className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 dark:text-gray-100">{variable.name}</span>
                            <VariableStatusBadge status={variable.status} error_message={variable.error_message} />
                        </div>
                    </div>
                    {isInput && (
                        <select
                            value={variable.variable_id}
                            onChange={(e) => {
                                const selected = availableVariables.find(v => v.variable_id === e.target.value);
                                if (selected) onSelect(selected);
                            }}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">Select variable</option>
                            {availableVariables.map((v) => (
                                <option key={v.variable_id} value={v.variable_id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            ))}
        </div>
    );
};

// Helper function to create a new step with proper defaults
const createNewStep = (parentStep?: Step, priorSibling?: Step, stageInputs: WorkflowVariable[] = []): Step => {
    const newStep: Step = {
        id: crypto.randomUUID(),
        name: 'New Step',
        description: '',
        type: 'atomic',
        tool_id: '',
        inputs: [],
        outputs: [],
        inputMappings: [],
        outputMappings: [],
        status: 'unresolved',
        assets: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Initialize inputs based on position
    if (parentStep) {
        if (priorSibling) {
            // For subsequent siblings, use prior sibling's outputs
            newStep.inputs = priorSibling.outputs.map(output => ({
                ...output,
                variable_id: crypto.randomUUID(),
                io_type: 'input'
            }));
        } else {
            // For first child, use parent's inputs
            newStep.inputs = parentStep.inputs.map(input => ({
                ...input,
                variable_id: crypto.randomUUID(),
                io_type: 'input'
            }));
        }
    } else {
        // For top-level steps, use stage inputs
        newStep.inputs = stageInputs.map(input => ({
            ...input,
            variable_id: crypto.randomUUID(),
            io_type: 'input'
        }));
    }

    // Initialize outputs to parent's output
    if (parentStep && parentStep.outputs && parentStep.outputs.length > 0) {
        newStep.outputs = parentStep.outputs.map(output => ({
            ...output,
            variable_id: crypto.randomUUID(),
            io_type: 'output'
        }));
    }

    return newStep;
};

export default function Step({
    step,
    parentStep,
    onAddSubstep,
    onEditStep,
    onDeleteStep,
    onStepTypeChange,
    onToolSelect,
    onInputSelect,
    onOutputSelect,
    onUpdateStep,
    availableTools = [],
    availableInputs = [],
    depth = 0
}: StepProps) {
    const { setSelectedStep } = useFractalBot();

    // Initialize mappings if they don't exist
    const stepWithMappings = useMemo(() => ({
        ...step,
        inputMappings: step.inputMappings || [],
        outputMappings: step.outputMappings || []
    }), [step]);

    // Get filtered inputs based on selected tool
    const filteredInputs = useMemo(() => {
        if (!stepWithMappings.tool_id) return [];
        const selectedTool = availableTools.find(t => t.id === stepWithMappings.tool_id);
        if (!selectedTool) return [];
        return getFilteredInputs(availableInputs, [selectedTool]);
    }, [stepWithMappings.tool_id, availableTools, availableInputs]);

    // Get available inputs based on step position
    const stepAvailableInputs = useMemo(() => {
        const inputs: WorkflowVariable[] = [];

        // Add stage-level available inputs
        inputs.push(...availableInputs);

        // Add parent's inputs
        if (parentStep) {
            inputs.push(...parentStep.inputs);
        }

        // Add outputs from prior siblings
        if (parentStep?.substeps) {
            const currentIndex = parentStep.substeps.findIndex(s => s.id === step.id);
            if (currentIndex > 0) {
                for (let i = 0; i < currentIndex; i++) {
                    const sibling = parentStep.substeps[i];
                    inputs.push(...sibling.outputs);
                }
            }
        }

        return inputs;
    }, [step.id, parentStep, availableInputs]);

    // Get filtered tools based on available inputs
    const filteredTools = useMemo(() => {
        if (!stepAvailableInputs.length) return availableTools;

        return availableTools.filter(tool => {
            return tool.inputs.every((toolInput, index) => {
                const availableInput = stepAvailableInputs[index];
                return availableInput && doSchemasMatch(availableInput.schema, toolInput.schema);
            });
        });
    }, [availableTools, stepAvailableInputs]);

    // Get step status
    const stepStatus = useMemo(() => {
        return getStepStatus(stepWithMappings);
    }, [stepWithMappings]);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStep(stepWithMappings.id);
        onEditStep?.(stepWithMappings);
    };

    const handleAISuggestion = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement AI suggestion
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteStep?.(stepWithMappings.id);
    };

    const handleStepTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onStepTypeChange?.(stepWithMappings, e.target.value as 'atomic' | 'composite');
    };

    const handleToolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        const toolId = e.target.value;
        if (toolId) {
            onToolSelect?.(stepWithMappings, toolId);
        }
    };

    const handleInputSelect = (input: WorkflowVariable) => {
        onInputSelect?.(stepWithMappings, input);
    };

    const handleOutputSelect = (output: WorkflowVariable) => {
        onOutputSelect?.(stepWithMappings, output);
    };

    const handleAddSubstep = () => {
        // Find the last sibling to get its outputs
        const lastSibling = stepWithMappings.substeps?.[stepWithMappings.substeps.length - 1];
        const newStep = createNewStep(stepWithMappings, lastSibling, stepAvailableInputs);
        onAddSubstep(newStep);
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-[100px_200px_200px_1fr_100px] gap-4 items-start">
                {/* Status Column */}
                <div className="flex items-center">
                    <StepStatusDisplay status={stepStatus} />
                </div>

                {/* Name Column */}
                <div className="flex items-center gap-2 min-w-0">
                    <div style={{ marginLeft: `${depth * 20}px` }} className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{stepWithMappings.name}</h3>
                    </div>
                </div>

                {/* Type Selection Column */}
                <div className="flex items-center">
                    <select
                        value={stepWithMappings.type || 'atomic'}
                        onChange={handleStepTypeChange}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="atomic">Atomic</option>
                        <option value="composite">Composite</option>
                    </select>
                </div>

                {/* Additional Space Column */}
                <div className="flex items-center">
                    {stepWithMappings.type === 'atomic' ? (
                        <select
                            value={stepWithMappings.tool_id || ''}
                            onChange={handleToolSelect}
                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">Select a tool</option>
                            {filteredTools.map((tool) => (
                                <option key={tool.id} value={tool.id}>
                                    {tool.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <button
                            onClick={handleAddSubstep}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                            <Plus className="w-3 h-3" />
                            <span>Add Substep</span>
                        </button>
                    )}
                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-1 justify-end">
                    <button
                        onClick={handleEditClick}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <Pencil className="w-3 h-3" />
                    </button>
                    <button
                        onClick={handleAISuggestion}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <Sparkles className="w-3 h-3" />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Inputs and Outputs - Always shown */}
            <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Inputs</h4>
                    <VariableList
                        variables={stepWithMappings.inputs}
                        onSelect={handleInputSelect}
                        availableVariables={stepAvailableInputs}
                        isInput={true}
                    />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Outputs</h4>
                    <VariableList
                        variables={stepWithMappings.outputs}
                        onSelect={handleOutputSelect}
                        availableVariables={stepAvailableInputs}
                        isInput={false}
                    />
                </div>
            </div>

            {/* Substeps */}
            {stepWithMappings.type === 'composite' && (
                <div className="mt-2 space-y-2">
                    {stepWithMappings.substeps?.map((substep) => (
                        <Step
                            key={substep.id}
                            step={substep}
                            parentStep={stepWithMappings}
                            onAddSubstep={onAddSubstep}
                            onEditStep={onEditStep}
                            onDeleteStep={onDeleteStep}
                            onStepTypeChange={onStepTypeChange}
                            onToolSelect={onToolSelect}
                            onInputSelect={onInputSelect}
                            onOutputSelect={onOutputSelect}
                            onUpdateStep={onUpdateStep}
                            availableTools={availableTools}
                            availableInputs={stepAvailableInputs}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 