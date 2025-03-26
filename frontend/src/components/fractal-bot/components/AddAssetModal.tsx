import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Database } from 'lucide-react';
import { Asset, FileType, AssetStatus } from '../types/state';
import { assetApi } from '@/lib/api/assetApi';
import { useToast } from '@/components/ui/use-toast';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadAndAddAsset: (file: File) => void;
    onRetrieveAsset: (asset: Asset) => void;
}

export function AddAssetModal({ isOpen, onClose, onUploadAndAddAsset, onRetrieveAsset }: AddAssetModalProps) {
    const [existingAssets, setExistingAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadExistingAssets();
        }
    }, [isOpen]);

    const loadExistingAssets = async () => {
        try {
            setIsLoading(true);
            const assets = await assetApi.getAssets();
            setExistingAssets(assets);
        } catch (error) {
            console.error('Error loading assets:', error);
            toast({
                title: 'Error',
                description: 'Failed to load existing assets',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadAndAddAsset = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        try {
            console.log('handleFileUpload', file)
            onUploadAndAddAsset(file);
            onClose();
            toast({
                title: 'Success',
                description: 'File uploaded successfully',
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload file. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleSelectAsset = (asset: Asset) => {
        // Create a copy of the asset to avoid modifying the original
        const selectedAsset = {
            ...asset,
            is_in_db: true
        };
        onRetrieveAsset(selectedAsset);
        onClose();
        toast({
            title: 'Success',
            description: 'Asset added to workspace',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
                <DialogHeader className="flex-none">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        Add Asset to Workspace
                    </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="upload" className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="upload" className="flex items-center gap-2 text-sm font-medium">
                            <Upload className="h-4 w-4" />
                            Upload File
                        </TabsTrigger>
                        <TabsTrigger value="select" className="flex items-center gap-2 text-sm font-medium">
                            <Database className="h-4 w-4" />
                            Select Existing
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-hidden">
                        <TabsContent value="upload" className="h-full m-0">
                            <div className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleUploadAndAddAsset(e.target.files)}
                                    accept="*/*"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="gap-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                                >
                                    <Upload className="h-4 w-4" />
                                    Choose File
                                </Button>
                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                    or drag and drop a file here
                                </p>
                            </div>
                        </TabsContent>
                        <TabsContent value="select" className="h-full m-0">
                            <div className="h-full flex flex-col">
                                {isLoading ? (
                                    <div className="flex-1 flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                                    </div>
                                ) : existingAssets.length > 0 ? (
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                        {existingAssets.map((asset) => (
                                            <Button
                                                key={asset.asset_id}
                                                variant="outline"
                                                className="w-full justify-start gap-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                                                onClick={() => handleSelectAsset(asset)}
                                            >
                                                <span className="truncate">{asset.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex justify-center items-center text-gray-500 dark:text-gray-400">
                                        No existing assets found
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
} 