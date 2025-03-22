import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Message, ActionButton, ActionType } from '../types/state';

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
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage(inputMessage);
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.message_id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
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
        </div>
    );
}; 