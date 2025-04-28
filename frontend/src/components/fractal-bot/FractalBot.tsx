import React, { useState } from 'react';
import Chat from './components/Chat';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import Workspace from './components/Workspace';
import Assets from './components/Assets';
import Tools from './components/Tools';
import ItemView from './components/ItemView';
import StatusHistory from './components/StatusHistory';
import { Asset, ChatMessage, Mission as MissionType, Workflow as WorkflowType, Workspace as WorkspaceType, WorkspaceState, Tool, ItemView as ItemViewType, DataFromLine, MissionProposal } from './types/index';
import { createMissionFromProposal, getDataFromLine } from './utils/utils'
import { botApi } from '@/lib/api/botApi';
import { assetsTemplate, missionTemplate, workflowTemplate, workspaceStateTemplate, workspaceTemplate, toolsTemplate } from './types/type-defaults';
import { Message, MessageRole } from '@/types/message';

export default function FractalBot() {
  const [currentMission, setCurrentMission] = useState<MissionType>(missionTemplate);
  const [currentMissionProposal, setCurrentMissionProposal] = useState<MissionProposal>();
  const [currentWorkspaceState, setCurrentWorkspaceState] = useState<WorkspaceState>(workspaceStateTemplate);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowType>(workflowTemplate);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>(workspaceTemplate);
  const [currentTools, setCurrentTools] = useState<Tool[]>(toolsTemplate);
  const [currentAssets, setCurrentAssets] = useState<Asset[]>(assetsTemplate);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [currentItemView, setCurrentItemView] = useState<ItemViewType>({
    title: '',
    type: 'none',
    isOpen: false
  });
  const [activeView, setActiveView] = useState<'workspace' | 'history'>('history');
  const [statusHistory, setStatusHistory] = useState<string[]>([]);

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

  const handleStatusUpdate = (status: string) => {
    setStatusHistory(prev => [...prev, status]);
  };

  const handleWorkflowGenerated = (workflow: any) => {
    const now = new Date().toISOString();

    // Update the workspace to show the proposed workflow
    setCurrentWorkspace(prev => ({
      ...prev,
      type: 'proposedWorkflowDesign',
      title: 'Proposed Workflow',
      status: 'current',
      content: {
        ...prev.content,
        workflow: {
          ...workflowTemplate,
          name: 'Proposed Workflow',
          description: workflow.explanation,
          stages: workflow.steps.map((step: any, index: number) => ({
            id: `stage-${index}`,
            name: step.description,
            description: step.description,
            status: 'pending',
            steps: [{
              id: `step-${index}`,
              name: step.description,
              description: step.description,
              status: 'pending',
              tool: step.tool_id !== 'deferred' ? {
                name: step.tool_id,
                configuration: {}
              } : undefined,
              assets: {
                inputs: step.inputs,
                outputs: step.outputs
              },
              createdAt: now,
              updatedAt: now
            }],
            assets: {
              inputs: step.inputs,
              outputs: step.outputs
            },
            createdAt: now,
            updatedAt: now
          })),
          createdAt: now,
          updatedAt: now
        }
      }
    }));

    // Switch to workspace view
    setActiveView('workspace');
  };

  const processBotMessage = (data: DataFromLine) => {

    if (data.token) {
      setCurrentStreamingMessage(prev => prev + data.token);
    }

    if (data.status) {
      const newStatusMessage = data.status;
      const currentContent = currentWorkspace.content;
      const newContent = { ...currentContent, text: newStatusMessage };
      setCurrentWorkspace((prevWorkspace) => ({ ...prevWorkspace, status: "current", content: newContent }));
      var message = ""
      var error = ""
      if (data.message) {
        message = data.message;
      }
      if (data.error) {
        error = data.error;
      }
      const messageToAdd = newStatusMessage + " " + message + " " + error;
      setStatusHistory(prev => [...prev, messageToAdd]);
    }

    if (data.mission_proposal) {
      // setCurrentMission(prevMission => ({ ...prevMission, ...data.mission_proposal }));
      console.log("mission_proposal", data.mission_proposal);
      //setCurrentItemView({ title: 'Proposed Mission', type: 'proposedMission', isOpen: true });
      const new_mission = createMissionFromProposal(data.mission_proposal);
      setCurrentMission(new_mission);
      setCurrentMissionProposal(data.mission_proposal);
    }

    return data.token || "";
  }

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

      // Get the full tool objects for selected tool IDs
      const selectedToolObjects = currentTools.filter(tool => selectedToolIds.includes(tool.id));

      for await (const update of botApi.streamMessage(message.content, messages, currentMission, selectedToolObjects)) {
        const lines = update.data.split('\n');
        for (const line of lines) {
          const data = getDataFromLine(line);
          finalContent += processBotMessage(data);
        }
      }

      if (finalContent.length === 0) {
        finalContent = "No direct response from the bot. Check item view for more information.";
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

  const handleTokenUpdate = (token: string) => {
    const newMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: token,
      timestamp: new Date().toISOString()
    };
    setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Chat Rail (cols 1-4) */}
          <div key="chat-rail" className="col-span-4 h-full overflow-hidden">
            <Chat
              messages={currentMessages}
              streamingMessage={currentStreamingMessage}
              onNewMessage={handleSendMessage}
            />
          </div>

          {/* Main Content Area (cols 5-12) */}
          {currentItemView.isOpen ? (
            <div key="item-view" className="col-span-8 h-full">
              <ItemView
                itemView={currentItemView}
                tools={currentTools}
                missionProposal={currentMissionProposal || null}
                onClose={handleCloseItemView}
              />
            </div>
          ) : (
            <>
              {/* Main Content Area (cols 5-10) */}
              <div key="main-content" className="col-span-5 h-full flex flex-col">
                {/* Mission Header */}
                <div className="mb-6 pt-4">
                  <Mission
                    mission={currentMission}
                    selectedTools={currentTools.filter(tool => selectedToolIds.includes(tool.id))}
                    onStatusUpdate={handleStatusUpdate}
                    onWorkflowGenerated={handleWorkflowGenerated}
                    onTokenUpdate={handleTokenUpdate}
                  />
                </div>

                {/* Stage Tracker */}
                <div className="mb-6">
                  <Workflow
                    workflow={currentWorkflow}
                    workspaceState={currentWorkspaceState}
                  />
                </div>

                {/* View Toggle */}
                <div className="flex justify-end mb-4">
                  <div className="inline-flex rounded-lg shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => setActiveView('workspace')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-l-lg transition-colors ${activeView === 'workspace'
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                    >
                      Workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('history')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-r-lg transition-colors ${activeView === 'history'
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                    >
                      Status History
                    </button>
                  </div>
                </div>

                {/* Workspace Canvas or Status History */}
                <div className="flex-1 overflow-y-auto">
                  {activeView === 'workspace' ? (
                    <Workspace workspace={currentWorkspace} />
                  ) : (
                    <StatusHistory messages={statusHistory} />
                  )}
                </div>
              </div>

              {/* Right Rail (cols 11-12) */}
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
