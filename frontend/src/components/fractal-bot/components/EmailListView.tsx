import React, { useState } from 'react';
import { Asset } from '../types/state';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';
import { getAssetContent } from '@/lib/utils/assets/assetUtils';

interface EmailMessage {
    id: string;
    date: string;
    from: string;
    to: string;
    subject: string;
    body: {
        html?: string;
        plain?: string;
    };
    snippet: string;
}

interface EmailListViewProps {
    asset: Asset;
}

export const EmailListView: React.FC<EmailListViewProps> = ({ asset }) => {
    const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const emailsPerPage = 10;

    const emails = getAssetContent(asset) as EmailMessage[];
    const totalPages = Math.ceil(emails.length / emailsPerPage);
    const currentEmails = emails.slice(
        currentPage * emailsPerPage,
        (currentPage + 1) * emailsPerPage
    );

    const formatDate = (dateString: string) => {
        return new Date(parseInt(dateString)).toLocaleString();
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
        <div className="space-y-4">
            {/* Email List */}
            <div className="space-y-2">
                {currentEmails.map((email) => (
                    <div
                        key={email.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-white dark:bg-gray-800"
                        onClick={() => handleEmailClick(email)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    {email.subject}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    From: {email.from}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Date: {formatDate(email.date)}
                                </p>
                            </div>
                            <ChevronRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Email Detail Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {selectedEmail.subject}
                                </h2>
                                <button
                                    onClick={handleCloseEmail}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <p><strong className="text-gray-900 dark:text-gray-100">From:</strong> {selectedEmail.from}</p>
                                <p><strong className="text-gray-900 dark:text-gray-100">To:</strong> {selectedEmail.to}</p>
                                <p><strong className="text-gray-900 dark:text-gray-100">Date:</strong> {formatDate(selectedEmail.date)}</p>
                            </div>
                            <div className="mt-6 prose dark:prose-invert max-w-none">
                                <div
                                    dangerouslySetInnerHTML={{ __html: getEmailBody(selectedEmail) }}
                                    className="text-gray-700 dark:text-gray-300 font-normal"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 