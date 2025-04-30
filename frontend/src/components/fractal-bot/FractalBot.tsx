import React, { useState } from 'react';
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
  const [isRightColumnCollapsed, setIsRightColumnCollapsed] = useState(false);
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
        <div className="flex h-full gap-6">
          {/* Left Chat Rail */}
          <div key="chat-rail" className="w-1/3 h-full">
            <Chat
              messages={currentMessages}
              streamingMessage={currentStreamingMessage}
              onNewMessage={sendMessage}
            />
          </div>

          {/* Main Content Area */}
          {currentItemView.isOpen ? (
            <div key="item-view" className="w-2/3 h-full">
              <ItemView
                itemView={currentItemView}
                tools={currentTools}
                missionProposal={currentMissionProposal || null}
                onClose={closeItemView}
              />
            </div>
          ) : (
            <>
              {/* Main Content Area */}
              <div key="main-content" className={`h-full flex flex-col ${isRightColumnCollapsed ? 'w-2/3' : 'w-5/12'}`}>
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

              {/* Right Rail */}
              <div
                key="right-rail"
                className={`h-full overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isRightColumnCollapsed ? 'w-0' : 'w-3/12'
                  }`}
              >
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

                {/* Collapse Button */}
                <button
                  onClick={() => setIsRightColumnCollapsed(!isRightColumnCollapsed)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-gray-100 dark:bg-gray-800 rounded-l-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  {isRightColumnCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
