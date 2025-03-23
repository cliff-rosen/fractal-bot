import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Asset, AssetType, AssetStatus, MessageRole, ChatMessage } from '@/components/fractal-bot/types/state';
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
    const { state, addAsset, addMessage } = useFractalBot();
    const { assets } = state;

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

            // Find existing asset for this operation
            const existingAsset = assets.find(a =>
                a.metadata.creator === 'email_agent' &&
                a.metadata.tags?.includes(operation === 'list_labels' ? 'labels' : 'messages')
            );

            const assetContent = operation === 'list_labels'
                ? response.data.data?.labels
                    ? `Email Labels:\n${response.data.data.labels.map((label: any) => `- ${label.name} (${label.type})`).join('\n')}`
                    : "Email Labels Overview\nNo labels found."
                : response.data.data?.messages
                    ? `Email Messages:\n${response.data.data.messages.map((msg: any) => `- ${msg.subject}`).join('\n')}`
                    : "Email Messages Overview\nNo messages found.";

            const asset: Asset = {
                asset_id: existingAsset?.asset_id || `email-${operation}-${Date.now()}`,
                type: AssetType.DATA,
                content: assetContent,
                metadata: {
                    status: response.data.data?.labels || response.data.data?.messages ? AssetStatus.READY : AssetStatus.PENDING,
                    createdAt: existingAsset?.metadata.createdAt || new Date(),
                    updatedAt: new Date(),
                    creator: 'email_agent',
                    tags: ['email', operation === 'list_labels' ? 'labels' : 'messages'],
                    agent_associations: [],
                    version: (existingAsset?.metadata.version || 0) + 1
                }
            };

            console.log('Created/Updated Asset:', asset);

            // Add or update the asset
            addAsset(asset);

            // Add a message to the chat history
            const messageContent = operation === 'list_labels'
                ? `I've retrieved your Gmail labels. You can find them in the assets panel.`
                : `I've retrieved your email messages. You can find them in the assets panel.`;

            const message: ChatMessage = {
                id: Date.now().toString(),
                role: MessageRole.ASSISTANT,
                content: messageContent,
                timestamp: new Date().toISOString(),
                type: 'asset_added'
            };

            addMessage('setup', message);

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