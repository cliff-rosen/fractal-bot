import { Journey, Workflow, ChatMessage } from './types';

export type JourneyState =
    | 'AWAITING_JOURNEY'
    | 'AWAITING_WORKFLOW_DESIGN'
    | 'AWAITING_WORKFLOW_START'
    | 'WORKFLOW_IN_PROGRESS'
    | 'WORKFLOW_COMPLETE';

export interface TransitionStep {
    state: JourneyState;
    description: string;
    chatMessages: ChatMessage[];
    journey?: Partial<Journey>;
    workflow?: Partial<Workflow>;
}

export const transitionSteps: TransitionStep[] = [
    {
        state: 'AWAITING_JOURNEY',
        description: 'Initial state when user first engages',
        chatMessages: [
            {
                id: 'msg_001',
                role: 'user',
                content: 'I need to analyze our client feedback from Q1 2024',
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'goal',
                    phase: 'setup'
                }
            },
            {
                id: 'msg_002',
                role: 'assistant',
                content: 'I will help you analyze the Q1 client feedback. I have created a journey card for this analysis - you can review it in the task area.',
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'status',
                    phase: 'setup'
                }
            }
        ],
        journey: {
            status: 'draft',
            title: 'Q1 Client Feedback Analysis',
            goal: 'Analyze customer feedback from Q1 2024 to identify key themes and sentiment'
        }
    },
    {
        state: 'AWAITING_WORKFLOW_DESIGN',
        description: 'Entered after journey card acceptance',
        chatMessages: [
            {
                id: 'msg_003',
                role: 'assistant',
                content: 'Would you like me to propose a workflow for analyzing the client feedback?',
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'suggestion',
                    phase: 'setup'
                }
            }
        ],
        journey: {
            status: 'active'
        }
    },
    {
        state: 'AWAITING_WORKFLOW_START',
        description: 'Workflow is accepted but execution has not begun',
        chatMessages: [
            {
                id: 'msg_004',
                role: 'assistant',
                content: 'I have designed a workflow with these steps: 1) Collect emails, 2) Extract feedback, 3) Analyze themes, 4) Generate report. Would you like to start?',
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'confirmation',
                    phase: 'setup'
                }
            }
        ],
        workflow: {
            status: 'pending',
            currentStepIndex: 0
        }
    },
    {
        state: 'WORKFLOW_IN_PROGRESS',
        description: 'Active workflow execution state',
        chatMessages: [
            {
                id: 'msg_005',
                role: 'assistant',
                content: 'Starting Step 1: Collecting emails from Q1 2024...',
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'status',
                    phase: 'execution'
                }
            }
        ],
        workflow: {
            status: 'running',
            currentStepIndex: 0
        }
    },
    {
        state: 'WORKFLOW_COMPLETE',
        description: 'All workflow steps have been completed',
        chatMessages: [
            {
                id: 'msg_006',
                role: 'assistant',
                content: 'Workflow completed! The final report has been generated and saved to your assets.',
                timestamp: new Date().toISOString(),
                metadata: {
                    type: 'result',
                    phase: 'execution'
                }
            }
        ],
        journey: {
            status: 'completed'
        },
        workflow: {
            status: 'completed'
        }
    }
];

export interface UISnapshot {
    timestamp: string;
    description: string;
    journey: Journey | null;
    workflow: Workflow | null;
    messages: ChatMessage[];
    isRightPanelOpen: boolean;
}

