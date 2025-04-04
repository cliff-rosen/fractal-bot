import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Asset } from '@/types/asset';
import { getAssetContent } from '@/lib/utils/assets/assetUtils';

interface GenericListViewProps {
    asset: Asset;
}

export const GenericListView: React.FC<GenericListViewProps> = ({ asset }) => {
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    const items = getAssetContent(asset) as any[] | null;
    const totalPages = items ? Math.ceil(items.length / itemsPerPage) : 0;
    const currentItems = items ? items.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    ) : [];

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
    };

    const handleCloseItem = () => {
        setSelectedItem(null);
    };

    const renderItem = (item: any) => {
        // If the item is an object, display its properties
        if (typeof item === 'object' && item !== null) {
            return (
                <div className="space-y-2">
                    {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        // If it's a primitive value, display it directly
        return <span className="text-gray-900 dark:text-gray-100">{String(item)}</span>;
    };

    return (
        <div className="h-full flex flex-col">
            {/* List View */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                    {currentItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleItemClick(item)}
                            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                        >
                            {renderItem(item)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Item Details</h3>
                            <button
                                onClick={handleCloseItem}
                                className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {renderItem(selectedItem)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 