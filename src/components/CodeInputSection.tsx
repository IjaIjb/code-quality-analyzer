import React from 'react';
import { FileText } from 'lucide-react';

interface CodeInputSectionProps {
    code: string;
    isAnalyzing: boolean;
    onCodeChange: (code: string) => void;
    onAnalyzeCode: () => void;
}

const CodeInputSection: React.FC<CodeInputSectionProps> = ({
    code,
    isAnalyzing,
    onCodeChange,
    onAnalyzeCode
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Manual Code Input
                </h2>
                <button
                    onClick={onAnalyzeCode}
                    disabled={isAnalyzing || !code.trim()}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${isAnalyzing || !code.trim()
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30'
                        }`}
                >
                    {isAnalyzing ? '🔍 Analyzing...' : '🚀 Analyze Code'}
                </button>
            </div>

            <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                className="w-full h-96 p-4 border-2 border-slate-200 rounded-lg font-mono text-sm resize-none outline-none transition-colors bg-slate-50 leading-relaxed focus:border-blue-400"
                placeholder="Paste your React component code here..."
                disabled={isAnalyzing}
            />

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                💡 <strong>Tip:</strong> Paste your React/TypeScript component
                code above and click "Analyze Code" to get instant feedback!
            </div>
        </div>
    );
};

export default CodeInputSection;