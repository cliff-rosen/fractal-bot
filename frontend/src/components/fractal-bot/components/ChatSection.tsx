import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Message, ActionButton, ActionType, MessageRole } from '../types/state';

interface ChatSectionProps {
    messages: Message[];
    inputMessage: string;
    isProcessing: boolean;
    onSendMessage: (message: string) => void;
    onInputChange: (value: string) => void;
    onActionButtonClick?: (action: ActionType) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
    messages,
    inputMessage,
    isProcessing,
    onSendMessage,
    onInputChange,
    onActionButtonClick
}) => {
    const [expandedToolHistory, setExpandedToolHistory] = useState<Record<string, boolean>>({});
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage(inputMessage);
        }
    };

    const toggleToolHistory = (messageId: string) => {
        setSelectedMessageId(messageId);
    };

    const closeToolHistory = () => {
        setSelectedMessageId(null);
    };

    const formatToolResults = (results: any) => {
        if (!results) return 'No results';

        if (results.results && Array.isArray(results.results)) {
            // Handle search results
            return results.results.map((result: any, idx: number) => (
                <div key={idx} className="mt-2 p-2 bg-white/50 dark:bg-gray-600 rounded">
                    {result.title && (
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {result.title}
                            </a>
                        </div>
                    )}
                    {result.snippet && (
                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                            {result.snippet}
                        </div>
                    )}
                </div>
            ));
        } else if (results.content && Array.isArray(results.content)) {
            // Handle retrieve results
            return (
                <div className="space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">URL:</span>{' '}
                        <a href={results.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {results.url}
                        </a>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Query:</span> {results.query}
                    </div>
                    <div className="mt-2 space-y-2">
                        {results.content.map((chunk: string, idx: number) => (
                            <div key={idx} className="p-2 bg-white/50 dark:bg-gray-600 rounded text-sm">
                                {chunk}
                            </div>
                        ))}
                    </div>
                    {results.total_length && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Total content length: {results.total_length} characters
                        </div>
                    )}
                </div>
            );
        }

        return <pre className="text-xs overflow-x-auto">{JSON.stringify(results, null, 2)}</pre>;
    };

    const selectedMessage = selectedMessageId ? messages.find(m => m.message_id === selectedMessageId) : null;

    return (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full">
            <div className="flex-none flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((message) => (
                    <div
                        key={message.message_id}
                        className={`flex ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.role === MessageRole.USER
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>

                            {/* Tool Use History Button */}
                            {message.metadata?.tool_use_history && message.metadata.tool_use_history.length > 0 && (
                                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <button
                                        onClick={() => toggleToolHistory(message.message_id)}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        <MagnifyingGlassIcon className="h-4 w-4" />
                                        View Tool History
                                    </button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {message.metadata?.actionButtons && (
                                <div className="mt-2 flex gap-2">
                                    {message.metadata.actionButtons.map((button) => (
                                        <button
                                            key={button.label}
                                            className="px-3 py-1 bg-white/20 rounded-md text-sm hover:bg-white/30 transition-colors"
                                            onClick={() => onActionButtonClick?.(button.action)}
                                        >
                                            {button.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 resize-none"
                        rows={1}
                    />
                    <button
                        onClick={() => onSendMessage(inputMessage)}
                        disabled={!inputMessage.trim() || isProcessing}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* Tool History Modal */}
            {selectedMessage && selectedMessage.metadata?.tool_use_history && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Tool History
                                </h3>
                                <button
                                    onClick={closeToolHistory}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-6">
                                {selectedMessage.metadata.tool_use_history.map((toolUse, index) => (
                                    <div
                                        key={index}
                                        className="bg-white/50 dark:bg-gray-700 rounded-lg p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            {toolUse.tool.name === 'search' && (
                                                <MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />
                                            )}
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {toolUse.tool.name.charAt(0).toUpperCase() + toolUse.tool.name.slice(1)}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Iteration {toolUse.iteration}
                                            </div>
                                        </div>

                                        {toolUse.tool.parameters && (
                                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                <span className="font-medium">Query:</span>{' '}
                                                {toolUse.tool.parameters.query}
                                            </div>
                                        )}

                                        <div>
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                Results:
                                            </div>
                                            {formatToolResults(toolUse.results)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 