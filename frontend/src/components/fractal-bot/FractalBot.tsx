import React, { useState } from 'react';
import Chat from './components/Chat';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import Workspace from './components/Workspace';
import Assets from './components/Assets';
import { Asset, ChatMessage, Mission as MissionType, Workflow as WorkflowType, Workspace as WorkspaceType, WorkspaceState } from './types/index';
import { botApi } from '@/lib/api/botApi';
import { assetsTemplate, missionTemplate, workflowTemplate, workspaceStateTemplate, workspaceTemplate } from './types/type-defaults';
import { Message, MessageRole } from '@/types/message';

export default function App() {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>(workspaceTemplate);
  const [currentMission, setCurrentMission] = useState<MissionType>(missionTemplate);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowType>(workflowTemplate);
  const [currentAssets, setCurrentAssets] = useState<Asset[]>(assetsTemplate);
  const [currentWorkspaceState, setCurrentWorkspaceState] = useState<WorkspaceState>(workspaceStateTemplate);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');


  const handleSendMessage = async (message: ChatMessage) => {
    setCurrentMessages((prevMessages) => [...prevMessages, message]);

    try {
      let finalContent = '';
      // Convert ChatMessage[] to Message[]
      const messages: Message[] = currentMessages.map(msg => ({
        message_id: msg.id,
        role: msg.role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT,
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));

      for await (const update of botApi.streamMessage(message.content, messages)) {
        const lines = update.data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            try {
              const data = JSON.parse(jsonStr);
              if (data.token) {
                setCurrentStreamingMessage(prev => prev + data.token + ' ');
                finalContent += ' ' + data.token;
              }
              if (data.status) {
                const newStatusMessage = data.status;
                const currentContent = currentWorkspace.content;
                const newContent = { ...currentContent, text: newStatusMessage };
                setCurrentWorkspace((prevWorkspace) => ({ ...prevWorkspace, status: "current", content: newContent }));
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }

      // Update the final message with the complete content
      const finalMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString()
      };
      setCurrentMessages((prevMessages) => [...prevMessages, finalMessage]);
      setCurrentWorkspace((prevWorkspace) => ({ ...prevWorkspace, status: 'completed' }));

    } catch (error) {
      console.error('Error streaming message:', error);
    } finally {
      setCurrentStreamingMessage('');
    }
  };

  return (
    <div className="h-screen flex flex-col">

      <div className="flex-1 min-h-0 pt-14">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Chat Rail (cols 1-3) */}
          <div key="chat-rail" className="col-span-3 h-full overflow-hidden">
            <Chat
              messages={currentMessages}
              streamingMessage={currentStreamingMessage}
              onNewMessage={handleSendMessage}
            />
          </div>

          {/* Main Content Area (cols 4-9) */}
          <div key="main-content" className="col-span-6 h-full flex flex-col">
            {/* Mission Header */}
            <div className="sticky top-14 z-30 bg-white dark:bg-[#1e2330] shadow-lg rounded-2xl p-6 mb-6">
              <Mission mission={currentMission} />
            </div>

            {/* Stage Tracker */}
            <div className="mb-6">
              <Workflow
                workflow={currentWorkflow}
                workspaceState={currentWorkspaceState}
              />
            </div>

            {/* Workspace Canvas */}
            <div className="flex-1 overflow-y-auto">
              <Workspace workspace={currentWorkspace} />
            </div>
          </div>

          {/* Right Assets Rail (cols 10-12) */}
          <div key="assets-rail" className="col-span-3 h-full overflow-hidden">
            <Assets assets={currentAssets} />
          </div>
        </div>
      </div>
    </div>
  );
}
