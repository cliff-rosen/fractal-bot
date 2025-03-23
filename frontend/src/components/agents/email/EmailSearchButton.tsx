import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Search } from 'lucide-react';
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
    const { searchEmails, listEmailLabels, state } = useFractalBot();

    const handleOperation = async () => {
        try {
            setIsLoading(true);
            const agent = state.agents[agentId];
            if (!agent?.output_asset_ids?.length) {
                throw new Error('No associated assets found for this agent');
            }

            // Get the first asset ID (we assume the agent has one asset for now)
            const assetId = agent.output_asset_ids[0];
            const asset = state.assets[assetId];
            if (!asset) {
                throw new Error('Associated asset not found');
            }

            if (operation === 'list_labels') {
                await listEmailLabels(assetId);
            } else if (operation === 'get_messages') {
                await searchEmails(assetId, searchParams);
            } else {
                throw new Error(`Unsupported operation: ${operation}`);
            }
        } catch (error: any) {
            console.error('Error in email operation:', error);
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