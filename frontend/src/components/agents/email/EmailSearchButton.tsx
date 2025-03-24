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
    const { executeAgent, updateAgent, state } = useFractalBot();

    const handleOperation = async () => {
        if (!agentId) return;

        console.log('Executing operation:', {
            agentId,
            operation,
            searchParams
        });

        setIsLoading(true);

        try {
            // Update the agent with current parameters
            const currentAgent = state.agents[agentId];
            if (!currentAgent) {
                console.error('Agent not found:', agentId);
                return;
            }

            // Update the agent with current parameters while preserving existing ones
            updateAgent(agentId, {
                input_parameters: {
                    ...currentAgent.input_parameters,
                    ...searchParams,
                    operation
                }
            });

            // Execute the agent using its ID
            await executeAgent(agentId);
        } catch (error) {
            console.error('Error executing agent:', error);
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
        >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Running...' : 'Run'}
        </Button>
    );
} 