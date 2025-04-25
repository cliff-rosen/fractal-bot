import React from 'react';
import { FileText, Image, Database, Code } from 'lucide-react';
import type { Asset } from '../types';

interface AssetsProps {
    className?: string;
    assets: Asset[];
}

const getAssetIcon = (type: string) => {
    switch (type) {
        case 'document':
            return <FileText className="w-4 h-4" />;
        case 'dataset':
            return <Database className="w-4 h-4" />;
        case 'image':
            return <Image className="w-4 h-4" />;
        default:
            return <Code className="w-4 h-4" />;
    }
};

export function Assets({ className = '', assets }: AssetsProps) {
    return (
        <div className={`flex flex-col h-full bg-white/95 ${className}`}>
            <div className="px-4 py-3 border-b">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {assets.map((asset) => (
                        <div
                            key={asset.id}
                            className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-600">
                                {getAssetIcon(asset.type)}
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-700">{asset.name}</div>
                                <div className="text-xs text-gray-500">{asset.type}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Assets; 