import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Agent } from '../types/state';
import { AgentCard } from './AgentCard';

interface AgentsSectionProps {
    agents: Agent[];
    onAgentClick?: (agent: Agent) => void;
    onApproveAgent?: (agent: Agent) => void;
    onRejectAgent?: (agent: Agent) => void;
}

export const AgentsSection: React.FC<AgentsSectionProps> = ({
    agents,
    onAgentClick,
    onApproveAgent,
    onRejectAgent
}) => {
    // Group agents by whether they were recently recommended (created in the last 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const recentAgents = agents.filter(agent =>
        new Date(agent.metadata?.createdAt || '') > fiveMinutesAgo
    );
    const existingAgents = agents.filter(agent =>
        new Date(agent.metadata?.createdAt || '') <= fiveMinutesAgo
    );

    return (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                <SparklesIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Agents</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {agents.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No active agents
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Recently Recommended Agents */}
                        {recentAgents.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                    Recently Recommended
                                </h4>
                                <div className="space-y-4">
                                    {recentAgents.map(agent => (
                                        <AgentCard
                                            key={agent.agent_id}
                                            agent={agent}
                                            isRecent={true}
                                            onAgentClick={onAgentClick}
                                            onApproveAgent={onApproveAgent}
                                            onRejectAgent={onRejectAgent}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Existing Agents */}
                        {existingAgents.length > 0 && (
                            <div>
                                {recentAgents.length > 0 && (
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                        Existing Agents
                                    </h4>
                                )}
                                <div className="space-y-4">
                                    {existingAgents.map(agent => (
                                        <AgentCard
                                            key={agent.agent_id}
                                            agent={agent}
                                            onAgentClick={onAgentClick}
                                            onApproveAgent={onApproveAgent}
                                            onRejectAgent={onRejectAgent}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}; 