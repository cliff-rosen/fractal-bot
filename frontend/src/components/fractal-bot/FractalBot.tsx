import React, { useState } from 'react';
import { ChatSection } from './components/ChatSection';
import { AssetsSection } from './components/AssetsSection';
import { AgentsSection } from './components/AgentsSection';
import { Message, Asset, Agent, ChatResponse, WorkflowState, WorkflowStatus, ActionType } from './types/state';

const FractalBot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [workflowState, setWorkflowState] = useState<WorkflowState>({
        currentStep: 0,
        totalSteps: 0,
        status: WorkflowStatus.IDLE
    });

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        const userMessage: Message = {
            message_id: Date.now().toString(),
            content: message,
            sender: 'user',
            timestamp: new Date(),
            metadata: {}
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsProcessing(true);

        try {
            // TODO: Implement actual message processing logic
            // For now, we'll simulate a response
            const botMessage: Message = {
                message_id: (Date.now() + 1).toString(),
                content: `I received your message: "${message}"`,
                sender: 'bot',
                timestamp: new Date(),
                metadata: {
                    actionButtons: [
                        {
                            label: 'Create Asset',
                            action: ActionType.CREATE_ASSET
                        },
                        {
                            label: 'Start Agent',
                            action: ActionType.START_AGENT
                        }
                    ]
                }
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error processing message:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAssetClick = (asset: Asset) => {
        // TODO: Implement asset handling logic
        console.log('Asset clicked:', asset);
    };

    const handleAgentClick = (agent: Agent) => {
        // TODO: Implement agent handling logic
        console.log('Agent clicked:', agent);
    };

    return (
        <div className="flex h-full gap-4 p-4 bg-gray-50 dark:bg-gray-900">
            {/* Left Panel: Chat */}
            <div className="w-[500px] flex-shrink-0">
                <ChatSection
                    messages={messages}
                    inputMessage={inputMessage}
                    isProcessing={isProcessing}
                    onSendMessage={handleSendMessage}
                    onInputChange={setInputMessage}
                />
            </div>

            {/* Middle Panel: Assets */}
            <div className="w-[400px] flex-shrink-0">
                <AssetsSection
                    assets={assets}
                    onAssetClick={handleAssetClick}
                />
            </div>

            {/* Right Panel: Agents */}
            <div className="flex-1 min-w-[400px]">
                <AgentsSection
                    agents={agents}
                    onAgentClick={handleAgentClick}
                />
            </div>
        </div>
    );
};

export default FractalBot; 