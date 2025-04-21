import React from 'react';
import { Journey, Agent } from './types';

interface AgentPanelProps {
    journey: Journey | null;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ journey }) => {
    if (!journey?.workflow?.steps.length) {
        return <div className="h-24 w-full flex items-center justify-center text-gray-500 dark:text-gray-400">No active agent</div>;
    }

    const currentStep = journey.workflow.steps[journey.workflow.currentStepIndex];
    if (!currentStep) {
        return <div className="h-24 w-full flex items-center justify-center text-gray-500 dark:text-gray-400">No active step</div>;
    }

    const agent: Agent = {
        id: currentStep.id,
        name: "Email Search Agent",
        description: "Searches through email archives for customer feedback",
        capabilities: [],
        tools: currentStep.tools,
        configuration: {},
        inputs: {
            searchTerms: ["feedback", "review", "opinion"],
            dateRange: "Q1 2024"
        },
        outputs: {
            emailList: [
                "Customer feedback on new feature - 2024-01-15",
                "Product review from enterprise client - 2024-02-03",
                "Support ticket feedback - 2024-03-10"
            ]
        }
    };

    return (
        <div className="h-24 w-full">
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {agent.name} • {currentStep.agentType}
                    </h2>
                    <span className={`text-xs px-1 py-0.5 rounded flex-shrink-0 ${currentStep.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        currentStep.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        }`}>
                        {currentStep.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 flex-1 text-[10px]">
                    <div className="flex flex-col p-1 border-r border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-center">Inputs</div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-0.5">
                                <span className="text-gray-500">🔍</span>
                                <span className="text-gray-900 dark:text-gray-100 truncate">Search Terms</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <span className="text-gray-500">📅</span>
                                <span className="text-gray-900 dark:text-gray-100 truncate">Q1 2024</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col p-1">
                        <div className="text-gray-500 dark:text-gray-400 text-center">Outputs</div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-0.5">
                                <span className="text-gray-500">📧</span>
                                <span className="text-gray-900 dark:text-gray-100 truncate">3 emails found</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 