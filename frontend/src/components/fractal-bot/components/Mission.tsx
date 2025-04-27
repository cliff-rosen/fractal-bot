import React from 'react';
import type { Mission as MissionType } from '../types/index';

interface MissionProps {
    className?: string;
    mission: MissionType;
}

export default function Mission({ className = '', mission }: MissionProps) {
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(mission.status)} dark:bg-opacity-20`}>
                        {getStatusText(mission.status)}
                    </span>
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