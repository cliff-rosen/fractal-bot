import { Journey, Workflow, ChatMessage, JourneyState, ActionButton, WorkflowStep } from './types';

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
                objectType: "proposed_journey",
                object: {
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
                        objectType: "proposed_journey",
                        object: {} as Journey
                    }
                }
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
                }
            ],
            workflow: null,
            workspace: {
                id: "ws_2024_03_15_001",
                objectType: "none",
                object: null
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
                objectType: "proposed_journey",
                object: {
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
                    messages: [],
                    workflow: null,
                    workspace: {
                        id: "ws_2024_03_15_001",
                        objectType: "proposed_journey",
                        object: {} as Journey
                    }
                }
            }
        },
        isRightPanelOpen: true
    },
    {
        timestamp: new Date().toISOString(),
        description: "Journey accepted, designing workflow",
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
                    content: 'Great! I\'ll now design a workflow to help analyze the Q1 client feedback. This will involve collecting and processing the feedback data, analyzing key themes, and generating a comprehensive report.',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'status'
                    }
                }
            ],
            workflow: null,
            workspace: {
                id: "ws_2024_03_15_002",
                objectType: "proposed_workflow",
                object: {
                    id: "wf_2024_03_15_001",
                    status: "pending",
                    currentStepIndex: 0,
                    steps: [],
                    assets: []
                },
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
                    },
                    {
                        id: 'edit-workflow',
                        label: 'Edit Workflow',
                        type: 'secondary',
                        action: 'edit_workflow'
                    }
                ]
            }
        },
        isRightPanelOpen: true
    },
    {
        timestamp: new Date().toISOString(),
        description: "Workflow presented",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            state: "AWAITING_WORKFLOW_START",
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
                    content: 'Great! I\'ll now design a workflow to help analyze the Q1 client feedback. This will involve collecting and processing the feedback data, analyzing key themes, and generating a comprehensive report.',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'status'
                    }
                },
                {
                    id: 'msg_004',
                    role: 'assistant',
                    content: 'I have designed a workflow with these steps:\n\n1. Collect emails\n2. Extract feedback\n3. Analyze themes\n4. Generate report\n\nWould you like to start?',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        type: 'confirmation'
                    }
                }
            ],
            workflow: null,
            workspace: {
                id: "ws_2024_03_15_002",
                objectType: "proposed_workflow",
                object: {
                    id: "wf_2024_03_15_001",
                    status: "pending",
                    currentStepIndex: 0,
                    steps: [
                        {
                            id: "step_001",
                            name: "Collect Emails",
                            description: "Gathering all relevant customer feedback emails from Q1 2024",
                            status: "pending",
                            agentType: "collector",
                            level: 0,
                            tools: ["email_search"],
                            inputs: {
                                dateRange: "2024-01-01/2024-03-31",
                                searchTerms: ["feedback", "review", "opinion"]
                            },
                            outputs: {},
                            progress: 0,
                            assets: []
                        },
                        {
                            id: "step_002",
                            name: "Extract Feedback",
                            description: "Processing emails to extract relevant feedback content",
                            status: "pending",
                            agentType: "extractor",
                            level: 0,
                            tools: ["text_extractor"],
                            inputs: {},
                            outputs: {},
                            progress: 0,
                            assets: []
                        },
                        {
                            id: "step_003",
                            name: "Analyze Themes",
                            description: "Identifying key themes and sentiment from the feedback",
                            status: "pending",
                            agentType: "analyzer",
                            level: 0,
                            tools: ["theme_analyzer", "sentiment_analyzer"],
                            inputs: {},
                            outputs: {},
                            progress: 0,
                            assets: []
                        },
                        {
                            id: "step_004",
                            name: "Generate Report",
                            description: "Creating a comprehensive analysis report",
                            status: "pending",
                            agentType: "reporter",
                            level: 0,
                            tools: ["report_generator"],
                            inputs: {},
                            outputs: {},
                            progress: 0,
                            assets: []
                        }
                    ],
                    assets: []
                },
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
                    },
                    {
                        id: 'edit-workflow',
                        label: 'Edit Workflow',
                        type: 'secondary',
                        action: 'edit_workflow'
                    }
                ]
            }
        },
        isRightPanelOpen: true
    }
]; 