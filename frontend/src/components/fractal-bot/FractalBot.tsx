import React, { useState } from 'react';
import { ChatSection } from './components/ChatSection';
import { AssetsSection } from './components/AssetsSection';
import { AgentsSection } from './components/AgentsSection';
import { Message, Asset, Agent, ChatResponse, WorkflowState, WorkflowStatus, ActionType, MessageRole } from './types/state';
import { botApi } from '../../lib/api/botApi';

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
            role: MessageRole.USER,
            content: message,
            timestamp: new Date(),
            metadata: {}
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsProcessing(true);

        try {
            // Send message to backend with history
            const response = await botApi.sendMessage(message, messages);

            // Add bot's response to messages
            setMessages(prev => [...prev, response.message]);

            // Handle any side effects (assets, agents, etc.)
            const sideEffects = response.sideEffects || {};
            const newAssets = sideEffects.assets || [];
            const newAgents = sideEffects.agents || [];

            if (newAssets.length > 0) {
                setAssets(prev => [...prev, ...newAssets]);
            }
            if (newAgents.length > 0) {
                setAgents(prev => [...prev, ...newAgents]);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            // Add error message to chat
            const errorMessage: Message = {
                message_id: (Date.now() + 1).toString(),
                role: MessageRole.ASSISTANT,
                content: error instanceof Error ? error.message : 'Sorry, I encountered an error processing your message. Please try again.',
                timestamp: new Date(),
                metadata: {}
            };
            setMessages(prev => [...prev, errorMessage]);
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