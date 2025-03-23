import React from 'react';
import { Asset, AssetStatus } from '../types/state';
import { getAssetIcon, getAssetColor } from './AssetsSection';

interface AssetModalProps {
    asset: Asset;
    onClose: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
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
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getAssetColor(asset.type)}`}>
                            {getAssetIcon(asset.type)}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.type}
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 