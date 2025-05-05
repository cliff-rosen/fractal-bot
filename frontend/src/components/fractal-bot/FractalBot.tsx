import React, { useState } from 'react';
import Chat from './components/Chat';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import WorkflowVariableBrowser from './components/WorkflowVariableBrowser';
import Tools from './components/Tools';
import ItemView from './components/ItemView';
import StatusHistory from './components/StatusHistory';
import { useFractalBot } from '@/context/FractalBotContext';
import type { Stage, Step } from './types/index';

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
    currentMissionProposal,
    currentMessages,
    currentStreamingMessage,
    currentTools,
    selectedToolIds,
    currentItemView,
    currentMission
  } = state;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <div className="flex h-full gap-4 px-4">
          {/* Left Chat Rail */}
          <div key="chat-rail" className="w-[400px] h-full flex-shrink-0">
            <Chat
              messages={currentMessages}
              streamingMessage={currentStreamingMessage}
              onNewMessage={sendMessage}
            />
          </div>

          {/* Main Content Area */}
          {currentItemView.isOpen ? (
            <div key="item-view" className="flex-1 h-full">
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
              <div key="main-content" className={`h-full flex flex-col flex-1 ${isRightColumnCollapsed ? 'w-full' : ''}`}>
                {/* Mission Header */}
                <div className="mb-6 pt-4">
                  <Mission />
                </div>

                {/* Stage Tracker */}
                <div className="mb-6">
                  <Workflow />
                </div>

                {/* Workspace Canvas */}
                <div className="flex-1 overflow-y-auto">
                  {/* Content goes here */}
                </div>

                {/* Status History */}
                {/* <div className="border-t border-gray-200 dark:border-gray-700">
                  <StatusHistory messages={statusHistory} />
                </div> */}
              </div>

              {/* Right Rail */}
              <div
                key="right-rail"
                className={`h-full overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isRightColumnCollapsed ? 'w-0' : 'w-[300px] flex-shrink-0'}`}
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
                  <WorkflowVariableBrowser
                    stages={currentMission?.workflow?.stages || []}
                    mission={currentMission}
                  />
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
