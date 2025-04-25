import type { Stage, Step } from '../../types';
import { mockStages } from '../../mocks/data';

export type { Stage, Step };
export { mockStages };

export const getStatusClass = (status: Stage['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        case 'current':
            return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        case 'failed':
            return 'bg-red-50 text-red-600 border border-red-100';
        default:
            return 'bg-gray-50 text-gray-400 border border-gray-200';
    }
}; 