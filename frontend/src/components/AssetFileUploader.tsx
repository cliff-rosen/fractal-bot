import React, { useState } from 'react';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import { assetApi } from '../lib/api/assetApi';
import { Asset } from '../types/asset';

interface AssetFileUploaderProps {
    onAssetUpload?: (asset: Asset) => void;
    onAssetDelete?: (assetId: string) => void;
    selectedAssetId?: string;
    onAssetSelect?: (assetId: string) => void;
}

export const AssetFileUploader: React.FC<AssetFileUploaderProps> = ({
    onAssetUpload,
    onAssetDelete,
    selectedAssetId,
    onAssetSelect
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);

    // Load assets on component mount
    React.useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const fileAssets = await assetApi.getAssets('FILE');
            setAssets(fileAssets);
        } catch (err) {
            setError('Failed to load assets');
            console.error('Error loading assets:', err);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const asset = await assetApi.uploadFileAsset(file);
            setAssets(prev => [...prev, asset]);
            onAssetUpload?.(asset);
        } catch (err) {
            setError('Failed to upload file');
            console.error('Error uploading file:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleFileDelete = async (assetId: string) => {
        try {
            await assetApi.deleteAsset(assetId);
            setAssets(prev => prev.filter(asset => asset.asset_id !== assetId));
            onAssetDelete?.(assetId);
        } catch (err) {
            setError('Failed to delete asset');
            console.error('Error deleting asset:', err);
        }
    };

    const handleFileDownload = async (assetId: string, fileName: string) => {
        try {
            const blob = await assetApi.downloadFileAsset(assetId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download file');
            console.error('Error downloading file:', err);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">File Assets</h3>
                <label className="cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 
                                  hover:text-blue-700 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 
                                  rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </div>
                </label>
            </div>

            {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {assets.map(asset => (
                    <div
                        key={asset.asset_id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
                            ${selectedAssetId === asset.asset_id
                                ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-600'
                                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        onClick={() => onAssetSelect?.(asset.asset_id)}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {asset.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize(asset.content.size)} • {asset.content.mime_type}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileDownload(asset.asset_id, asset.name);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:text-gray-500 
                                         dark:hover:text-blue-400 rounded-full hover:bg-gray-100 
                                         dark:hover:bg-gray-700"
                                title="Download file"
                            >
                                <Download className="w-4 h-4" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileDelete(asset.asset_id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 
                                         dark:hover:text-red-400 rounded-full hover:bg-gray-100 
                                         dark:hover:bg-gray-700"
                                title="Delete file"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {assets.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No files uploaded yet
                    </div>
                )}
            </div>
        </div>
    );
}; 