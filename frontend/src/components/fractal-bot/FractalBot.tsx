import React from 'react';
import Chat from './components/Chat';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import Workspace from './components/Workspace';
import Assets from './components/Assets';
import Tools from './components/Tools';
import ItemView from './components/ItemView';
import StatusHistory from './components/StatusHistory';
import { useFractalBot } from '@/context/FractalBotContext';

export default function FractalBot() {
  const {
    state,
    toggleToolSelection,
    selectAllTools,
    clearAllTools,
    openToolsManager,
    closeItemView,
    setActiveView,
    sendMessage
  } = useFractalBot();

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
                onClose={closeItemView}
              />
            </div>
          ) : (
            <>
              {/* Main Content Area (cols 5-10) */}
              <div key="main-content" className="col-span-5 h-full flex flex-col">
                {/* Mission Header */}
                <div className="mb-6 pt-4">
                  <Mission />
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
                    onToolSelect={toggleToolSelection}
                    onSelectAll={selectAllTools}
                    onClearAll={clearAllTools}
                    onToggleItemView={openToolsManager}
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
