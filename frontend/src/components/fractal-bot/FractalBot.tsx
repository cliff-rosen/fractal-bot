import React, { useState } from 'react';
import { ChatSection } from './components/ChatSection';
import { AssetsSection } from './components/AssetsSection';
import { AgentsSection } from './components/AgentsSection';
import { AssetModal } from './components/AssetModal';
import { Message, Asset, Agent, ChatResponse, WorkflowState, WorkflowStatus, ActionType, MessageRole } from './types/state';
import { botApi } from '../../lib/api/botApi';
import { FractalBotProvider, useFractalBot } from './context/FractalBotContext';

const FractalBotContent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [workflowState, setWorkflowState] = useState<WorkflowState>({
        currentStep: 0,
        totalSteps: 0,
        status: WorkflowStatus.IDLE
    });

    const { state, addAsset } = useFractalBot();
    const { assets } = state;

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
                newAssets.forEach(asset => addAsset(asset));
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
        setSelectedAsset(asset);
    };

    const handleAgentClick = (agent: Agent) => {
        // TODO: Implement agent handling logic
        console.log('Agent clicked:', agent);
    };

    return (
        <div className="flex h-screen gap-4 p-4 bg-gray-50 dark:bg-gray-900">
            {/* Left Panel: Chat */}
            <div className="w-[500px] flex-shrink-0 h-full">
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

            {/* Asset Modal */}
            {selectedAsset && (
                <AssetModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                />
            )}
        </div>
    );
};

const FractalBot: React.FC = () => {
    return (
        <FractalBotProvider>
            <FractalBotContent />
        </FractalBotProvider>
    );
};

export default FractalBot; 