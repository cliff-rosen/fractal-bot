import React, { useState } from 'react';
import Chat from './components/Chat';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import Workspace from './components/Workspace';
import Assets from './components/Assets';
import Tools from './components/Tools';
import ItemView from './components/ItemView';
import { Asset, ChatMessage, Mission as MissionType, Workflow as WorkflowType, Workspace as WorkspaceType, WorkspaceState, Tool, ItemView as ItemViewType } from './types/index';
import { getDataFromLine } from './utils/utils'
import { botApi } from '@/lib/api/botApi';
import { assetsTemplate, missionTemplate, workflowTemplate, workspaceStateTemplate, workspaceTemplate, toolsTemplate } from './types/type-defaults';
import { Message, MessageRole } from '@/types/message';

export default function App() {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>(workspaceTemplate);
  const [currentMission, setCurrentMission] = useState<MissionType>(missionTemplate);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowType>(workflowTemplate);
  const [currentAssets, setCurrentAssets] = useState<Asset[]>(assetsTemplate);
  const [currentWorkspaceState, setCurrentWorkspaceState] = useState<WorkspaceState>(workspaceStateTemplate);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [currentTools, setCurrentTools] = useState<Tool[]>(toolsTemplate);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [currentItemView, setCurrentItemView] = useState<ItemViewType>({
    title: '',
    type: 'none',
    isOpen: false
  });

  const handleToolSelect = (toolId: string) => {
    setSelectedToolIds(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSelectAll = () => {
    setSelectedToolIds(currentTools.map(tool => tool.id));
  };

  const handleClearAll = () => {
    setSelectedToolIds([]);
  };

  const handleOpenToolsManager = () => {
    setCurrentItemView({
      title: 'Tools Manager',
      type: 'tools',
      isOpen: true
    });
  };

  const handleCloseItemView = () => {
    setCurrentItemView(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const handleSendMessage = async (message: ChatMessage) => {
    setCurrentMessages((prevMessages) => [...prevMessages, message]);

    let finalContent = '';

    try {
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
          const data = getDataFromLine(line);

          if (data.token) {
            setCurrentStreamingMessage(prev => prev + data.token);
            finalContent += data.token;
          }
          if (data.status) {
            const newStatusMessage = data.status;
            const currentContent = currentWorkspace.content;
            const newContent = { ...currentContent, text: newStatusMessage };
            setCurrentWorkspace((prevWorkspace) => ({ ...prevWorkspace, status: "current", content: newContent }));
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
    };
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Chat Rail (cols 1-3) */}
          <div key="chat-rail" className="col-span-3 h-full overflow-hidden">
            <Chat
              messages={currentMessages}
              streamingMessage={currentStreamingMessage}
              onNewMessage={handleSendMessage}
            />
          </div>

          {/* Main Content Area (cols 4-12) */}
          {currentItemView.isOpen ? (
            <div key="item-view" className="col-span-9 h-full">
              <ItemView
                itemView={currentItemView}
                tools={currentTools}
                selectedToolIds={selectedToolIds}
                onToolSelect={handleToolSelect}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                onClose={handleCloseItemView}
              />
            </div>
          ) : (
            <>
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

              {/* Right Rail (cols 10-12) */}
              <div key="right-rail" className="col-span-3 h-full overflow-hidden flex flex-col">
                <div className="h-1/2 overflow-y-auto">
                  <Tools
                    tools={currentTools}
                    selectedToolIds={selectedToolIds}
                    onToolSelect={handleToolSelect}
                    onSelectAll={handleSelectAll}
                    onClearAll={handleClearAll}
                    onToggleItemView={handleOpenToolsManager}
                    isItemViewMode={currentItemView.isOpen}
                  />
                </div>
                <div className="h-1/2 overflow-y-auto border-t dark:border-gray-700 mt-2">
                  <Assets assets={currentAssets} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
