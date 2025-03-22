# Fractal Bot: Collaborative Problem-Solving System

## Overview

The Fractal Bot system enables deep collaboration between users and an AI assistant to solve complex questions through a pipeline-oriented approach to workflow development and execution. The system is built as a React-based web application with a modern, responsive UI.

## Core Concepts

1. **Collaborative Chat Interface**
   - User and bot work together in a chat panel
   - Natural conversation to develop and refine the approach
   - Bot provides guidance while user maintains control
   - Real-time feedback and clarification
   - Support for action buttons to trigger specific workflows
   - Message history with timestamps and role indicators
   - Clear decision points between major workflow steps
   - User approval required for workflow progression
   - User can intervene at any point to:
     - Add new information or files
     - Revise the original question
     - Request additional checks or analysis
     - Redirect the workflow
     - Provide feedback on intermediate results

2. **Specialized Agent System**
   - Each agent is a specialized worker with a specific task
   - Agents are launched in sequence to build up information
   - Agent categories include:
     - Data Collection (e.g., Song List Agent)
     - Information Retrieval (e.g., Lyrics Retrieval Agent)
     - Analysis and Processing (e.g., Analysis Agent)
   - Each agent:
     - Has a clear, single responsibility
     - Produces output for the next agent
     - Reports its status and progress
     - Can be monitored and managed
     - Takes input from:
       - User instructions
       - Bot guidance
       - Existing assets
     - Produces output as:
       - Status updates
       - New assets
       - Final results

3. **Pipeline Workflow Development**
   - Start with high-level plan (e.g., 3-4 specialized agents)
   - Sequential execution of specialized tasks:
     ```
     User Question
         ↓
     Agent 1 (Specialized Task)
         ↓
     User Approval/Intervention
         ↓
     Agent 2 (Next Specialized Task)
         ↓
     User Approval/Intervention
         ↓
     Agent 3 (Final Task)
         ↓
     Results
     ```
   - Each agent builds on previous results
   - Natural progression from data collection to analysis
   - Workflow phases:
     - Setup: Initial planning and agent selection
     - Execution: Sequential agent execution
     - Review: Evaluating results and deciding next steps
   - User control at key decision points
   - Error handling at each stage
   - Flexible redirection at any point

4. **Visual Workspace**
   - Three-column layout:
     - Left Column: Chat Interface
       - Real-time conversation with the AI assistant
       - Message history display
       - Input area for new messages
       - Action buttons for workflow progression
     - Middle Column: Assets Panel (Shared Project Folder)
       - Display of all information assets
       - File upload capabilities
       - Asset organization and management
       - Asset metadata display
       - Accessible to all collaborators:
         - User
         - Bot
         - Active agents
       - Represents current workflow state
       - Final state contains solution
     - Right Column: Agents Panel
       - Display of active and completed agents
       - Agent status and progress
       - Agent selection interface
   - Modern UI with dark/light mode support
   - Responsive layout with proper spacing and borders
   - Backdrop blur effects for depth
   - Glass-morphism design elements

5. **Asset Management**
   - Support for multiple asset types:
     - Text files
     - Spreadsheets
     - PDFs
     - General data
   - Asset metadata tracking:
     - Timestamp
     - File size
     - File type
     - Custom tags
     - Agent associations
     - Creator (user/bot/agent)
   - Asset operations:
     - Upload
     - Delete
     - View
     - Organize
     - Edit (by all collaborators)
   - Asset readiness states:
     - Processing
     - Ready
     - Error
   - Asset relationships between agents
   - Shared access and modification rights
   - Version tracking of changes

6. **Information Asset Building**
   - Each agent generates specific information
   - Information flows through the pipeline
   - Assets can include:
     - Collected data
     - Retrieved information
     - Analysis outputs
     - Intermediate results
     - User contributions
     - Bot insights
   - Progressive building of information
   - Asset linking to specific agents
   - Clear asset ownership and responsibility
   - Collaborative editing and review
   - Final state represents complete solution

## Example Flow

1. **Initial Setup**
   - User presents question or task
   - Bot analyzes requirements
   - Bot proposes sequence of specialized agents
   - User confirms or modifies plan
   - System prepares first agent
   - Initial assets are created

2. **Workflow Execution**
   - Bot launches first specialized agent
   - Agent performs its specific task
   - Results are captured as assets
   - User reviews and approves
   - User can intervene to:
     - Add new information
     - Modify direction
     - Request additional analysis
   - Next agent is launched
   - Process continues until completion

3. **Review and Refinement**
   - Results are presented to user
   - User can request modifications
   - Bot can suggest next steps
   - Process continues until satisfied
   - Workflow is documented
   - Final assets represent solution

## Key Benefits

1. **Clear Task Specialization**
   - Each agent has a specific role
   - Clear progression of tasks
   - Predictable workflow
   - Easy to understand and follow

2. **User Control**
   - Clear decision points
   - Explicit approval required
   - Easy to modify approach
   - Transparent progress
   - Intervention at any point
   - Direct asset manipulation

3. **Information Organization**
   - Clear tracking of progress
   - Easy access to all generated assets
   - Building blocks for solution
   - Asset-agent relationships
   - Shared project workspace
   - Collaborative editing

4. **Agent Integration**
   - Specialized agents for specific tasks
   - Sequential workflow
   - Clear input/output relationships
   - Status tracking and monitoring
   - Asset-based communication
   - Result-driven execution
