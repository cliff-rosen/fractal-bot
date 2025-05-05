import { MissionProposal, Mission, Workflow, Status, StageGeneratorResult, Stage, Step, WorkflowVariable, StepStatus, StepConfigState, StepExecutionState, VariableMapping, doSchemasMatch, Tool, Schema } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface DataFromLine {
    token: string | null;
    status: string | null;
    mission_proposal: MissionProposal | null;
    error: string | null;
    message: string | null;
    stage_generator: StageGeneratorResult | null;
}

export function getDataFromLine(line: string): DataFromLine {
    const res: DataFromLine = {
        token: null,
        status: null,
        mission_proposal: null,
        error: null,
        message: null,
        stage_generator: null
    };

    if (!line.startsWith('data: ')) {
        return res;
    }

    const jsonStr = line.slice(6);

    try {
        const data = JSON.parse(jsonStr);
        if (data.token) {
            res.token = data.token;
        }
        if (data.status) {
            res.status = data.status;
        }
        if (data.mission_proposal) {
            res.mission_proposal = data.mission_proposal;
        }
        if (data.message) {
            res.message = data.message;
        }
        if (data.error) {
            res.error = data.error;
        }
        if (data.stage_generator) {
            res.stage_generator = data.stage_generator;
        }
    } catch (e) {
        res.error = e instanceof Error ? e.message : String(e);
    }

    return res;
}

export function createMissionFromProposal(proposal: MissionProposal): Mission {
    const now = new Date().toISOString();

    // Create an empty workflow with initial state
    const emptyWorkflow: Workflow = {
        id: uuidv4(),
        name: `${proposal.title} Workflow`,
        description: `Workflow for ${proposal.title}`,
        status: 'pending' as Status,
        stages: [],
        inputs: [],
        outputs: [],
        createdAt: now,
        updatedAt: now
    };

    console.log(proposal);

    return {
        id: uuidv4(),
        title: proposal.title,
        goal: proposal.goal,
        status: 'ready' as Status,
        workflow: emptyWorkflow,
        inputs: proposal.inputs,
        resources: proposal.resources || [],
        outputs: proposal.outputs,
        success_criteria: proposal.success_criteria,
        selectedTools: proposal.selectedTools || [],
        createdAt: now,
        updatedAt: now
    };
}

// Helper function to get available inputs for a step or workflow
export function getAvailableInputs(stepOrWorkflow: Step | Workflow, parentStep?: Step): WorkflowVariable[] {
    const availableInputs: WorkflowVariable[] = [];

    if ('stages' in stepOrWorkflow) {
        // This is a Workflow
        // Add workflow inputs
        if (stepOrWorkflow.inputs) {
            availableInputs.push(...stepOrWorkflow.inputs);
        }

        // Add outputs from previous stages
        const currentStageId = (stepOrWorkflow as any).currentStageId;
        if (currentStageId) {
            const currentStageIndex = stepOrWorkflow.stages.findIndex(s => s.id === currentStageId);
            if (currentStageIndex > 0) {
                stepOrWorkflow.stages.slice(0, currentStageIndex).forEach(prevStage => {
                    prevStage.steps.forEach(step => {
                        if (step.outputs) {
                            availableInputs.push(...step.outputs);
                        }
                    });
                });
            }
        }
    } else {
        // This is a Step
        // Add parent inputs
        if (parentStep) {
            availableInputs.push(...parentStep.inputs);
        }

        // Add outputs from prior siblings
        if (parentStep?.substeps) {
            const currentIndex = parentStep.substeps.findIndex(s => s.id === stepOrWorkflow.id);
            if (currentIndex > 0) {
                for (let i = 0; i < currentIndex; i++) {
                    const sibling = parentStep.substeps[i];
                    availableInputs.push(...sibling.outputs);
                }
            }
        }
    }

    return availableInputs;
}

