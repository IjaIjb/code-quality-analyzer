import React, { useRef } from 'react';
import {
  Download,
  Save,
  FolderOpen,
  FileDown,
  Printer,
  Copy,
  GitCompare,
  // X
} from 'lucide-react';
import { AnalyzedFile, AnalysisSession } from '../types';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ExportSessionManagerProps {
  analyzedFiles: AnalyzedFile[];
  showExportMenu: boolean;
  showSaveDialog: boolean;
  showLoadDialog: boolean;
  sessionName: string;
  savedSessions: AnalysisSession[];
  notifications: Notification[];
  onToggleExportMenu: () => void;
  onToggleSaveDialog: () => void;
  onToggleLoadDialog: () => void;
  onSessionNameChange: (name: string) => void;
  onSetShowComparisonView: (show: boolean) => void;
  onSaveSession: () => void;
  onLoadSession: (session: AnalysisSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportJSON: () => void;
  onExportReport: () => void;
  onCopyToClipboard: () => void;
  onImportSession: (file: File) => void;
}

const ExportSessionManager: React.FC<ExportSessionManagerProps> = ({
  analyzedFiles,
  showExportMenu,
  showSaveDialog,
  showLoadDialog,
  sessionName,
  savedSessions,
  notifications,
  onToggleExportMenu,
  onToggleSaveDialog,
  onToggleLoadDialog,
  onSessionNameChange,
  onSetShowComparisonView,
  onSaveSession,
  onLoadSession,
  onDeleteSession,
  onExportJSON,
  onExportReport,
  onCopyToClipboard,
  onImportSession,
}) => {
  const sessionInputRef = useRef<HTMLInputElement>(null);

  const handleSessionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportSession(e.target.files[0]);
    }
  };

  return (
    <>
      {/* Notifications */}
      <div className="fixed z-50 space-y-2 top-4 right-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Export Controls */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <div className="relative">
          <button
            onClick={onToggleExportMenu}
            disabled={analyzedFiles.length === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              analyzedFiles.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Results
          </button>

          {showExportMenu && (
            <div className="absolute right-0 z-10 py-2 mt-2 bg-white border rounded-lg shadow-xl top-full border-slate-200 min-w-48">
              <button
                onClick={onExportJSON}
                className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-slate-50 text-slate-700"
              >
                <FileDown className="w-4 h-4" />
                Export as JSON
              </button>
              <button
                onClick={onExportReport}
                className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-slate-50 text-slate-700"
              >
                <Printer className="w-4 h-4" />
                Export Report
              </button>
              <button
                onClick={onCopyToClipboard}
                className="flex items-center w-full gap-2 px-4 py-2 text-left hover:bg-slate-50 text-slate-700"
              >
                <Copy className="w-4 h-4" />
                Copy Summary
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onToggleSaveDialog}
          disabled={analyzedFiles.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
            analyzedFiles.length === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
          }`}
        >
          <Save className="w-4 h-4" />
          Save Session
        </button>

        <button
          onClick={onToggleLoadDialog}
          className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-purple-500 rounded-lg shadow-lg hover:bg-purple-600 hover:shadow-xl"
        >
          <FolderOpen className="w-4 h-4" />
          Load Session
        </button>

        <button
          onClick={() => onSetShowComparisonView(true)}
          disabled={analyzedFiles.length < 2}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
            analyzedFiles.length < 2
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg hover:shadow-xl'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          Compare Files
        </button>
      </div>

      {/* Save Session Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-xl w-96">
            <h3 className="mb-4 text-lg font-semibold">
              Save Analysis Session
            </h3>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => onSessionNameChange(e.target.value)}
              placeholder="Enter session name..."
              className="w-full p-3 mb-4 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={onSaveSession}
                className="flex-1 px-4 py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  onToggleSaveDialog();
                  onSessionNameChange('');
                }}
                className="flex-1 px-4 py-2 transition-colors rounded-lg bg-slate-300 text-slate-700 hover:bg-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Session Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 overflow-y-auto bg-white rounded-xl w-96 max-h-96">
            <h3 className="mb-4 text-lg font-semibold">
              Load Analysis Session
            </h3>

            <div className="mb-4">
              <button
                onClick={() => sessionInputRef.current?.click()}
                className="w-full p-3 transition-colors border-2 border-dashed rounded-lg border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600"
              >
                Import Session File
              </button>
              <input
                ref={sessionInputRef}
                type="file"
                accept=".json"
                onChange={handleSessionInputChange}
                className="hidden"
              />
            </div>

            {savedSessions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700">
                  Saved Sessions:
                </h4>
                {savedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg border-slate-200 hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {session.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(session.timestamp).toLocaleString()} •{' '}
                        {session.files.length} files
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLoadSession(session)}
                        className="px-3 py-1 text-sm text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="px-3 py-1 text-sm text-white transition-colors bg-red-500 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={onToggleLoadDialog}
                className="w-full px-4 py-2 transition-colors rounded-lg bg-slate-300 text-slate-700 hover:bg-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportSessionManager;
