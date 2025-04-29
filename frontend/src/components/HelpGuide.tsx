import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { HelpCircle, X } from 'lucide-react';

const sections = [
    {
        id: 'overview',
        title: 'Overview',
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What is FractalBot?</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        FractalBot is a new kind of AI assistant that combines the flexibility of natural language interaction with the rigor of structured workflows. Unlike traditional tools, it:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Architects Before Executing:</strong> Unlike regular chatbots that jump straight to answers, FractalBot first designs a structured workflow to achieve your goal</li>
                        <li><strong>Recursively Refines:</strong> Unlike static workflow tools, FractalBot dynamically creates and executes steps as needed, adapting to the task's requirements</li>
                        <li><strong>Maintains Context:</strong> While executing workflows, FractalBot preserves the big picture, ensuring each step contributes to the overall mission</li>
                        <li><strong>Verifies Progress:</strong> At each stage, FractalBot checks success criteria, ensuring the work meets quality standards before proceeding</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">How is it Different?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Compared to Chatbots:</h5>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                                <li>Doesn't just answer questions - creates structured solutions</li>
                                <li>Maintains clear success criteria and verification</li>
                                <li>Organizes work into stages with clear dependencies</li>
                                <li>Manages data flow and asset tracking</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Compared to Workflow Tools:</h5>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                                <li>Designs workflows dynamically based on the task</li>
                                <li>Creates steps recursively during execution</li>
                                <li>Uses natural language for interaction</li>
                                <li>Adapts to changing requirements</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Benefits</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Structured Yet Flexible:</strong> Combines the rigor of workflows with the adaptability of AI</li>
                        <li><strong>Clear Progress Tracking:</strong> Each stage and step has defined success criteria</li>
                        <li><strong>Data Management:</strong> Systematic handling of inputs, outputs, and intermediate results</li>
                        <li><strong>Quality Assurance:</strong> Built-in verification at multiple levels</li>
                        <li><strong>Natural Interaction:</strong> Conversational interface while maintaining structure</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'core-concepts',
        title: 'Core Concepts',
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">1. Basics of Workflows</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Workflows are the fundamental structure for organizing and executing tasks in FractalBot:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Stages:</strong> Major phases that define the workflow's architecture, created during workflow initiation</li>
                        <li><strong>Steps:</strong> Individual tasks created during the recursive execution phase within each stage</li>
                        <li><strong>Flow:</strong> Sequential progression through stages, with clear dependencies and data requirements</li>
                        <li><strong>Data Flow:</strong> Systematic movement of assets between stages and steps, following defined inputs and outputs</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">2. FractalBot Schema</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        The hierarchical structure that defines how FractalBot operates:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Mission:</strong> Top-level container
                            <ul className="list-disc pl-6 mt-2">
                                <li>Goal: Specific objective to achieve</li>
                                <li>Inputs: Required data objects to start</li>
                                <li>Outputs: Deliverables to be produced</li>
                                <li>Success Criteria: Measurable conditions for completion</li>
                            </ul>
                        </li>
                        <li><strong>Workflow:</strong> Collection of stages
                            <ul className="list-disc pl-6 mt-2">
                                <li>Stages: Major phases of execution</li>
                                <li>Assets: Data objects used throughout</li>
                            </ul>
                        </li>
                        <li><strong>Stage:</strong> Major phase
                            <ul className="list-disc pl-6 mt-2">
                                <li>Inputs: Required data from previous stages</li>
                                <li>Outputs: Data produced for next stages</li>
                                <li>Success Criteria: Conditions for stage completion</li>
                                <li>Steps: Individual tasks within the stage</li>
                            </ul>
                        </li>
                        <li><strong>Step:</strong> Individual task
                            <ul className="list-disc pl-6 mt-2">
                                <li>Tool: Specialized function assigned during execution</li>
                                <li>Inputs: Required data for the tool</li>
                                <li>Outputs: Data produced by the tool</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">3. Resources and Assets</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        The data and capabilities that enable workflow execution:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Assets:</strong> Data objects that flow through the workflow
                            <ul className="list-disc pl-6 mt-2">
                                <li>Types: Various data formats and structures</li>
                                <li>Status: Tracks state (pending, ready, archived)</li>
                                <li>Versioning: Maintains history of changes</li>
                                <li>Usage: Tracks where and how assets are used</li>
                            </ul>
                        </li>
                        <li><strong>Tools:</strong> Specialized functions for processing data
                            <ul className="list-disc pl-6 mt-2">
                                <li>Input Schema: Defines required input structure</li>
                                <li>Output Schema: Defines produced output structure</li>
                                <li>Configuration: Settings for tool operation</li>
                            </ul>
                        </li>
                        <li><strong>Resources:</strong> General capabilities needed
                            <ul className="list-disc pl-6 mt-2">
                                <li>System Access: Required permissions and connections</li>
                                <li>External Services: APIs and third-party integrations</li>
                                <li>Processing Power: Computational requirements</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">4. Mission Lifecycle</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        The complete process from mission creation to completion:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Mission Definition:</strong> Setting mission goals, inputs, outputs, and success criteria</li>
                        <li><strong>Workflow Architecture:</strong> Designing stages and their relationships</li>
                        <li><strong>Stage Execution:</strong> Recursive creation and execution of steps</li>
                        <li><strong>Verification:</strong> Validation of success criteria at each stage</li>
                        <li><strong>Completion:</strong> Final delivery and archival of mission outputs</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'lifecycle',
        title: 'Mission Lifecycle',
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">1. Mission Proposal</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        The journey begins with a mission proposal:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Describe your task in natural language</li>
                        <li>FractalBot analyzes requirements</li>
                        <li>Proposes a structured mission plan</li>
                        <li>Identifies needed inputs and resources</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">2. Workflow Architecture</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        The mission is structured into stages:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Defines major phases of the mission</li>
                        <li>Establishes stage dependencies and flow</li>
                        <li>Identifies stage inputs and outputs</li>
                        <li>Sets up stage-level success criteria</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">3. Stage Execution</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Each stage is executed through steps:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Breaks down stage into specific steps</li>
                        <li>Assigns appropriate tools to steps</li>
                        <li>Manages step-level assets and data</li>
                        <li>Provides real-time step status updates</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">4. Completion</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        The mission concludes with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Verification of success criteria</li>
                        <li>Delivery of final outputs</li>
                        <li>Archiving of completed assets</li>
                        <li>Summary of mission results</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'interface',
        title: 'Interface Guide',
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Chat Interface</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Your main interaction point with FractalBot:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Describe tasks in natural language</li>
                        <li>Review mission proposals</li>
                        <li>Monitor progress updates</li>
                        <li>Provide feedback and guidance</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Workspace</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        The central area for mission management:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>View current mission details</li>
                        <li>Track workflow progress</li>
                        <li>Monitor asset status</li>
                        <li>Access tool interfaces</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tools & Assets Panel</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Manage your mission resources:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Access available tools</li>
                        <li>View and manage assets</li>
                        <li>Configure tool settings</li>
                        <li>Monitor resource usage</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'best-practices',
        title: 'Best Practices',
        content: (
            <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Mission Planning</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Be specific about your goals and requirements</li>
                        <li>Clearly define success criteria</li>
                        <li>Identify all necessary inputs upfront</li>
                        <li>Consider resource availability</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Workflow Management</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Review each stage before proceeding</li>
                        <li>Monitor asset status regularly</li>
                        <li>Keep track of tool outputs</li>
                        <li>Document any issues or changes</li>
                    </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Communication</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Provide clear feedback to FractalBot</li>
                        <li>Ask for clarification when needed</li>
                        <li>Report issues promptly</li>
                        <li>Share relevant context</li>
                    </ul>
                </div>
            </div>
        )
    }
];

export const HelpGuide: React.FC = () => {
    const [activeSection, setActiveSection] = useState('overview');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="inline-flex items-center justify-center rounded-md w-8 h-8
                             text-gray-400 hover:text-gray-500 hover:bg-gray-100
                             dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                             transition-colors"
                    aria-label="Help"
                >
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
                <DialogClose asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4
                                 inline-flex items-center justify-center rounded-md w-8 h-8
                                 text-gray-400 hover:text-gray-500 hover:bg-gray-100
                                 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogClose>
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">FractalBot Help Guide</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Navigation - Narrow TOC */}
                    <div className="w-48 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                        <nav className="p-4 space-y-1">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                                              ${activeSection === section.id
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area - Wider */}
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
                        <div className="max-w-4xl mx-auto p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                {sections.find(s => s.id === activeSection)?.title}
                            </h2>
                            <div className="prose dark:prose-invert max-w-none">
                                {sections.find(s => s.id === activeSection)?.content}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 