export const uiSnapshots: UISnapshot[] = [
    {
        timestamp: "2024-03-15T10:30:00Z",
        description: "User initiates a new journey",
        journey: null,
        workflow: null,
        messages: [
            {
                id: "msg_001",
                role: "user",
                content: "I need to analyze our client feedback from Q1 2024",
                timestamp: "2024-03-15T10:30:00Z",
                metadata: {
                    type: "goal",
                    phase: "setup"
                }
            }
        ],
        isRightPanelOpen: false
    },
    {
        timestamp: "2024-03-15T10:30:05Z",
        description: "System proposes a journey card",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            status: "draft",
            creator: "Sarah Chen",
            createdAt: "2024-03-15T10:30:00Z",
            updatedAt: "2024-03-15T10:30:00Z",
            tags: ["feedback", "analysis", "quarterly-review"],
            deliverableType: "report"
        },
        workflow: null,
        messages: [
            {
                id: "msg_001",
                role: "user",
                content: "I need to analyze our client feedback from Q1 2024",
                timestamp: "2024-03-15T10:30:00Z",
                metadata: {
                    type: "goal",
                    phase: "setup"
                }
            },
            {
                id: "msg_002",
                role: "assistant",
                content: "I'll help you analyze the Q1 client feedback. I've created a journey card for this analysis - you can review it in the task area.",
                timestamp: "2024-03-15T10:30:05Z",
                metadata: {
                    type: "status",
                    phase: "setup"
                }
            }
        ],
        isRightPanelOpen: true
    },
    {
        timestamp: "2024-03-15T10:30:15Z",
        description: "User accepts the journey card",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            status: "active",
            creator: "Sarah Chen",
            createdAt: "2024-03-15T10:30:00Z",
            updatedAt: "2024-03-15T10:30:15Z",
            tags: ["feedback", "analysis", "quarterly-review"],
            deliverableType: "report"
        },
        workflow: null,
        messages: [
            {
                id: "msg_001",
                role: "user",
                content: "I need to analyze our client feedback from Q1 2024",
                timestamp: "2024-03-15T10:30:00Z",
                metadata: {
                    type: "goal",
                    phase: "setup"
                }
            },
            {
                id: "msg_002",
                role: "assistant",
                content: "I'll help you analyze the Q1 client feedback. I've created a journey card for this analysis - you can review it in the task area.",
                timestamp: "2024-03-15T10:30:05Z",
                metadata: {
                    type: "status",
                    phase: "setup"
                }
            },
            {
                id: "msg_003",
                role: "assistant",
                content: "Journey card accepted. Would you like me to propose a workflow for analyzing the client feedback?",
                timestamp: "2024-03-15T10:30:15Z",
                metadata: {
                    type: "suggestion",
                    phase: "setup"
                }
            }
        ],
        isRightPanelOpen: true
    },
    {
        timestamp: "2024-03-15T10:30:20Z",
        description: "System starts designing the workflow",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            status: "active",
            creator: "Sarah Chen",
            createdAt: "2024-03-15T10:30:00Z",
            updatedAt: "2024-03-15T10:30:20Z",
            tags: ["feedback", "analysis", "quarterly-review"],
            deliverableType: "report"
        },
        workflow: null,
        messages: [
            {
                id: "msg_001",
                role: "user",
                content: "I need to analyze our client feedback from Q1 2024",
                timestamp: "2024-03-15T10:30:00Z",
                metadata: {
                    type: "goal",
                    phase: "setup"
                }
            },
            {
                id: "msg_002",
                role: "assistant",
                content: "I'll help you analyze the Q1 client feedback. I've created a journey card for this analysis - you can review it in the task area.",
                timestamp: "2024-03-15T10:30:05Z",
                metadata: {
                    type: "status",
                    phase: "setup"
                }
            },
            {
                id: "msg_003",
                role: "assistant",
                content: "Journey card accepted. Would you like me to propose a workflow for analyzing the client feedback?",
                timestamp: "2024-03-15T10:30:15Z",
                metadata: {
                    type: "suggestion",
                    phase: "setup"
                }
            },
            {
                id: "msg_004",
                role: "assistant",
                content: "I am designing a workflow now...",
                timestamp: "2024-03-15T10:30:20Z",
                metadata: {
                    type: "status",
                    phase: "setup"
                }
            }
        ],
        isRightPanelOpen: true
    },
    {
        timestamp: "2024-03-15T10:30:25Z",
        description: "System proposes a workflow",
        journey: {
            id: "j_2024_03_15_001",
            title: "Q1 Client Feedback Analysis",
            goal: "Analyze customer feedback from Q1 2024 to identify key themes and sentiment",
            status: "active",
            creator: "Sarah Chen",
            createdAt: "2024-03-15T10:30:00Z",
            updatedAt: "2024-03-15T10:30:15Z",
            tags: ["feedback", "analysis", "quarterly-review"],
            deliverableType: "report"
        },
        workflow: {
            id: "wf_2024_03_15_001",
            journeyId: "j_2024_03_15_001",
            status: "pending",
            currentStepIndex: 0,
            steps: [
                {
                    id: "step_001",
                    name: "Email Collection",
                    description: "Search and collect client emails from Q1 2024",
                    status: "pending",
                    agentType: "email_search",
                    level: 0,
                    tools: ["email_search"],
                    inputs: {
                        dateRange: "2024-01-01/2024-03-31",
                        searchTerms: ["feedback", "review", "opinion"]
                    },
                    outputs: {},
                    progress: 0,
                    assets: [],
                    isExpanded: true
                },
                {
                    id: "step_002",
                    name: "Feedback Extraction",
                    description: "Extract feedback points from collected emails",
                    status: "pending",
                    agentType: "feedback_extractor",
                    level: 0,
                    tools: ["feedback_extractor"],
                    inputs: {
                        format: "structured_json",
                        fields: ["sentiment", "topic", "urgency"]
                    },
                    outputs: {},
                    progress: 0,
                    assets: [],
                    isExpanded: false
                }
            ],
            assets: []
        },
        messages: [
            {
                id: "msg_001",
                role: "user",
                content: "I need to analyze our client feedback from Q1 2024",
                timestamp: "2024-03-15T10:30:00Z",
                metadata: {
                    type: "goal",
                    phase: "setup"
                }
            },
            {
                id: "msg_002",
                role: "assistant",
                content: "I'll help you analyze the Q1 client feedback. I've created a journey card for this analysis - you can review it in the task area.",
                timestamp: "2024-03-15T10:30:05Z",
                metadata: {
                    type: "status",
                    phase: "setup"
                }
            },
            {
                id: "msg_003",
                role: "assistant",
                content: "Journey card accepted. Would you like me to propose a workflow for analyzing the client feedback?",
                timestamp: "2024-03-15T10:30:15Z",
                metadata: {
                    type: "suggestion",
                    phase: "setup"
                }
            },
            {
                id: "msg_004",
                role: "assistant",
                content: "I am designing a workflow now...",
                timestamp: "2024-03-15T10:30:20Z",
                metadata: {
                    type: "status",
                    phase: "setup"
                }
            },
            {
                id: "msg_005",
                role: "assistant",
                content: "I've designed a workflow with these steps: 1) Collect emails, 2) Extract feedback, 3) Analyze themes, 4) Generate report. Would you like to start?",
                timestamp: "2024-03-15T10:30:25Z",
                metadata: {
                    type: "confirmation",
                    phase: "setup"
                }
            }
        ],
        isRightPanelOpen: true
    }
]; 