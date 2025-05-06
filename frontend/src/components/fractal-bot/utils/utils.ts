import { MissionProposal, Mission, Workflow, Status, StageGeneratorResult, Stage, Step, WorkflowVariable, StepStatus, StepConfigState, StepExecutionState, VariableMapping, doSchemasMatch, Tool, Schema, ParameterTarget } from "../types";
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
        childVariables: [],
        inputMappings: [],
        outputMappings: [],
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
export function getAvailableInputs(workflow: Workflow, step?: Step): WorkflowVariable[] {
    if (!workflow || !workflow.childVariables) {
        return [];
    }

    const availableInputs: WorkflowVariable[] = [];

    // Add workflow inputs from childVariables
    const workflowInputs = workflow.childVariables.filter(v =>
        v.io_type === 'input'
    );
    availableInputs.push(...workflowInputs);

    // Add outputs from previous stages
    if (workflow.stages) {
        const previousStages = workflow.stages.slice(0, workflow.stages.findIndex(s =>
            s.steps.some(st => st.id === step?.id)
        ));
        previousStages.forEach(stage => {
            if (stage.childVariables) {
                const stageOutputs = stage.childVariables.filter(v =>
                    v.io_type === 'output'
                );
                availableInputs.push(...stageOutputs);
            }
        });
    }

    // If this is a step, add outputs from prior siblings
    if (step) {
        // Find the stage containing this step
        const findStage = (stages: Stage[]): Stage | undefined => {
            for (const stage of stages) {
                // Check if step is directly in this stage
                if (stage.steps.some(s => s.id === step.id)) {
                    return stage;
                }
                // Check if step is in any substeps
                const findInSubsteps = (steps: Step[]): boolean => {
                    for (const s of steps) {
                        if (s.id === step.id) return true;
                        if (s.substeps && findInSubsteps(s.substeps)) return true;
                    }
                    return false;
                };
                if (findInSubsteps(stage.steps)) {
                    return stage;
                }
            }
            return undefined;
        };

        const stage = findStage(workflow.stages || []);
        if (stage) {
            // Find all prior siblings in the stage
            const findPriorSiblings = (steps: Step[], targetId: string): Step[] => {
                const priorSiblings: Step[] = [];
                for (const s of steps) {
                    if (s.id === targetId) break;
                    priorSiblings.push(s);
                    if (s.substeps) {
                        priorSiblings.push(...findPriorSiblings(s.substeps, targetId));
                    }
                }
                return priorSiblings;
            };

            const priorSiblings = findPriorSiblings(stage.steps, step.id);
            priorSiblings.forEach(sibling => {
                if (sibling.childVariables) {
                    const siblingOutputs = sibling.childVariables.filter(v =>
                        v.io_type === 'output'
                    );
                    availableInputs.push(...siblingOutputs);
                }
            });
        }
    }

    return availableInputs;
}

// Helper function to get filtered inputs based on available tools
export function getFilteredInputs(
    availableInputs: WorkflowVariable[],
    tools: Tool[]
): WorkflowVariable[] {
    // Get all required input types from tools
    const requiredTypes = tools.flatMap(tool =>
        tool.inputs.map(input => ({
            type: input.schema.type,
            required: input.required
        }))
    );

    // Filter inputs that match any of the required types
    return availableInputs.filter(input => {
        return requiredTypes.some(required =>
            required.type === input.schema.type
        );
    });
}

// Helper function to get step status
export function getStepStatus(step: Step): StepStatus {
    // For atomic steps
    if (step.type === 'atomic') {
        // Check if tool is assigned
        if (!step.tool_id) {
            return 'unresolved';
        }

        // Check if all required inputs are mapped
        const requiredInputs = step.inputMappings.filter(m =>
            m.target.type === 'parameter' &&
            (m.target as ParameterTarget).required
        );
        const allRequiredInputsMapped = requiredInputs.every(mapping => mapping.sourceVariableId);

        if (!allRequiredInputsMapped) {
            return 'unresolved';
        }

        // Check if all mapped inputs are ready
        const allMappedInputsReady = step.inputMappings.every(mapping => {
            const sourceVariable = step.childVariables.find(v => v.variable_id === mapping.sourceVariableId);
            return sourceVariable?.status === 'ready';
        });

        if (!allMappedInputsReady) {
            return 'pending_inputs_ready';
        }

        // Return current status if all checks pass
        return step.status;
    }

    // For composite steps
    if (step.type === 'composite') {
        // Check if there are at least 2 substeps
        if (!step.substeps || step.substeps.length < 2) {
            return 'unresolved';
        }

        // Check if all substeps are resolved
        const allSubstepsResolved = step.substeps.every(substep =>
            getStepStatus(substep) !== 'unresolved'
        );

        if (!allSubstepsResolved) {
            return 'unresolved';
        }

        // Check if all substeps are ready
        const allSubstepsReady = step.substeps.every(substep =>
            getStepStatus(substep) === 'ready'
        );

        if (!allSubstepsReady) {
            return 'pending_inputs_ready';
        }

        // Return current status if all checks pass
        return step.status;
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