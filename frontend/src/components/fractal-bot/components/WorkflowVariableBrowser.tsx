import React from 'react';
import { ArrowRight, Database } from 'lucide-react';
import type { WorkflowVariable, Stage, Step, Mission, VariableMapping } from '../types';
import { useFractalBot } from '@/context/FractalBotContext';

interface WorkflowVariableBrowserProps {
    className?: string;
    stages: Stage[];
    mission: Mission;
}

const getVariableIcon = (io_type: string) => {
    switch (io_type) {
        case 'input':
            return <ArrowRight className="w-4 h-4 rotate-180" />;
        case 'output':
            return <ArrowRight className="w-4 h-4" />;
        default:
            return <Database className="w-4 h-4" />;
    }
};

// Helper function to get all ancestor steps of a step
const getAncestors = (targetStep: Step, stages: Stage[]): Step[] => {
    const ancestors: Step[] = [];
    let currentStep = targetStep;

    // Find the stage containing this step
    const stage = stages.find(s => s.steps.some(st => st.id === currentStep.id));
    if (!stage) return ancestors;

    // Find the step in the stage
    const findStepInStage = (steps: Step[], targetId: string): Step | undefined => {
        for (const s of steps) {
            if (s.id === targetId) return s;
            if (s.substeps) {
                const found = findStepInStage(s.substeps, targetId);
                if (found) return found;
            }
        }
        return undefined;
    };

    // Traverse up the tree
    while (currentStep) {
        const parentStep = findStepInStage(stage.steps, currentStep.id);
        if (!parentStep) break;

        // Find the parent of this step
        const findParent = (steps: Step[], targetId: string): Step | undefined => {
            for (const s of steps) {
                if (s.substeps?.some(sub => sub.id === targetId)) return s;
                if (s.substeps) {
                    const found = findParent(s.substeps, targetId);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const parent = findParent(stage.steps, currentStep.id);
        if (!parent) break;

        ancestors.push(parent);
        currentStep = parent;
    }

    return ancestors;
};

// Helper function to get outputs from prior siblings of a step
const getPriorSiblingOutputs = (targetStep: Step, stages: Stage[]): WorkflowVariable[] => {
    const outputs: WorkflowVariable[] = [];
    const stage = stages.find(s => s.steps.some(st => st.id === targetStep.id));
    if (!stage) return outputs;

    const findStepInStage = (steps: Step[], targetId: string): { step: Step, siblings: Step[] } | undefined => {
        for (const s of steps) {
            if (s.id === targetId) return { step: s, siblings: steps };
            if (s.substeps) {
                const found = findStepInStage(s.substeps, targetId);
                if (found) return found;
            }
        }
        return undefined;
    };

    const result = findStepInStage(stage.steps, targetStep.id);
    if (!result) return outputs;

    const { step, siblings } = result;
    const currentIndex = siblings.findIndex(s => s.id === step.id);

    // Get outputs from prior siblings
    for (let i = 0; i < currentIndex; i++) {
        const sibling = siblings[i];
        // Only include outputs that weren't mapped to parent outputs
        const newOutputs = sibling.outputMappings
            .filter(mapping => !mapping.isParentOutput)
            .map(mapping => mapping.targetVariable);
        outputs.push(...newOutputs);
    }

    return outputs;
};

// Helper function to get available inputs for a step
const getAvailableInputs = (step: Step, stages: Stage[], mission: Mission): WorkflowVariable[] => {
    const availableInputs: WorkflowVariable[] = [];

    // Always include all mission inputs
    availableInputs.push(...mission.inputs);

    // Get outputs from all ancestors
    const ancestors = getAncestors(step, stages);
    ancestors.forEach(ancestor => {
        // Only include outputs that weren't mapped to parent outputs
        const ancestorOutputs = ancestor.outputMappings
            .filter(mapping => !mapping.isParentOutput)
            .map(mapping => mapping.targetVariable);
        availableInputs.push(...ancestorOutputs);
    });

    // Get outputs from prior siblings of all ancestors
    ancestors.forEach(ancestor => {
        const priorSiblingOutputs = getPriorSiblingOutputs(ancestor, stages);
        availableInputs.push(...priorSiblingOutputs);
    });

    // Get outputs from prior siblings of the current step
    const priorSiblingOutputs = getPriorSiblingOutputs(step, stages);
    availableInputs.push(...priorSiblingOutputs);

    return availableInputs;
};

const WorkflowVariableBrowser: React.FC<WorkflowVariableBrowserProps> = ({ className = '', stages, mission }) => {
    const { state } = useFractalBot();
    const { selectedStepId } = state;

    // Find the selected step
    const selectedStep = stages.flatMap(stage => stage.steps).find(step => step.id === selectedStepId);

    // Get available inputs for the selected step
    const availableInputs = selectedStep ?
        getAvailableInputs(selectedStep, stages, mission) :
        [];

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="px-4 py-3 border-b dark:border-gray-700">
                <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow Variables</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {selectedStep ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">Available Inputs</h4>
                            <div className="space-y-2">
                                {availableInputs.map((variable) => (
                                    <div
                                        key={variable.variable_id}
                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        {getVariableIcon('input')}
                                        <span className="text-sm">{variable.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">Input Mappings</h4>
                            <div className="space-y-2">
                                {selectedStep.inputMappings.map((mapping) => (
                                    <div
                                        key={`${mapping.sourceVariable.variable_id}-${mapping.targetVariable.variable_id}`}
                                        className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{mapping.sourceVariable.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">→ {mapping.targetVariable.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">Output Mappings</h4>
                            <div className="space-y-2">
                                {selectedStep.outputMappings.map((mapping) => (
                                    <div
                                        key={`${mapping.sourceVariable.variable_id}-${mapping.targetVariable.variable_id}`}
                                        className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{mapping.sourceVariable.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                → {mapping.targetVariable.name}
                                                {mapping.isParentOutput && " (parent output)"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">Mission Inputs</h4>
                            <div className="space-y-2">
                                {mission.inputs.map((variable) => (
                                    <div
                                        key={variable.variable_id}
                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        {getVariableIcon('input')}
                                        <span className="text-sm">{variable.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs text-gray-500 dark:text-gray-400">Mission Outputs</h4>
                            <div className="space-y-2">
                                {mission.outputs.map((variable) => (
                                    <div
                                        key={variable.variable_id}
                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        {getVariableIcon('output')}
                                        <span className="text-sm">{variable.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkflowVariableBrowser; 