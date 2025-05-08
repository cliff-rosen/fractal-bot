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

    // If it's a stage, we're done - can only map to workflow vars
    if ('steps' in task) {
        return availableOutputs;
    }

    // Helper to find a step's parent stage and step by recursively searching
    function findParents(currentStep: Step): { parentStage: Stage | undefined, parentStep: Step | undefined } {
        for (const stage of workflow.stages) {
            // Recursive helper to search through step tree
            function findInStepTree(step: Step): { parentStage: Stage | undefined, parentStep: Step | undefined } | null {
                if (step.substeps) {
                    for (const substep of step.substeps) {
                        if (substep.id === currentStep.id) {
                            return { parentStage: stage, parentStep: step };
                        }
                        const result = findInStepTree(substep);
                        if (result) return result;
                    }
                }
                return null;
            }

            // Search in each step of the stage
            for (const step of stage.steps) {
                if (step.id === currentStep.id) {
                    return { parentStage: stage, parentStep: undefined };
                }
                const result = findInStepTree(step);
                if (result) return result;
            }
        }
        return { parentStage: undefined, parentStep: undefined };
    }

    // For steps/substeps, recursively collect all ancestor variables
    function collectAncestorVariables(currentStep: Step): void {
        const { parentStage, parentStep } = findParents(currentStep);

        if (parentStage) {
            availableOutputs.push(...parentStage.childVariables);
        }

        if (parentStep) {
            availableOutputs.push(...parentStep.childVariables);
            // Recursively collect from parent step's ancestors
            collectAncestorVariables(parentStep);
        }
    }

    // Start collecting from the current step
    collectAncestorVariables(task);

    return availableOutputs;
} 