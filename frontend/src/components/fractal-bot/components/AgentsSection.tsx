import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Agent, AgentStatus } from '../types/state';

interface AgentsSectionProps {
    agents: Agent[];
    onAgentClick?: (agent: Agent) => void;
}

export const AgentsSection: React.FC<AgentsSectionProps> = ({
    agents,
    onAgentClick
}) => {
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
                        {agents.map((agent) => (
                            <div
                                key={agent.agent_id}
                                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                onClick={() => onAgentClick?.(agent)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                            {agent.type}
                                        </h4>
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 