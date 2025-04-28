import React from 'react';
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
import { useFractalBot } from '@/context/FractalBotContext';

export default function FractalBot() {
  const { state, dispatch, sendMessage, resetState } = useFractalBot();
  const {
    currentMission,
    currentMissionProposal,
    currentWorkspaceState,
    currentMessages,
    currentStreamingMessage,
    currentWorkflow,
    currentWorkspace,
    currentTools,
    currentAssets,
    selectedToolIds,
    currentItemView,
    activeView,
    statusHistory
  } = state;

  // Tool support
  const handleToolSelect = (toolId: string) => {
    dispatch({
      type: 'SET_SELECTED_TOOL_IDS',
      payload: selectedToolIds.includes(toolId)
        ? selectedToolIds.filter(id => id !== toolId)
        : [...selectedToolIds, toolId]
    });
  };

  const handleSelectAll = () => {
    dispatch({
      type: 'SET_SELECTED_TOOL_IDS',
      payload: currentTools.map(tool => tool.id)
    });
  };

  const handleClearAll = () => {
    dispatch({
      type: 'SET_SELECTED_TOOL_IDS',
      payload: []
    });
  };

  const handleOpenToolsManager = () => {
    dispatch({
      type: 'SET_ITEM_VIEW',
      payload: {
        title: 'Tools Manager',
        type: 'tools',
        isOpen: true
      }
    });
  };

  // Workspace support
  const handleCloseItemView = () => {
    dispatch({
      type: 'SET_ITEM_VIEW',
      payload: {
        ...currentItemView,
        isOpen: false
      }
    });
  };

  const handleStatusUpdate = (status: string) => {
    dispatch({
      type: 'SET_STATUS_HISTORY',
      payload: [...statusHistory, status]
    });
  };

  const handleWorkflowGenerated = (workflow: any) => {
    const now = new Date().toISOString();

    // Update the workspace to show the proposed workflow
    dispatch({
      type: 'SET_WORKSPACE',
      payload: {
        ...currentWorkspace,
        type: 'proposedWorkflowDesign',
        title: 'Proposed Workflow',
        status: 'current',
        content: {
          ...currentWorkspace.content,
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
                  inputs: [],
                  outputs: []
                },
                inputs: step.inputs || [],
                outputs: step.outputs || [],
                createdAt: now,
                updatedAt: now
              }],
              assets: {
                inputs: [],
                outputs: []
              },
              inputs: step.inputs || [],
              outputs: step.outputs || [],
              createdAt: now,
              updatedAt: now
            })),
            createdAt: now,
            updatedAt: now
          }
        }
      }
    });

    // Switch to workspace view
    dispatch({
      type: 'SET_ACTIVE_VIEW',
      payload: 'workspace'
    });
  };

  const handleTokenUpdate = (token: string) => {
    const newMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: token,
      timestamp: new Date().toISOString()
    };
    dispatch({
      type: 'SET_MESSAGES',
      payload: [...currentMessages, newMessage]
    });
  };

  // Reset
  const handleReset = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Chat Rail (cols 1-4) */}
          <div key="chat-rail" className="col-span-4 h-full overflow-hidden">
            <Chat
              messages={currentMessages}
              streamingMessage={currentStreamingMessage}
              onNewMessage={sendMessage}
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
                    onReset={resetState}
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
                      onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'workspace' })}
                      className={`px-3 py-1.5 text-sm font-medium rounded-l-lg transition-colors ${activeView === 'workspace'
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                    >
                      Workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'history' })}
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
