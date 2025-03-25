import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DocumentIcon, DocumentDuplicateIcon, CheckCircleIcon, XCircleIcon, CloudIcon, ServerIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Asset, AssetStatus, AssetType } from '../types/state';
import { getAssetIcon } from '../utils/assetUtils.tsx';
import { EmailListView } from '../EmailListView';

interface AssetModalProps {
    asset: Asset;
    onClose: () => void;
    isOpen: boolean;
    onSaveToDb?: (asset: Asset) => Promise<void>;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose, isOpen, onSaveToDb }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const getStatusIcon = (status: AssetStatus) => {
        switch (status) {
            case AssetStatus.READY:
                return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
            case AssetStatus.PENDING:
                return <DocumentDuplicateIcon className="h-4 w-4 text-yellow-500" />;
            case AssetStatus.ERROR:
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            default:
                return <DocumentIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    const handleSaveToDb = async () => {
        if (onSaveToDb) {
            await onSaveToDb(asset);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (asset.type) {
            case AssetType.EMAIL_LIST:
                return <EmailListView asset={asset} />;
            default:
                return (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2)}
                        </pre>
                    </div>
                );
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900/75 transition-opacity" onClick={onClose} />
                <div
                    ref={modalRef}
                    className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6"
                >
                    {/* Close button */}
                    <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                        <button
                            type="button"
                            className="rounded-md bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Asset Header */}
                    <div className="pr-8">
                        <div className="mb-4 flex items-center gap-3">
                            {/* Type Icon */}
                            <div className="flex-shrink-0 w-5">
                                {getAssetIcon(asset.type)}
                            </div>

                            {/* Name */}
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">
                                {asset.name || 'Unnamed Asset'}
                            </h2>

                            {/* Status Icons and Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {getStatusIcon(asset.status)}
                                {asset.is_in_db ? (
                                    <ServerIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <>
                                        <CloudIcon className="h-4 w-4 text-gray-400" />
                                        {onSaveToDb && (
                                            <button
                                                onClick={handleSaveToDb}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4" />
                                                Save to DB
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {asset.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {asset.description}
                        </p>
                    )}

                    {/* Content */}
                    <div className="mt-2">{renderContent()}</div>
                </div>
            </div>
        </div>,
        document.body
    );
}; 