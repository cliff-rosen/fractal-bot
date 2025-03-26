import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Agent, AgentStatus, AgentType } from '../types/state';
import EmailSearchAgent from '@/components/agents/email/EmailSearchAgent';

interface AgentCardProps {
    agent: Agent;
    isRecent?: boolean;
    onAgentClick?: (agent: Agent) => void;
    onApproveAgent?: (agent: Agent) => void;
    onRejectAgent?: (agent: Agent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
    agent,
    isRecent = false,
    onAgentClick,
    onApproveAgent,
    onRejectAgent
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
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
            <div className="flex justify-between items-start">
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
            <div className="mt-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
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

            {/* Progress Section */}
            {agent.metadata.progress !== undefined && (
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