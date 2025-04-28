import { MissionProposal, Mission, Workflow, Status } from "../types";

interface DataFromLine {
    token: string | null;
    status: string | null;
    mission_proposal: MissionProposal | null;
    error: string | null;
    message: string | null;
}

export function getDataFromLine(line: string): DataFromLine {
    const res: DataFromLine = {
        token: null,
        status: null,
        mission_proposal: null,
        error: null
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
    } catch (e) {
        res.error = e instanceof Error ? e.message : String(e);
    }

    return res;
}

export function createMissionFromProposal(proposal: MissionProposal): Mission {
    const now = new Date().toISOString();

    // Create an empty workflow with initial state
    const emptyWorkflow: Workflow = {
        id: crypto.randomUUID(),
        name: `${proposal.title} Workflow`,
        description: `Workflow for ${proposal.title}`,
        status: 'pending' as Status,
        stages: [],
        assets: [],
        createdAt: now,
        updatedAt: now
    };

    return {
        id: crypto.randomUUID(),
        title: proposal.title,
        description: proposal.description,
        goal: proposal.goal,
        status: 'pending' as Status,
        workflow: emptyWorkflow,
        assets: [],
        inputs: proposal.inputs,
        outputs: proposal.outputs,
        success_criteria: proposal.success_criteria,
        createdAt: now,
        updatedAt: now
    };
} 