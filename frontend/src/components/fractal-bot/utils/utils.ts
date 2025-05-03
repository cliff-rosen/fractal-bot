import { MissionProposal, Mission, Workflow, Status, StageGeneratorResult, Stage, Step } from "../types";
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
        assets: [],
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
        assets: [],
        inputs: proposal.inputs,
        resources: proposal.resources || [],
        outputs: proposal.outputs,
        success_criteria: proposal.success_criteria,
        selectedTools: proposal.selectedTools || [],
        createdAt: now,
        updatedAt: now
    };
}

export function getAvailableInputs(workflow: Workflow, currentStageId: string): string[] {
    const inputs = new Set<string>();

    // Add workflow inputs if they exist
    if (workflow.inputs) {
        workflow.inputs.forEach(input => inputs.add(input));
    }

    // Add outputs from previous steps
    const currentStageIndex = workflow.stages.findIndex(s => s.id === currentStageId);
    if (currentStageIndex > 0) {
        workflow.stages.slice(0, currentStageIndex).forEach(prevStage => {
            prevStage.steps.forEach(step => {
                if (step.outputs) {
                    step.outputs.forEach(output => inputs.add(output));
                }
            });
        });
    }

    return Array.from(inputs);
}

export function getFilteredInputs(availableInputs: string[], toolInputTypes: string[]): string[] {
    // TODO: Implement proper type matching logic based on your schema types
    // This is a placeholder - you'll need to implement the actual type matching
    return availableInputs.filter(input => {
        return toolInputTypes.some(type => type === 'string'); // Simplified for now
    });
} 