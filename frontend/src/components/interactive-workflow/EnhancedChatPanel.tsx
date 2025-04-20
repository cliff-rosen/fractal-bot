import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, MessageReaction, Asset, Tool } from './types';

interface EnhancedChatPanelProps {
    messages: ChatMessage[];
    inputMessage: string;
    isProcessing: boolean;
    onSendMessage: (message: string) => void;
    className?: string;
}

export const EnhancedChatPanel: React.FC<EnhancedChatPanelProps> = ({
    messages,
    inputMessage,
    isProcessing,
    onSendMessage,
    className = ''
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [localInput, setLocalInput] = useState(inputMessage);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Update local input when prop changes
    useEffect(() => {
        setLocalInput(inputMessage);
    }, [inputMessage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setLocalInput(value);

    };

    const handleSendMessage = () => {
        if (!localInput.trim()) return;
        onSendMessage(localInput);
        setLocalInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const renderMessage = (message: ChatMessage, isThread = false) => {
        const isUser = message.role === 'user';

        return (
            <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div
                    className={`relative max-w-[80%] rounded-lg p-4 ${isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                >
                    {/* Message Content */}
                    <div className="prose dark:prose-invert max-w-none">
                        {message.content}
                    </div>


                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                    <div key={message.id}>
                        {renderMessage(message)}
                        {selectedMessageId === message.id && message.thread && (
                            <div className="ml-8 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                {message.thread.map(threadMessage => renderMessage(threadMessage, true))}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="relative">
                    <textarea
                        value={localInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message... Use @ to mention assets or tools"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isProcessing || !localInput.trim()}
                        className={`absolute right-3 bottom-3 p-2 rounded-full ${isProcessing || !localInput.trim()
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}; 