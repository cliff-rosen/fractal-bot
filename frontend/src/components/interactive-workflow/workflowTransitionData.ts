import { Journey, Workflow, ChatMessage, JourneyState, ActionButton } from './types';

export interface TransitionStep {
    state: JourneyState;
    description: string;
    chatMessages: ChatMessage[];
    journey?: Partial<Journey>;
    workflow?: Partial<Workflow>;
}

export interface UISnapshot {
    timestamp: string;
    description: string;
    journey: Journey | null;
    isRightPanelOpen: boolean;
}

export const uiSnapshots: UISnapshot[] = [
    {
        timestamp: new Date().toISOString(),
        description: "Initial state - journey created but no goal defined",
        journey: {
            id: "j_2024_03_15_000",
            title: "",
            goal: "",
            state: "AWAITING_GOAL",
            creator: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            deliverable: {
                id: "del_000",
                name: "",
                description: "",
                type: "report"
            },
            messages: [],
            workflow: null,
            workspace: {
                id: "ws_2024_03_15_000",
                name: "",
                description: "",
                assets: [],
                tools: [],
                settings: {}
            }
        },
        isRightPanelOpen: true
    },
    {
        timestamp: new Date().toISOString(),
        description: "User sends initial message",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            state: "WORKFLOW_IN_PROGRESS",
            creator: "Sarah Chen",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ["feedback", "analysis", "quarterly-review"],
            deliverable: {
                id: "del_001",
                name: "Q1 Client Feedback Report",
                description: "Analysis report of client feedback from Q1 2024",
                type: "report"
            },
            messages: [
                {
                    id: 'msg_001',
                    role: 'user',
                    content: 'I need to analyze our client feedback from Q1 2024',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'goal'
                    }
                },
                {
                    id: 'msg_002',
                    role: 'assistant',
                    content: 'I will help you analyze the Q1 client feedback. I have created a journey card for this analysis - you can review it in the task area.',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'status'
                    }
                },
                {
                    id: 'msg_003',
                    role: 'assistant',
                    content: 'I have designed a workflow with these steps: 1) Collect emails, 2) Extract feedback, 3) Analyze themes, 4) Generate report. Would you like to start?',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'confirmation',
                        actionButtons: [
                            {
                                id: 'accept-workflow',
                                label: 'Accept Workflow',
                                type: 'primary',
                                action: 'accept_workflow'
                            },
                            {
                                id: 'reject-workflow',
                                label: 'Reject Workflow',
                                type: 'danger',
                                action: 'reject_workflow'
                            }
                        ]
                    }
                }
            ],
            workflow: {
                id: "wf_2024_03_15_001",
                status: "running",
                currentStepIndex: 0,
                steps: [
                    {
                        id: "step_001",
                        name: "Initial Analysis",
                        description: "Analyzing the initial requirements",
                        status: "running",
                        agentType: "analyzer",
                        level: 0,
                        tools: ["requirement_analyzer"],
                        inputs: {},
                        outputs: {},
                        progress: 30,
                        assets: [{
                            id: "asset_001",
                            title: "Initial Requirements Analysis",
                            type: "intermediate",
                            format: "text",
                            content: "Analyzing the initial requirements to determine the scope and approach...",
                            metadata: {
                                creator: "System",
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                tags: ["analysis", "requirements"],
                                stepId: "step_001",
                                toolId: "requirement_analyzer"
                            },
                            version: 1,
                            history: []
                        }]
                    }
                ],
                assets: [{
                    id: "asset_001",
                    title: "Initial Requirements Analysis",
                    type: "intermediate",
                    format: "text",
                    content: "Analyzing the initial requirements to determine the scope and approach...",
                    metadata: {
                        creator: "System",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        tags: ["analysis", "requirements"],
                        stepId: "step_001",
                        toolId: "requirement_analyzer"
                    },
                    version: 1,
                    history: []
                }]
            },
            workspace: {
                id: "ws_2024_03_15_001",
                name: "Q1 Feedback Analysis Workspace",
                description: "Workspace for analyzing Q1 2024 client feedback",
                assets: [
                    {
                        id: "asset_001",
                        title: "Initial Requirements Analysis",
                        type: "intermediate",
                        format: "text",
                        content: "Analyzing the initial requirements to determine the scope and approach...",
                        metadata: {
                            creator: "System",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            tags: ["analysis", "requirements"],
                            stepId: "step_001",
                            toolId: "requirement_analyzer"
                        },
                        version: 1,
                        history: []
                    }
                ],
                tools: [
                    {
                        id: "requirement_analyzer",
                        name: "Requirement Analyzer",
                        description: "Analyzes requirements to determine scope and approach",
                        category: "analysis",
                        capabilities: ["text_analysis", "scope_determination"],
                        parameters: [],
                        icon: "🔍"
                    }
                ],
                settings: {}
            }
        },
        isRightPanelOpen: true
    },
    {
        timestamp: new Date().toISOString(),
        description: "Initial state with proposed and accepted workflow",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            state: "AWAITING_WORKFLOW_DESIGN",
            creator: "Sarah Chen",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ["feedback", "analysis", "quarterly-review"],
            deliverable: {
                id: "del_001",
                name: "Q1 Client Feedback Report",
                description: "Analysis report of client feedback from Q1 2024",
                type: "report"
            },
            messages: [
                {
                    id: 'msg_001',
                    role: 'user',
                    content: 'I need to analyze our client feedback from Q1 2024',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'goal'
                    }
                },
                {
                    id: 'msg_002',
                    role: 'assistant',
                    content: 'I will help you analyze the Q1 client feedback. I have created a journey card for this analysis - you can review it in the task area.',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'status'
                    }
                },
                {
                    id: 'msg_003',
                    role: 'assistant',
                    content: 'Great! I see you\'ve accepted the journey. Would you like me to propose a workflow for analyzing the client feedback?',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'suggestion',
                        actionButtons: [
                            {
                                id: 'start-design',
                                label: 'Start Workflow Design',
                                type: 'primary',
                                action: 'start_design'
                            }
                        ]
                    }
                }
            ],
            workflow: null,
            workspace: {
                id: "ws_2024_03_15_001",
                name: "Q1 Feedback Analysis Workspace",
                description: "Workspace for analyzing Q1 2024 client feedback",
                assets: [],
                tools: [],
                settings: {}
            }
        },
        isRightPanelOpen: true
    },
    {
        timestamp: new Date().toISOString(),
        description: "System proposes a journey card",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            state: "AWAITING_GOAL",
            creator: "Sarah Chen",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ["feedback", "analysis", "quarterly-review"],
            deliverable: {
                id: "del_001",
                name: "Q1 Client Feedback Report",
                description: "Analysis report of client feedback from Q1 2024",
                type: "report"
            },
            messages: [
                {
                    id: 'msg_001',
                    role: 'user',
                    content: 'I need to analyze our client feedback from Q1 2024',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'goal'
                    }
                },
                {
                    id: 'msg_002',
                    role: 'assistant',
                    content: 'I will help you analyze the Q1 client feedback. I have created a journey card for this analysis - you can review it in the task area.',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'status'
                    }
                }
            ],
            workflow: null,
            workspace: {
                id: "ws_2024_03_15_001",
                name: "",
                description: "",
                assets: [],
                tools: [],
                settings: {}
            }
        },
        isRightPanelOpen: true
    }
]; 