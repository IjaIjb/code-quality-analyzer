import React, { useRef } from 'react';
import {
  Download,
  Save,
  FolderOpen,
  FileDown,
  Printer,
  Copy,
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
      <div className='fixed top-4 right-4 z-50 space-y-2'>
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
      <div className='mt-6 flex justify-center gap-3 flex-wrap'>
        <div className='relative'>
          <button
            onClick={onToggleExportMenu}
            disabled={analyzedFiles.length === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              analyzedFiles.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
            }`}
          >
            <Download className='w-4 h-4' />
            Export Results
          </button>

          {showExportMenu && (
            <div className='absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10 min-w-48'>
              <button
                onClick={onExportJSON}
                className='w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700'
              >
                <FileDown className='w-4 h-4' />
                Export as JSON
              </button>
              <button
                onClick={onExportReport}
                className='w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700'
              >
                <Printer className='w-4 h-4' />
                Export Report
              </button>
              <button
                onClick={onCopyToClipboard}
                className='w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700'
              >
                <Copy className='w-4 h-4' />
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
          <Save className='w-4 h-4' />
          Save Session
        </button>

        <button
          onClick={onToggleLoadDialog}
          className='px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl'
        >
          <FolderOpen className='w-4 h-4' />
          Load Session
        </button>
      </div>

      {/* Save Session Dialog */}
      {showSaveDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-96'>
            <h3 className='text-lg font-semibold mb-4'>Save Analysis Session</h3>
            <input
              type='text'
              value={sessionName}
              onChange={(e) => onSessionNameChange(e.target.value)}
              placeholder='Enter session name...'
              className='w-full p-3 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <div className='flex gap-3'>
              <button
                onClick={onSaveSession}
                className='flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
              >
                Save
              </button>
              <button
                onClick={() => {
                  onToggleSaveDialog();
                  onSessionNameChange('');
                }}
                className='flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Session Dialog */}
      {showLoadDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-96 max-h-96 overflow-y-auto'>
            <h3 className='text-lg font-semibold mb-4'>Load Analysis Session</h3>

            <div className='mb-4'>
              <button
                onClick={() => sessionInputRef.current?.click()}
                className='w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors'
              >
                Import Session File
              </button>
              <input
                ref={sessionInputRef}
                type='file'
                accept='.json'
                onChange={handleSessionInputChange}
                className='hidden'
              />
            </div>

            {savedSessions.length > 0 && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-slate-700'>Saved Sessions:</h4>
                {savedSessions.map((session) => (
                  <div
                    key={session.id}
                    className='flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50'
                  >
                    <div>
                      <div className='font-medium text-slate-800'>{session.name}</div>
                      <div className='text-xs text-slate-500'>
                        {new Date(session.timestamp).toLocaleString()} • {session.files.length} files
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => onLoadSession(session)}
                        className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors'
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className='mt-4'>
              <button
                onClick={onToggleLoadDialog}
                className='w-full px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors'
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
