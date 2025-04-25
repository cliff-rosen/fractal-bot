import React, { useState } from 'react';
import Chat from './components/Chat';
import Mission from './components/Mission';
import Workflow from './components/Workflow';
import Workspace from './components/Workspace';
import Assets from './components/Assets';
import { mockDataSnapshots } from './mocks/data';
import { ChatMessage, Workspace as WorkspaceType } from './types/index';
import { botApi } from '@/lib/api/botApi';

export default function App() {
  const [currentDataSnapshotIdx, setCurrentDataSnapshotIdx] = useState(8);
  const [currentWorkspaceObj, setCurrentWorkspaceObj] = useState<WorkspaceType>(mockDataSnapshots[8].workspace);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');


  const handleSendMessage = async (message: ChatMessage) => {

    setMessages((prevMessages) => [...prevMessages, message]);

    try {
      let finalContent = '';
      for await (const update of botApi.streamNessage()) {
        const lines = update.data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            try {
              const data = JSON.parse(jsonStr);
              if (data.token) {
                setStreamingMessage(prev => prev + data.token + ' ');
                finalContent += ' ' + data.token;
              }
              if (data.status) {
                const newStatusMessage = data.status;
                const currentContent = currentWorkspaceObj.content;
                const newContent = { ...currentContent, progressUpdates: [newStatusMessage] };
                setCurrentWorkspaceObj((prev) => ({ ...prev, content: newContent }));
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
      setMessages((prevMessages) => [...prevMessages, finalMessage]);

    } catch (error) {
      console.error('Error streaming message:', error);
    } finally {
      setStreamingMessage('');
      // Use setTimeout to ensure focus happens after the DOM updates
    }
  };

  return (
    <div className="h-screen flex flex-col">

      <div className="flex-1 min-h-0 pt-14">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Chat Rail (cols 1-3) */}
          <div key="chat-rail" className="col-span-3 h-full overflow-hidden">
            <Chat
              messages={messages}
              streamingMessage={streamingMessage}
              onNewMessage={handleSendMessage}
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
              <Workspace workspace={currentWorkspaceObj} />
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
