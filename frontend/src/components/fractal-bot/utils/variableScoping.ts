import { Step, Stage, Workflow, WorkflowVariable } from '../types/index';

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

    // Always include workflow-level variables
    availableOutputs.push(...workflow.childVariables);

    // For steps and substeps, include parent stage variables
    if (!('steps' in task)) { // This is a Step or Substep
        const parentStage = workflow.stages.find(s => s.steps.some(st => st.id === task.id));
        if (parentStage) {
            availableOutputs.push(...parentStage.childVariables);
        }
    }

    // For substeps, include parent step variables
    if (!('steps' in task) && task.isSubstep) {
        const parentStage = workflow.stages.find(s => s.steps.some(st => st.id === task.id));
        const parentStep = parentStage?.steps.find(s => s.substeps?.some(st => st.id === task.id));
        if (parentStep) {
            availableOutputs.push(...parentStep.childVariables);
        }
    }

    return availableOutputs;
} 