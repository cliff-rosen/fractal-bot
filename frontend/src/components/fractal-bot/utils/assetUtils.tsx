import { FileType, DataType } from '@/types/asset';
import { DocumentIcon, DocumentTextIcon, EnvelopeIcon, ListBulletIcon, TableCellsIcon, PhotoIcon, MusicalNoteIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

export const getAssetColor = (fileType: FileType, dataType: DataType) => {
    // Prioritize data type for special cases
    if (dataType !== DataType.UNSTRUCTURED) {
        switch (dataType) {
            case DataType.EMAIL_LIST:
            case DataType.GENERIC_LIST:
                return 'text-blue-500';
            case DataType.GENERIC_TABLE:
                return 'text-green-500';
            default:
                break;
        }
    }

    // Fall back to file type
    switch (fileType) {
        case FileType.TXT:
            return 'text-gray-500';
        case FileType.CSV:
        case FileType.JSON:
            return 'text-green-500';
        case FileType.PDF:
            return 'text-red-500';
        case FileType.PNG:
        case FileType.JPG:
        case FileType.JPEG:
        case FileType.GIF:
            return 'text-purple-500';
        case FileType.DOC:
        case FileType.DOCX:
            return 'text-blue-500';
        default:
            return 'text-gray-400';
    }
};

export const getAssetIcon = (fileType: FileType, dataType: DataType) => {
    // Prioritize data type for special cases
    if (dataType !== DataType.UNSTRUCTURED) {
        switch (dataType) {
            case DataType.EMAIL_LIST:
            case DataType.GENERIC_LIST:
                return <ListBulletIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
            case DataType.GENERIC_TABLE:
                return <TableCellsIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
            default:
                break;
        }
    }

    // Fall back to file type
    switch (fileType) {
        case FileType.TXT:
            return <DocumentTextIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
        case FileType.CSV:
        case FileType.JSON:
            return <TableCellsIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
        case FileType.PDF:
            return <DocumentIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
        case FileType.PNG:
        case FileType.JPG:
        case FileType.JPEG:
        case FileType.GIF:
            return <PhotoIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
        case FileType.DOC:
        case FileType.DOCX:
            return <DocumentTextIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
        case FileType.MP3:
        case FileType.WAV:
            return <MusicalNoteIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
        case FileType.MP4:
            return <VideoCameraIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
        default:
            return <DocumentIcon className={`h-6 w-6 ${getAssetColor(fileType, dataType)}`} />;
    }
}; 