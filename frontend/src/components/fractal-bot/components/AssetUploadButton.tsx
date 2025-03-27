import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Asset } from '../types/state';

interface AssetUploadButtonProps {
    onUploadAndAddAsset: (file: File) => Promise<void>;
    onRetrieveAsset: (assetId: string) => Promise<Asset | null>;
}

export function AssetUploadButton({ onUploadAndAddAsset, onRetrieveAsset }: AssetUploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await onUploadAndAddAsset(file);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.csv,.json,.png,.jpg,.jpeg,.gif,.mp3,.mp4,.wav"
            />
            <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100"
            >
                <Upload className="h-4 w-4" />
                <span>Upload Asset</span>
            </Button>
        </div>
    );
} 