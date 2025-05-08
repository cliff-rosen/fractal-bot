import { Step, Stage, Workflow, WorkflowVariable } from '../../../types';

/**
 * Determines all available output variables that a task (stage, step, or substep) can map to
 * based on the workflow hierarchy and scoping rules.
 * 
 * @param task The task (stage, step, or substep) to find available outputs for
 * @param workflow The parent workflow containing the task
 * @returns Array of available WorkflowVariables that can be mapped to
 */
export function getAvailableOutputVariables(task: Step | Stage, workflow: Workflow): WorkflowVariable[] {
    const availableOutputs: WorkflowVariable[] = [];

    // Helper to check if a variable is already mapped to a parent output
    const isMappedToParentOutput = (variable: WorkflowVariable, parent: Step | Stage): boolean => {
        return parent.outputMappings.some(m =>
            m.isParentOutput && m.target.type === 'variable' && m.target.variableId === variable.variable_id
        );
    };

    // Helper to get variables from a level that aren't mapped to parent outputs
    const getUnmappedVariables = (variables: WorkflowVariable[], parent?: Step | Stage): WorkflowVariable[] => {
        if (!parent) return variables;
        return variables.filter(v => !isMappedToParentOutput(v, parent));
    };

    // Always include workflow-level variables
    availableOutputs.push(...workflow.childVariables);

    // For stages
    if ('steps' in task) { // This is a Stage
        // Can map to workflow variables (already added above)
        // Can create new stage-level variables
        return availableOutputs;
    }

    // For steps
    if (!task.isSubstep) { // This is a Step
        // Can map to workflow variables (already added above)
        // Can map to parent stage variables
        const parentStage = workflow.stages.find(s => s.steps.some(st => st.id === task.id));
        if (parentStage) {
            availableOutputs.push(...getUnmappedVariables(parentStage.childVariables, parentStage));
        }
        return availableOutputs;
    }

    // For substeps
    // Can map to workflow variables (already added above)
    // Can map to parent stage variables
    const parentStage = workflow.stages.find(s => s.steps.some(st => st.id === task.id));
    if (parentStage) {
        availableOutputs.push(...getUnmappedVariables(parentStage.childVariables, parentStage));
    }

    // Can map to parent step variables
    const parentStep = parentStage?.steps.find(s => s.substeps?.some(st => st.id === task.id));
    if (parentStep) {
        availableOutputs.push(...getUnmappedVariables(parentStep.childVariables, parentStep));
    }

    return availableOutputs;
} 