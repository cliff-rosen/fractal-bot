import React, { useState } from 'react';
import Chat from './components/Chat';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import Workspace from './components/Workspace';
import Assets from './components/Assets';
import { mockDataSnapshots } from './mocks/data';
import { ChatMessage } from './types/index';

export default function App() {
  const [currentDataSnapshotIdx, setCurrentDataSnapshotIdx] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleNewMessage = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <div className="h-screen flex flex-col">

      <div className="flex-1 min-h-0 pt-14">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Chat Rail (cols 1-3) */}
          <div key="chat-rail" className="col-span-3 h-full overflow-hidden">
            <Chat
              messages={messages}
              onNewMessage={handleNewMessage}
            />
          </div>

          {/* Main Content Area (cols 4-9) */}
          <div key="main-content" className="col-span-6 h-full flex flex-col">
            {/* Mission Header */}
            <div className="sticky top-14 z-30 bg-white dark:bg-[#1e2330] shadow-lg rounded-2xl p-6 mb-6">
              <Mission mission={mockDataSnapshots[currentDataSnapshotIdx].mission} />
            </div>

            {/* Stage Tracker */}
            <div className="mb-6">
              <Workflow
                workflow={mockDataSnapshots[currentDataSnapshotIdx].mission.workflow}
                workspaceState={mockDataSnapshots[currentDataSnapshotIdx].workspaceState}
              />
            </div>

            {/* Workspace Canvas */}
            <div className="flex-1 overflow-y-auto">
              <Workspace workspace={mockDataSnapshots[currentDataSnapshotIdx].workspace} />
            </div>
          </div>

          {/* Right Assets Rail (cols 10-12) */}
          <div key="assets-rail" className="col-span-3 h-full overflow-hidden">
            <Assets assets={mockDataSnapshots[currentDataSnapshotIdx].mission.assets} />
          </div>
        </div>
      </div>
    </div>
  );
}
