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
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {asset.name}
                        </h2>
                        {asset.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {asset.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`p-2 rounded-lg ${getAssetColor(asset.type)}`}>
                            {getAssetIcon(asset.type)}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.type}
                        </span>
                    </div>
                    <div className="mt-4 h-full">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}; 