export function getFilteredInputs(
    availableInputs: WorkflowVariable[],
    availableTools: Tool[]
): WorkflowVariable[] {
    // Get all required input types from tools
    const requiredInputTypes = availableTools.flatMap(tool =>
        tool.inputs.map(input => ({
            type: input.schema.type,
            is_array: input.schema.is_array,
            fields: input.schema.fields,
            required: input.required
        }))
    );

    // Filter inputs that match any of the required types
    return availableInputs.filter(input => {
        return requiredInputTypes.some(requiredType => {
            // Basic type matching
            if (input.schema.type !== requiredType.type) {
                return false;
            }

            // Array type matching
            if (input.schema.is_array !== requiredType.is_array) {
                return false;
            }

            // For object types, check fields
            if (input.schema.type === 'object' && requiredType.type === 'object') {
                if (!input.schema.fields || !requiredType.fields) {
                    return false;
                }

                // Check if all required fields exist in the input
                for (const [fieldName, requiredField] of Object.entries(requiredType.fields)) {
                    const inputField = input.schema.fields[fieldName];
                    if (!inputField) {
                        return false;
                    }

                    // Recursively check field types
                    if (inputField.type !== requiredField.type ||
                        inputField.is_array !== requiredField.is_array) {
                        return false;
                    }
                }
            }

            // Check if the input is required
            if (requiredType.required && !input.required) {
                return false;
            }

            return true;
        });
    });
}

export function getStepStatus(step: Step): StepStatus {
    // Initialize mappings if they don't exist
    const stepWithMappings = {
        ...step,
        inputMappings: step.inputMappings || [],
        outputMappings: step.outputMappings || []
    };

    // For atomic steps
    if (stepWithMappings.type === 'atomic') {
        // Check if tool is assigned
        if (!stepWithMappings.tool_id) {
            return 'unresolved';
        }

        // Check if all required inputs are mapped
        const requiredInputs = stepWithMappings.inputs.filter(input => input.required);
        const mappedInputs = stepWithMappings.inputMappings.map(mapping => mapping.targetVariable.variable_id);
        const allRequiredInputsMapped = requiredInputs.every(input =>
            mappedInputs.includes(input.variable_id)
        );

        if (!allRequiredInputsMapped) {
            return 'unresolved';
        }

        // Check if all mapped inputs are ready
        const allMappedInputsReady = stepWithMappings.inputMappings.every(mapping =>
            mapping.sourceVariable.status === 'ready'
        );

        if (!allMappedInputsReady) {
            return 'pending_inputs_ready';
        }

        // Return current status if all checks pass
        return stepWithMappings.status;
    }

    // For composite steps
    if (stepWithMappings.type === 'composite') {
        // Check if there are at least 2 substeps
        if (!stepWithMappings.substeps || stepWithMappings.substeps.length < 2) {
            return 'unresolved';
        }

        // Check if all substeps are resolved
        const allSubstepsResolved = stepWithMappings.substeps.every(substep =>
            getStepStatus(substep) !== 'unresolved'
        );

        if (!allSubstepsResolved) {
            return 'unresolved';
        }

        // Check if all substeps are ready
        const allSubstepsReady = stepWithMappings.substeps.every(substep =>
            getStepStatus(substep) === 'ready'
        );

        if (!allSubstepsReady) {
            return 'pending_inputs_ready';
        }

        // Return current status if all checks pass
        return stepWithMappings.status;
    }

    // Default to unresolved for unknown step types
    return 'unresolved';
}

// Helper function to validate input mapping
export function validateInputMapping(
    sourceVariable: WorkflowVariable,
    targetVariable: WorkflowVariable
): boolean {
    const match = doSchemasMatch(sourceVariable.schema, targetVariable.schema);
    return match.isMatch;
}

// Helper function to validate output mapping
export function validateOutputMapping(
    sourceVariable: WorkflowVariable,
    targetVariable: WorkflowVariable,
    isParentOutput: boolean
): boolean {
    // For parent outputs, we need exact schema match
    if (isParentOutput) {
        const match = doSchemasMatch(sourceVariable.schema, targetVariable.schema);
        return match.isMatch;
    }

    // For intermediate outputs, we just need compatible types
    return sourceVariable.schema.type === targetVariable.schema.type;
} 