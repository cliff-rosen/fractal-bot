import React, { useState } from 'react';
import { Asset } from './types/state';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';
import { EmailMessage } from '@/types/email';

interface EmailListViewProps {
    asset: Asset;
}

export const EmailListView: React.FC<EmailListViewProps> = ({ asset }) => {
    const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const emailsPerPage = 10;

    const emails = asset.content as EmailMessage[] || [];
    const totalPages = Math.ceil(emails.length / emailsPerPage);
    const currentEmails = emails.slice(
        currentPage * emailsPerPage,
        (currentPage + 1) * emailsPerPage
    );

    const formatDate = (dateString: string) => {
        try {
            // Try parsing as timestamp first
            const timestamp = parseInt(dateString);
            if (!isNaN(timestamp)) {
                return new Date(timestamp).toLocaleString();
            }
            // If not a timestamp, try parsing as ISO string
            return new Date(dateString).toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const getEmailBody = (email: EmailMessage) => {
        if (email.body.html) {
            return DOMPurify.sanitize(email.body.html, {
                ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'table', 'thead', 'tbody', 'tr', 'td', 'th',
                    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'div', 'span', 'img'],
                ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'style']
            });
        }
        return email.body.plain || email.snippet;
    };

    const handleEmailClick = (email: EmailMessage) => {
        setSelectedEmail(email);
    };

    const handleCloseEmail = () => {
        setSelectedEmail(null);
    };

    return (
        <div className="flex h-full bg-white dark:bg-gray-900">
            {/* Email List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Emails</h2>
                    <div className="space-y-2">
                        {currentEmails.map((email) => (
                            <div
                                key={email.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedEmail?.id === email.id
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
                                    }`}
                                onClick={() => handleEmailClick(email)}
                            >
                                <div className="font-medium truncate">
                                    {email.subject}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {email.from}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(email.date)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-600 dark:text-gray-300"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-600 dark:text-gray-300"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto">
                {selectedEmail ? (
                    <div className="p-6">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                {selectedEmail.subject}
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                <div>From: {selectedEmail.from}</div>
                                <div>To: {selectedEmail.to}</div>
                                <div>Date: {formatDate(selectedEmail.date)}</div>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                            {selectedEmail.body.html ? (
                                <div
                                    className="email-content"
                                    dangerouslySetInnerHTML={{ __html: getEmailBody(selectedEmail) }}
                                />
                            ) : (
                                <pre className="whitespace-pre-wrap font-sans">
                                    {getEmailBody(selectedEmail)}
                                </pre>
                            )}
                        </div>
                        <button
                            onClick={handleCloseEmail}
                            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                            Back to list
                        </button>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Select an email to view its contents
                    </div>
                )}
            </div>
        </div>
    );
}; 