import { Asset, FileType, DataType } from '@/types/asset';
import { api } from '@/lib/api';

export const assetApi = {
    // Get all assets
    async getAssets(fileType?: FileType, dataType?: DataType): Promise<Asset[]> {
        const response = await api.get('/api/assets', {
            params: {
                fileType,
                dataType
            }
        });
        return response.data;
    },

    // Get a specific asset
    async getAsset(id: string): Promise<Asset> {
        const response = await api.get(`/api/assets/${id}`);
        return response.data;
    },

    // Create a new asset
    async createAsset(asset: Omit<Asset, 'asset_id' | 'persistence'>): Promise<Asset> {
        const assetWithPersistence = {
            ...asset,
            persistence: {
                isInDb: false
            }
        };
        const response = await api.post('/api/assets', assetWithPersistence);
        return response.data;
    },

    // Update an asset
    async updateAsset(id: string, updates: Partial<Omit<Asset, 'asset_id' | 'persistence'>>): Promise<Asset> {
        const response = await api.patch(`/api/assets/${id}`, updates);
        return response.data;
    },

    // Save an asset (create or update based on is_in_db flag)
    async saveAsset(asset: Asset): Promise<Asset> {
        if (asset.is_in_db) {
            return this.updateAsset(asset.asset_id, asset);
        } else {
            return this.createAsset({
                name: asset.name,
                type: asset.type,
                description: asset.description,
                subtype: asset.metadata?.subtype,
                content: asset.content
            });
        }
    },

    // Delete an asset
    async deleteAsset(id: string): Promise<void> {
        await api.delete(`/api/assets/${id}`);
    },

    // Upload a file as an asset
    async uploadFileAsset(
        file: File,
        options?: {
            name?: string;
            description?: string;
            subtype?: string;
        }
    ): Promise<Asset> {
        const formData = new FormData();
        formData.append('file', file);

        if (options?.name) formData.append('name', options.name);
        if (options?.description) formData.append('description', options.description);
        if (options?.subtype) formData.append('subtype', options.subtype);

        const response = await api.post('/api/assets/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return { ...response.data, is_in_db: true };
    },

    // Download a file asset
    async downloadFileAsset(assetId: string): Promise<Blob> {
        const response = await api.get(`/api/assets/${assetId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    }
}; 