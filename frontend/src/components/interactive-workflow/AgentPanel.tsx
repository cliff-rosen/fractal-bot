import React from 'react';
import { Journey, Agent } from './types';

interface AgentPanelProps {
    journey: Journey | null;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ journey }) => {
    if (!journey?.workflow?.steps.length) {
        return <div className="text-gray-500 dark:text-gray-400">No active agent</div>;
    }

    const currentStep = journey.workflow.steps[journey.workflow.currentStepIndex];
    if (!currentStep) {
        return <div className="text-gray-500 dark:text-gray-400">No active step</div>;
    }

    // Get the agent for the current step
    const agent: Agent = {
        id: currentStep.id,
        name: currentStep.name,
        description: currentStep.description,
        capabilities: [],
        tools: currentStep.tools,
        configuration: {},
        inputs: {
            feedbackData: "Q1 2024 customer feedback emails",
            scope: "Full analysis of customer satisfaction",
            timePeriod: "Q1 2024"
        },
        outputs: {
            themes: ["Product quality", "Customer service", "Delivery times"],
            sentiment: "Generally positive with some concerns",
            recommendations: ["Improve delivery tracking", "Enhance customer support response time"]
        }
    };

    return (
        <div className="p-2">
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-2">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {agent.name}
                    </h2>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${currentStep.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        currentStep.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        }`}>
                        {currentStep.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col items-center">
                        <div className="text-gray-500 dark:text-gray-400 mb-1">Inputs</div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500">📧</span>
                                <span className="text-gray-900 dark:text-gray-100">Feedback</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500">🎯</span>
                                <span className="text-gray-900 dark:text-gray-100">Scope</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500">📅</span>
                                <span className="text-gray-900 dark:text-gray-100">Q1 2024</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-gray-500 dark:text-gray-400 mb-1">Outputs</div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500">🎨</span>
                                <span className="text-gray-900 dark:text-gray-100">Themes</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500">😊</span>
                                <span className="text-gray-900 dark:text-gray-100">Sentiment</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500">💡</span>
                                <span className="text-gray-900 dark:text-gray-100">Recs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 