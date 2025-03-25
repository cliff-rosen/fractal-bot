import { api } from './index';
import { Asset, AssetType } from '@/types/asset';

export interface AssetUploadResponse {
    asset: Asset;
}

export const assetApi = {
    // Get all assets
    async getAssets(type?: AssetType, subtype?: string): Promise<Asset[]> {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (subtype) params.append('subtype', subtype);

        const response = await api.get(`/api/assets?${params.toString()}`);
        return response.data.map((asset: Asset) => ({ ...asset, is_in_db: true }));
    },

    // Get a specific asset
    async getAsset(assetId: string): Promise<Asset> {
        const response = await api.get(`/api/assets/${assetId}`);
        return { ...response.data, is_in_db: true };
    },

    // Create a new asset
    async createAsset(data: {
        name: string;
        type: AssetType;
        description?: string;
        subtype?: string;
        content?: any;
    }): Promise<Asset> {
        const response = await api.post('/api/assets', data);
        return { ...response.data, is_in_db: true };
    },

    // Update an asset
    async updateAsset(assetId: string, updates: Partial<Asset>): Promise<Asset> {
        const response = await api.put(`/api/assets/${assetId}`, updates);
        return { ...response.data, is_in_db: true };
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
    async deleteAsset(assetId: string): Promise<void> {
        await api.delete(`/api/assets/${assetId}`);
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