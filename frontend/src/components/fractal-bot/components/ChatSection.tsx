import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
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
        if (typeof results === 'string') {
            return <div className="text-sm text-gray-600 dark:text-gray-300">{results}</div>;
        } else if (results.content && Array.isArray(results.content)) {
            return (
                <div className="space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">URL:</span>{' '}
                        <a href={results.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:underline">
                            {results.url}
                        </a>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Query:</span> {results.query}
                    </div>
                    <div className="mt-2 space-y-2">
                        {results.content.map((chunk: string, idx: number) => (
                            <div key={idx} className="p-2 bg-white/50 dark:bg-gray-600/50 rounded text-sm">
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
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full overflow-hidden">
            {/* Header */}
            <div className="flex-none flex items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scroll-smooth">
                {messages.map((message) => (
                    <div
                        key={message.message_id}
                        className={`flex ${message.role === MessageRole.USER ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-200 ${message.role === MessageRole.USER
                                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100'
                                }`}
                        >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

                            {/* Tool Use History Button */}
                            {message.metadata?.tool_use_history && (
                                <div className="mt-3 border-t border-gray-200/20 dark:border-gray-600 pt-3">
                                    <button
                                        onClick={() => toggleToolHistory(message.message_id)}
                                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                                        View Tool History
                                    </button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {message.metadata?.actionButtons && (
                                <div className="mt-2 flex gap-2">
                                    {message.metadata.actionButtons.map((button: ActionButton) => (
                                        <button
                                            key={button.label}
                                            className="px-3 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-colors"
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

                {/* Loading Indicator */}
                {isProcessing && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-100" />
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 dark:bg-gray-700/50 dark:text-gray-100 resize-none text-sm transition-all duration-200"
                        rows={1}
                    />
                    <button
                        onClick={() => onSendMessage(inputMessage)}
                        disabled={!inputMessage.trim() || isProcessing}
                        className="p-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <ArrowUpIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Tool History Modal */}
            {selectedMessage && selectedMessage.metadata?.tool_use_history && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slide-up">
                        <div className="flex-none p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Tool History
                                </h3>
                                <button
                                    onClick={closeToolHistory}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                {selectedMessage.metadata.tool_use_history.map((toolUse: any, index: number) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            {toolUse.tool.name === 'search' && (
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            )}
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {toolUse.tool.name.charAt(0).toUpperCase() + toolUse.tool.name.slice(1)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Iteration {toolUse.iteration}
                                            </div>
                                        </div>

                                        {toolUse.tool.parameters && (
                                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                <span className="font-medium">Query:</span>{' '}
                                                {toolUse.tool.parameters.query}
                                            </div>
                                        )}

                                        {toolUse.results && (
                                            <div>
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                    Results:
                                                </div>
                                                {formatToolResults(toolUse.results)}
                                            </div>
                                        )}
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