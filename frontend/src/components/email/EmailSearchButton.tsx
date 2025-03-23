import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Asset, AssetType, AssetStatus } from '@/components/fractal-bot/types/state';
import { useFractalBot } from '@/components/fractal-bot/context/FractalBotContext';

interface EmailSearchButtonProps {
    agentId: string;
    operation: string;
    searchParams: {
        folders?: string[];
        query_terms?: string[];
        max_results?: number;
        include_attachments?: boolean;
        include_metadata?: boolean;
    };
}

export default function EmailSearchButton({ agentId, operation, searchParams }: EmailSearchButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { addAsset } = useFractalBot();

    const handleOperation = async () => {
        try {
            setIsLoading(true);
            let response;
            if (operation === 'list_labels') {
                response = await api.get('/api/email/labels');
                console.log('Labels API Response:', response.data);
            } else if (operation === 'get_messages') {
                response = await api.post('/api/email/messages', {
                    folders: searchParams.folders,
                    query_terms: searchParams.query_terms,
                    max_results: searchParams.max_results || 100,
                    include_attachments: searchParams.include_attachments,
                    include_metadata: searchParams.include_metadata
                });
                console.log('Messages API Response:', response.data);
            } else {
                throw new Error(`Unsupported operation: ${operation}`);
            }

            if (!response.data.success) {
                throw new Error(response.data.error || 'Operation failed');
            }

            // Create an asset with the appropriate status and content
            const asset: Asset = {
                asset_id: `email-${operation}-${Date.now()}`,
                type: AssetType.DATA,
                content: operation === 'list_labels'
                    ? response.data.labels
                        ? `Email Labels:\n${response.data.labels.map((label: any) => `- ${label.name}`).join('\n')}`
                        : "Email Labels Overview\nNo labels found."
                    : response.data.messages
                        ? `Email Messages:\n${response.data.messages.map((msg: any) => `- ${msg.subject}`).join('\n')}`
                        : "Email Messages Overview\nNo messages found.",
                metadata: {
                    status: response.data.labels || response.data.messages ? AssetStatus.READY : AssetStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    creator: 'email_agent',
                    tags: ['email', operation === 'list_labels' ? 'labels' : 'messages'],
                    agent_associations: [],
                    version: 1
                }
            };

            console.log('Created Asset:', asset);

            // Add the asset to the store
            addAsset(asset);

            // Show success toast
            toast({
                title: operation === 'list_labels' ? 'Labels Retrieved' : 'Messages Retrieved',
                description: operation === 'list_labels'
                    ? 'Email labels have been successfully retrieved.'
                    : 'Email messages have been successfully retrieved.',
                variant: 'default'
            });

        } catch (error: any) {
            console.error('Error fetching email data:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to retrieve email data. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleOperation}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="flex items-center justify-center gap-2"
        >
            <Search className="h-4 w-4" />
            <span className="text-sm">
                {isLoading
                    ? 'Processing...'
                    : operation === 'list_labels'
                        ? 'List Labels'
                        : 'Search Emails'
                }
            </span>
        </Button>
    );
} 