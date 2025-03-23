import { AssetType } from '../types/state';
import { DocumentIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export const getAssetColor = (type: AssetType) => {
    switch (type) {
        case AssetType.TEXT:
            return 'bg-blue-100 dark:bg-blue-900';
        case AssetType.DATA:
            return 'bg-purple-100 dark:bg-purple-900';
        case AssetType.PDF:
            return 'bg-red-100 dark:bg-red-900';
        case AssetType.SPREADSHEET:
            return 'bg-green-100 dark:bg-green-900';
        case AssetType.IMAGE:
            return 'bg-pink-100 dark:bg-pink-900';
        case AssetType.CODE:
            return 'bg-orange-100 dark:bg-orange-900';
        case AssetType.DOCUMENT:
            return 'bg-gray-100 dark:bg-gray-900';
        default:
            return 'bg-gray-100 dark:bg-gray-900';
    }
};

export const getAssetIcon = (type: AssetType) => {
    switch (type) {
        case AssetType.TEXT:
            return <DocumentTextIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />;
        case AssetType.DATA:
            return <DocumentIcon className="h-6 w-6 text-purple-500 dark:text-purple-400" />;
        case AssetType.PDF:
            return <DocumentIcon className="h-6 w-6 text-red-500 dark:text-red-400" />;
        case AssetType.SPREADSHEET:
            return <DocumentIcon className="h-6 w-6 text-green-500 dark:text-green-400" />;
        case AssetType.IMAGE:
            return <DocumentIcon className="h-6 w-6 text-pink-500 dark:text-pink-400" />;
        case AssetType.CODE:
            return <DocumentIcon className="h-6 w-6 text-orange-500 dark:text-orange-400" />;
        case AssetType.DOCUMENT:
            return <DocumentIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
        default:
            return <DocumentIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />;
    }
}; 