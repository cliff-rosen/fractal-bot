import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddAssetModal } from './components/AddAssetModal';
import { Asset } from './types/state';

interface AssetUploadButtonProps {
    onUploadAndAddAsset: (file: File) => Promise<void>
    onRetrieveAsset: (asset: Asset) => void
}

export function AssetUploadButton({ onUploadAndAddAsset, onRetrieveAsset }: AssetUploadButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUploadAndAddAsset = async (x: any) => {
        await onUploadAndAddAsset(x);
    };

    return (
        <>
            <Button
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
            >
                <Plus className="h-4 w-4" />
                Add Asset
            </Button>
            <AddAssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadAndAddAsset={handleUploadAndAddAsset}
                onRetrieveAsset={onRetrieveAsset}
            />
        </>
    );
} 