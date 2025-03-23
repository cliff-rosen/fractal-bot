import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Agent } from '@/components/fractal-bot/types/state';
import EmailSearchButton from './EmailSearchButton';

interface EmailSearchAgentProps {
    agent: Agent;
}

export default function EmailSearchAgent({ agent }: EmailSearchAgentProps) {
    // Extract parameters from both metadata.searchParams and input_parameters
    const searchParams = agent.metadata?.searchParams || {};
    const inputParams = agent.input_parameters || {};

    // Combine parameters, preferring input_parameters if they exist
    const operation = inputParams.operation || 'get_messages';
    const folders = inputParams.folders || searchParams.folders || [];
    const queryTerms = inputParams.query_terms || searchParams.query_terms || [];
    const maxResults = inputParams.max_results || searchParams.max_results || 100;
    const dateRange = inputParams.date_range;
    const includeAttachments = inputParams.include_attachments ?? false;
    const includeMetadata = inputParams.include_metadata ?? true;

    return (
        <Card className="w-full bg-white dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                    <span>Email Search Agent</span>
                    <EmailSearchButton
                        agentId={agent.agent_id}
                        operation={operation}
                        searchParams={{
                            folders,
                            query_terms: queryTerms,
                            max_results: maxResults,
                            include_attachments: includeAttachments,
                            include_metadata: includeMetadata
                        }}
                    />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Operation Details</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500 dark:text-gray-400">Operation:</span>
                                <span className="col-span-2 text-gray-900 dark:text-white">{operation}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500 dark:text-gray-400">Folders:</span>
                                <span className="col-span-2 text-gray-900 dark:text-white">
                                    {folders.length > 0 ? folders.join(', ') : 'All folders'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500 dark:text-gray-400">Search Terms:</span>
                                <span className="col-span-2 text-gray-900 dark:text-white">
                                    {queryTerms.length > 0 ? queryTerms.join(', ') : 'None'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500 dark:text-gray-400">Max Results:</span>
                                <span className="col-span-2 text-gray-900 dark:text-white">{maxResults}</span>
                            </div>
                            {dateRange && (
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 dark:text-gray-400">Date Range:</span>
                                    <span className="col-span-2 text-gray-900 dark:text-white">
                                        {dateRange.start && `From: ${new Date(dateRange.start).toLocaleDateString()}`}
                                        {dateRange.end && ` To: ${new Date(dateRange.end).toLocaleDateString()}`}
                                    </span>
                                </div>
                            )}
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500 dark:text-gray-400">Include:</span>
                                <span className="col-span-2 text-gray-900 dark:text-white">
                                    {[
                                        includeAttachments && 'Attachments',
                                        includeMetadata && 'Metadata'
                                    ].filter(Boolean).join(', ') || 'Basic content only'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Status</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                            <p className="text-sm text-gray-900 dark:text-white">
                                {agent.status}
                                {agent.metadata?.progress !== undefined && (
                                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                                        ({agent.metadata.progress}% complete)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 