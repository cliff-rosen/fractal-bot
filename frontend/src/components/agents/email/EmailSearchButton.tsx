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
    const { executeAgent } = useFractalBot();

    const handleOperation = async () => {
        console.log('handleOperation', agentId, operation, searchParams);
        try {
            setIsLoading(true);
            await executeAgent(agentId);
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