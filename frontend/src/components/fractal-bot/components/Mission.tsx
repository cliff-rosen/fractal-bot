import React, { useState } from 'react';
import type { Mission as MissionType, Tool } from '../types/index';
import { botApi } from '@/lib/api/botApi';
import { getDataFromLine } from '../utils/utils';

interface MissionProps {
    className?: string;
    mission: MissionType;
    selectedTools: Tool[];
    onStatusUpdate: (status: string) => void;
    onWorkflowGenerated: (workflow: any) => void;
    onTokenUpdate: (token: string) => void;
    onReset: () => void;
}

export default function Mission({
    className = '',
    mission,
    selectedTools,
    onStatusUpdate,
    onWorkflowGenerated,
    onTokenUpdate,
    onReset
}: MissionProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const getStatusColor = (status: MissionType['status']) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
            case 'current':
                return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            case 'failed':
                return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            default:
                return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
        }
    };

    const getStatusText = (status: MissionType['status']) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'current':
                return 'In Progress';
            case 'failed':
                return 'Failed';
            default:
                return 'Pending';
        }
    };

    const handleGenerateWorkflow = async () => {
        setIsGenerating(true);
        try {
            // Stream the workflow generation
            for await (const update of botApi.streamWorkflow(
                mission,
                selectedTools
            )) {
                const lines = update.data.split('\n');
                for (const line of lines) {
                    const data = getDataFromLine(line);

                    // Handle status updates
                    if (data.status) {
                        onStatusUpdate(data.status);
                    }

                    // Handle the final workflow
                    if (data.steps_generator) {
                        console.log("data.steps_generator", data.steps_generator);
                        onWorkflowGenerated(data.steps_generator);
                    }

                    // Handle the token
                    if (data.token) {
                        onTokenUpdate(data.token);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating workflow:', error);
            onStatusUpdate(`Error: ${error}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`dark:bg-[#1e2330] ${className}`}>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Mission</h2>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mt-1">{mission.title}</h1>
                        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                            {mission.description}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Goal:</span> {mission.goal}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(mission.status)} dark:bg-opacity-20`}>
                            {getStatusText(mission.status)}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerateWorkflow}
                                disabled={isGenerating}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isGenerating
                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                                    : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </span>
                                ) : (
                                    'Generate Workflow'
                                )}
                            </button>
                            <button
                                onClick={onReset}
                                className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 p-6 border-t border-gray-100 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-[#252b3b] p-4 rounded-lg">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inputs</h3>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                        {mission.inputs.map((input: string) => (
                            <li key={input} className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2"></span>
                                {input}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-50 dark:bg-[#252b3b] p-4 rounded-lg">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Outputs</h3>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                        {mission.outputs.map((output: string) => (
                            <li key={output} className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2"></span>
                                {output}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 