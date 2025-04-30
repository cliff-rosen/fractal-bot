import React from 'react';

interface StatusHistoryProps {
    messages: string[];
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ messages }) => {
    // Get last 5 messages
    const recentMessages = messages.slice(-5).reverse();

    return (
        <div className="h-full overflow-y-auto p-4">
            <div className="space-y-3">
                {recentMessages.map((message, index) => {
                    // Extract status type from message
                    const isError = message.toLowerCase().includes('error');
                    const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('complete');
                    const isWarning = message.toLowerCase().includes('warning');

                    return (
                        <div
                            key={index}
                            className={`p-3 rounded-lg border ${isError
                                ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                : isSuccess
                                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                    : isWarning
                                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0">
                                    {isError ? (
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : isSuccess ? (
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : isWarning ? (
                                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${isError
                                        ? 'text-red-700 dark:text-red-300'
                                        : isSuccess
                                            ? 'text-green-700 dark:text-green-300'
                                            : isWarning
                                                ? 'text-amber-700 dark:text-amber-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusHistory; 