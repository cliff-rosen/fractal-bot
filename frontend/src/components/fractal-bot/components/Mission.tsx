import React from 'react';
import type { Mission as MissionType } from '../types';

interface MissionProps {
    className?: string;
    mission: MissionType;
}

export default function Mission({ className = '', mission }: MissionProps) {
    const getStatusColor = (status: MissionType['status']) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-700 bg-emerald-100';
            case 'current':
                return 'text-blue-700 bg-blue-100';
            case 'failed':
                return 'text-red-700 bg-red-100';
            default:
                return 'text-gray-700 bg-gray-100';
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
        <div className={className}>
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Mission</h2>
                    <h1 className="text-2xl font-semibold text-gray-900 mt-1">{mission.title}</h1>
                    <p className="mt-3 text-gray-600 leading-relaxed">
                        {mission.description}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Goal:</span> {mission.goal}
                    </p>
                </div>
                <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(mission.status)}`}>
                        {getStatusText(mission.status)}
                    </span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inputs</h3>
                    <ul className="mt-2 space-y-1 text-gray-600">
                        {mission.inputs
                            .map(input => (
                                <li key={input} className="flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                                    {input}
                                </li>
                            ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outputs</h3>
                    <ul className="mt-2 space-y-1 text-gray-600">
                        {mission.outputs
                            .map(output => (
                                <li key={output} className="flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                                    {output}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 