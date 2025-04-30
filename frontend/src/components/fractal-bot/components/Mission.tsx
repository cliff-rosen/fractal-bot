import React, { useState } from 'react';
import { useFractalBot } from '@/context/FractalBotContext';

interface MissionProps {
    className?: string;
}

export default function Mission({
    className = ''
}: MissionProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const {
        state,
        generateWorkflow,
        resetState
    } = useFractalBot();

    const mission = state.currentMission;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
            case 'current':
                return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            case 'failed':
                return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            case 'ready':
                return 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20';
            case 'pending':
                return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
            default:
                return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'COMPLETED';
            case 'current':
                return 'IN PROGRESS';
            case 'failed':
                return 'FAILED';
            case 'ready':
                return 'READY';
            default:
                return 'PENDING';
        }
    };

    const handleGenerateWorkflowClick = async () => {
        setIsGenerating(true);
        try {
            await generateWorkflow();
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
                            {mission.goal}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(mission.status)} dark:bg-opacity-20`}>
                            {getStatusText(mission.status)}
                        </span>
                        <button
                            onClick={handleGenerateWorkflowClick}
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
                            onClick={resetState}
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-6 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-gray-50 dark:bg-[#252b3b] p-4 rounded-lg">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inputs & Resources</h3>
                        <div className="mt-4 grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Required Inputs</h4>
                                <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                                    {mission.inputs.map((input: string) => (
                                        <li key={input} className="flex items-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2"></span>
                                            {input}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Resources</h4>
                                <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                                    {mission.resources.map((resource: string) => (
                                        <li key={resource} className="flex items-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2"></span>
                                            {resource}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
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

            <div className="mt-6 p-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Success Criteria</h3>
                <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                    {mission.success_criteria.map((criterion: string) => (
                        <li key={criterion} className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-2"></span>
                            {criterion}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
} 