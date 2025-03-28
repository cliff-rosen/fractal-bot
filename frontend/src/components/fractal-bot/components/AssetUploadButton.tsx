import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Asset } from '../types/state';
import { AddAssetModal } from './AddAssetModal';

interface AssetUploadButtonProps {
    onUploadAndAddAsset: (file: File) => Promise<void>;
    onRetrieveAsset: (asset: Asset) => void;
}

export function AssetUploadButton({ onUploadAndAddAsset, onRetrieveAsset }: AssetUploadButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100"
            >
                <Upload className="h-4 w-4" />
                <span>Add Asset</span>
            </Button>
            <AddAssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadAndAddAsset={onUploadAndAddAsset}
                onRetrieveAsset={onRetrieveAsset}
            />
        </div>
    );
} 