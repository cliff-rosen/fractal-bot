import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Asset } from '../types/state';
import { getAssetIcon, getAssetColor } from '../utils/assetUtils.tsx';
import { EmailListView } from '../EmailListView';

interface AssetModalProps {
    asset: Asset;
    onClose: () => void;
    isOpen: boolean;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose, isOpen }) => {
    const modalRef = useRef<HTMLDivElement>(null);

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
            case 'email_list':
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
                    <div className="absolute right-0 top-0 pr-4 pt-4">
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
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            <div className="mt-2">{renderContent()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}; 