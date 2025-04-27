import React from 'react';

interface StatusHistoryProps {
    messages: string[];
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ messages }) => {
    return (
        <div className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className="p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                        <p className="text-gray-900 dark:text-white">{message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusHistory; 