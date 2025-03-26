import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Agent, AgentStatus, AgentType } from '../types/state';
import EmailSearchAgent from '@/components/agents/email/EmailSearchAgent';

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
    const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

    const toggleAgentDetails = (agentId: string) => {
        setExpandedAgents(prev => {
            const next = new Set(prev);
            if (next.has(agentId)) {
                next.delete(agentId);
            } else {
                next.add(agentId);
            }
            return next;
        });
    };

    // Group agents by whether they were recently recommended (created in the last 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const recentAgents = agents.filter(agent =>
        new Date(agent.metadata?.createdAt || '') > fiveMinutesAgo
    );
    const existingAgents = agents.filter(agent =>
        new Date(agent.metadata?.createdAt || '') <= fiveMinutesAgo
    );

    const renderAgentCard = (agent: Agent, isRecent: boolean = false) => {
        const isExpanded = expandedAgents.has(agent.agent_id);
        const isProposed = agent.status === AgentStatus.IDLE;

        // Special handling for email agents
        if (agent.type === AgentType.GET_MESSAGES || agent.type === AgentType.LIST_LABELS) {
            return <EmailSearchAgent key={agent.agent_id} agent={agent} />;
        }

        return (
            <div
                key={agent.agent_id}
                className={`p-4 ${isRecent
                    ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'
                    } cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
            >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {agent.type}
                            </h4>
                            {isRecent && (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    New
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {agent.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Created: {new Date(agent.metadata.createdAt).toLocaleString()}
                            {agent.metadata.lastRunAt && (
                                <span className="ml-2">
                                    Last run: {new Date(agent.metadata.lastRunAt).toLocaleString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${agent.status === AgentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                        agent.status === AgentStatus.RUNNING ? 'bg-yellow-100 text-yellow-800' :
                            agent.status === AgentStatus.ERROR ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {agent.status}
                    </span>
                </div>

                {/* Input Parameters Section */}
                {agent.input_parameters && (
                    <div className="mt-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleAgentDetails(agent.agent_id);
                            }}
                            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUpIcon className="h-4 w-4" />
                                    Hide Parameters
                                </>
                            ) : (
                                <>
                                    <ChevronDownIcon className="h-4 w-4" />
                                    Show Parameters
                                </>
                            )}
                        </button>
                        {isExpanded && (
                            <div className="mt-2 p-3 bg-white/50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                                <div className="space-y-2">
                                    {Object.entries(agent.input_parameters).map(([key, value]) => (
                                        <div key={key} className="text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>{' '}
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Section */}
                {agent.status === AgentStatus.RUNNING && (
                    <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{agent.metadata.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${agent.metadata.progress}%` }}
                            />
                        </div>
                        {agent.metadata.estimatedCompletion && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Estimated completion: {new Date(agent.metadata.estimatedCompletion).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons for Proposed Agents */}
                {isProposed && (
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onApproveAgent?.(agent);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                        >
                            <CheckIcon className="h-4 w-4" />
                            Approve
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRejectAgent?.(agent);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            Reject
                        </button>
                    </div>
                )}
            </div>
        );
    };

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
                                    {recentAgents.map(agent => renderAgentCard(agent, true))}
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
                                    {existingAgents.map(agent => renderAgentCard(agent))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}; 