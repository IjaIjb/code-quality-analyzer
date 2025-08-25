import React, { useRef, useCallback } from 'react';
import { Upload, Plus, File, X } from 'lucide-react';
import { AnalyzedFile } from '../types';

interface FileUploadSectionProps {
    analyzedFiles: AnalyzedFile[];
    selectedFileIndex: number;
    isAnalyzing: boolean;
    isDragOver: boolean;
    onFileUpload: (files: FileList) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileSelect: (index: number) => void;
    onFileRemove: (index: number) => void;
    setIsDragOver: (isDragOver: boolean) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
    analyzedFiles,
    selectedFileIndex,
    isAnalyzing,
    isDragOver,
    onFileUpload,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
    onFileRemove,
    setIsDragOver
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                onFileUpload(e.target.files);
            }
        },
        [onFileUpload]
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Files
                </h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isAnalyzing
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                >
                    <Plus className="w-4 h-4" />
                    Browse Files
                </button>
            </div>

            {/* Drag & Drop Area */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 bg-slate-50'
                    }`}
            >
                <Upload
                    className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-slate-400'
                        }`}
                />
                <p className="text-slate-600 mb-2">
                    Drag & drop your React files here
                </p>
                <p className="text-sm text-slate-500">
                    Supports .tsx, .ts, .jsx, .js files
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".tsx,.ts,.jsx,.js"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isAnalyzing}
            />

            {/* File List */}
            {analyzedFiles.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">
                        Analyzed Files:
                    </h3>
                    <div className="space-y-2">
                        {analyzedFiles.map((file, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${selectedFileIndex === index
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                onClick={() => onFileSelect(index)}
                            >
                                <div className="flex items-center gap-3">
                                    <File className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {file.result.summary.total} issues
                                    </span>
                                </div>
                                {file.name !== 'Manual Input' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFileRemove(index);
                                        }}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                        disabled={isAnalyzing}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadSection;