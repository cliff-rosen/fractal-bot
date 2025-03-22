import React, { useState, useRef } from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';
import { Asset, AssetType, AssetStatus } from '../types/state';
import { AssetModal } from './AssetModal';

interface AssetsSectionProps {
    assets: Asset[];
    onAssetClick?: (asset: Asset) => void;
}

export const getAssetColor = (type: AssetType, metadata?: { type?: string; name?: string; timestamp?: string; tags?: string[];[key: string]: any }) => {
    // Get file extension and type
    const fileType = metadata?.type || '';
    const fileName = metadata?.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    // Images
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        return 'from-rose-400/20 to-pink-400/20 dark:from-rose-500/20 dark:to-pink-500/20';
    }

    // Code files
    if (fileType.startsWith('text/') || ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'cs', 'go', 'rs', 'php'].includes(extension)) {
        return 'from-blue-400/20 to-indigo-400/20 dark:from-blue-500/20 dark:to-indigo-500/20';
    }

    // Document files
    if (fileType === 'application/pdf' || ['doc', 'docx', 'pdf', 'txt', 'md', 'rtf'].includes(extension)) {
        return 'from-emerald-400/20 to-teal-400/20 dark:from-emerald-500/20 dark:to-teal-500/20';
    }

    // Default
    return 'from-gray-400/20 to-gray-500/20 dark:from-gray-500/20 dark:to-gray-600/20';
};

export const getAssetIcon = (type: AssetType, metadata?: { type?: string; name?: string; timestamp?: string; tags?: string[];[key: string]: any }) => {
    const fileType = metadata?.type || '';
    const fileName = metadata?.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    // Specific overrides
    if (type === AssetType.DATA) {
        return (
            <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
        );
    }

    if (type === AssetType.PDF) {
        return (
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        );
    }

    if (type === AssetType.SPREADSHEET) {
        return (
            <svg className="w-6 h-6 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        );
    }

    // File type based icons
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        return (
            <svg className="w-6 h-6 text-rose-500 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
    }

    if (fileType === 'application/pdf' || extension === 'pdf') {
        return (
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        );
    }

    if (['xls', 'xlsx', 'csv'].includes(extension)) {
        return (
            <svg className="w-6 h-6 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        );
    }

    if (fileType.startsWith('text/') || ['txt', 'md', 'rtf'].includes(extension)) {
        return (
            <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    }

    // Default
    return (
        <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
};

export const AssetsSection: React.FC<AssetsSectionProps> = ({ assets, onAssetClick }) => {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [previewAsset, setPreviewAsset] = useState<{ asset: Asset; position: { x: number; y: number } } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMouseEnter = (asset: Asset, event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPreviewAsset({
            asset,
            position: {
                x: rect.right,
                y: rect.top
            }
        });
    };

    const handleMouseLeave = () => {
        setPreviewAsset(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onAssetClick) {
            // Create a temporary asset from the file
            const tempAsset: Asset = {
                asset_id: Date.now().toString(),
                type: AssetType.TEXT, // Default to text, should be determined by file type
                content: file,
                metadata: {
                    status: AssetStatus.PROPOSED,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    creator: 'user',
                    tags: [],
                    agent_associations: [],
                    version: 1
                }
            };
            onAssetClick(tempAsset);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                <FolderIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Assets</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {assets.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No assets available
                    </div>
                ) : (
                    <div className="space-y-2">
                        {assets.map((asset) => (
                            <div
                                key={asset.asset_id}
                                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                onClick={() => onAssetClick?.(asset)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                            {asset.type}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Created: {new Date(asset.metadata.createdAt).toLocaleString()}
                                        </p>
                                        {asset.metadata.tags.length > 0 && (
                                            <div className="flex gap-1 mt-1">
                                                {asset.metadata.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${asset.metadata.status === AssetStatus.READY ? 'bg-green-100 text-green-800' :
                                            asset.metadata.status === AssetStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                                asset.metadata.status === AssetStatus.ERROR ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {asset.metadata.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Asset Preview */}
            {previewAsset && (
                <div
                    className="fixed z-[100] w-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200/50 dark:border-gray-700/50 
                              animate-fade-in pointer-events-none backdrop-blur-sm"
                    style={{
                        left: `${previewAsset.position.x + 16}px`,
                        top: `${previewAsset.position.y}px`,
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}
                >
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getAssetColor(previewAsset.asset.type, previewAsset.asset.metadata)}`}>
                                {getAssetIcon(previewAsset.asset.type, previewAsset.asset.metadata)}
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                                    {previewAsset.asset.type}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {previewAsset.asset.type} • {new Date(previewAsset.asset.metadata.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <pre className="whitespace-pre-wrap break-all">
                                {typeof previewAsset.asset.content === 'string'
                                    ? previewAsset.asset.content
                                    : JSON.stringify(previewAsset.asset.content, null, 2)
                                }
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Asset Modal */}
            {selectedAsset && (
                <AssetModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                />
            )}
        </div>
    );
}; 