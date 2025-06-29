import React, { useState, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle, XCircle, Code, FileText, TrendingUp, Upload, File, X, Plus } from 'lucide-react';

// Types
interface CodeIssue {
    id: string;
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    line: number;
    column: number;
    rule: string;
    suggestion?: string;
}

interface AnalysisResult {
    issues: CodeIssue[];
    metrics: CodeMetrics;
    summary: IssueSummary;
}

interface CodeMetrics {
    complexity: number;
    maintainability: number;
    testability: number;
    performance: number;
}

interface IssueSummary {
    errors: number;
    warnings: number;
    info: number;
    total: number;
}

interface AnalyzedFile {
    name: string;
    content: string;
    result: AnalysisResult;
}

// Analyzer implementation
class ReactCodeAnalyzer {
    public analyzeCode(code: string): AnalysisResult {
        const lines = code.split('\n');
        const issues: CodeIssue[] = [];

        issues.push(...this.checkBasicReactRules(code, lines));
        issues.push(...this.checkTypeScriptRules(code, lines));
        issues.push(...this.checkAccessibilityRules(code, lines));
        issues.push(...this.checkPerformanceRules(code, lines));
        issues.push(...this.checkCodeQualityRules(code, lines));

        const metrics = this.calculateMetrics(code, issues);
        const summary = this.generateSummary(issues);

        return { issues, metrics, summary };
    }

    private checkBasicReactRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            if (trimmedLine.includes('({ ') && !code.includes('PropTypes') && !code.includes('interface')) {
                issues.push({
                    id: `prop-types-${lineNum}`,
                    type: 'warning',
                    category: 'Type Safety',
                    message: 'Missing PropTypes validation or TypeScript interface',
                    line: lineNum,
                    column: line.indexOf('({ '),
                    rule: 'react/prop-types',
                    suggestion: 'Add PropTypes validation or use TypeScript interfaces'
                });
            }

            if (trimmedLine.includes('useEffect') && !lines[index + 1]?.includes('[]') && !lines[index + 2]?.includes('[]')) {
                const effectContent = lines.slice(index, index + 5).join('\n');
                if (effectContent.includes('fetch') || effectContent.includes('api')) {
                    issues.push({
                        id: `missing-deps-${lineNum}`,
                        type: 'error',
                        category: 'React Hooks',
                        message: 'Potential missing dependency in useEffect',
                        line: lineNum,
                        column: 0,
                        rule: 'react-hooks/exhaustive-deps',
                        suggestion: 'Review and add missing dependencies to dependency array'
                    });
                }
            }

            if (trimmedLine.includes('.map(') && !trimmedLine.includes('key=')) {
                issues.push({
                    id: `missing-key-${lineNum}`,
                    type: 'error',
                    category: 'React',
                    message: 'Missing key prop in list rendering',
                    line: lineNum,
                    column: line.indexOf('.map('),
                    rule: 'react/jsx-key',
                    suggestion: 'Add unique key prop to each rendered element'
                });
            }
        });

        return issues;
    }

    private checkTypeScriptRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            if (line.includes(': any') || line.includes('<any>')) {
                issues.push({
                    id: `any-type-${lineNum}`,
                    type: 'warning',
                    category: 'TypeScript',
                    message: 'Avoid using any type',
                    line: lineNum,
                    column: line.indexOf('any'),
                    rule: '@typescript-eslint/no-explicit-any',
                    suggestion: 'Define proper types instead of using any'
                });
            }

            if (line.includes('console.log')) {
                issues.push({
                    id: `console-log-${lineNum}`,
                    type: 'info',
                    category: 'Code Quality',
                    message: 'Remove console.log statement',
                    line: lineNum,
                    column: line.indexOf('console.log'),
                    rule: 'no-console',
                    suggestion: 'Use proper error handling instead of console.log'
                });
            }
        });

        return issues;
    }

    private checkAccessibilityRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            if (line.includes('<img') && !line.includes('alt=')) {
                issues.push({
                    id: `missing-alt-${lineNum}`,
                    type: 'error',
                    category: 'Accessibility',
                    message: 'Image missing alt attribute',
                    line: lineNum,
                    column: line.indexOf('<img'),
                    rule: 'jsx-a11y/alt-text',
                    suggestion: 'Add descriptive alt attribute to image'
                });
            }

            if (line.includes('<button') && !line.includes('aria-') && !line.includes('type=')) {
                issues.push({
                    id: `a11y-button-${lineNum}`,
                    type: 'warning',
                    category: 'Accessibility',
                    message: 'Button missing accessibility attributes',
                    line: lineNum,
                    column: line.indexOf('<button'),
                    rule: 'jsx-a11y/button-has-type',
                    suggestion: 'Add aria-label or proper button type'
                });
            }
        });

        return issues;
    }

    private checkPerformanceRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            if (line.includes('style={{') || line.includes('onClick={() =>')) {
                issues.push({
                    id: `inline-creation-${lineNum}`,
                    type: 'warning',
                    category: 'Performance',
                    message: 'Inline object/function creation in render',
                    line: lineNum,
                    column: line.indexOf(line.includes('style={{') ? 'style={{' : 'onClick={() =>'),
                    rule: 'react/jsx-no-bind',
                    suggestion: 'Move object/function creation outside render or use useCallback/useMemo'
                });
            }

            if (line.includes("'/") && line.includes("' + ")) {
                issues.push({
                    id: `string-concat-${lineNum}`,
                    type: 'warning',
                    category: 'Best Practices',
                    message: 'Use template literals instead of string concatenation',
                    line: lineNum,
                    column: line.indexOf("' + "),
                    rule: 'prefer-template',
                    suggestion: 'Use template literals with backticks instead of string concatenation'
                });
            }
        });

        return issues;
    }

    private checkCodeQualityRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('import') && trimmedLine.includes('React')) {
                const importMatch = trimmedLine.match(/import\s+{([^}]+)}/);
                if (importMatch) {
                    const imports = importMatch[1].split(',').map(s => s.trim());
                    imports.forEach(importName => {
                        if (importName !== 'React' && !code.includes(importName.split(' as ')[0])) {
                            issues.push({
                                id: `unused-import-${lineNum}-${importName}`,
                                type: 'warning',
                                category: 'Code Quality',
                                message: `Unused import: ${importName}`,
                                line: lineNum,
                                column: line.indexOf(importName),
                                rule: 'no-unused-vars',
                                suggestion: `Remove unused import: ${importName}`
                            });
                        }
                    });
                }
            }

            if (trimmedLine === '{}' || trimmedLine === '{ }') {
                issues.push({
                    id: `empty-block-${lineNum}`,
                    type: 'info',
                    category: 'Code Quality',
                    message: 'Empty block detected',
                    line: lineNum,
                    column: line.indexOf('{'),
                    rule: 'no-empty',
                    suggestion: 'Remove empty block or add implementation'
                });
            }
        });

        return issues;
    }

    private calculateMetrics(code: string, issues: CodeIssue[]): CodeMetrics {
        const complexityIndicators = code.match(/(if|for|while|switch|catch|\?\s*:)/g) || [];
        const complexity = Math.min(10, Math.max(1, 10 - Math.floor(complexityIndicators.length / 2)));

        const maintainability = Math.min(10, Math.max(1, 10 - Math.floor(issues.length / 3)));

        const hasExports = code.includes('export');
        const hasPureFunctions = code.includes('const ') && code.includes('=>');
        const testability = hasExports && hasPureFunctions ? 8 : 6;

        const performanceIssues = issues.filter(issue => issue.category === 'Performance').length;
        const performance = Math.min(10, Math.max(1, 8 - performanceIssues));

        return { complexity, maintainability, testability, performance };
    }

    private generateSummary(issues: CodeIssue[]): IssueSummary {
        const errors = issues.filter(issue => issue.type === 'error').length;
        const warnings = issues.filter(issue => issue.type === 'warning').length;
        const info = issues.filter(issue => issue.type === 'info').length;

        return { errors, warnings, info, total: issues.length };
    }
}

const analyzer = new ReactCodeAnalyzer();

const CodeAnalyzer: React.FC = () => {
    const [code, setCode] = useState(`import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/' + userId);
      const userData = await response.json();
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => fetchUser()}>Refresh</button>
    </div>
  );
};

export default UserProfile;`);

    const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([]);
    const [selectedFileIndex, setSelectedFileIndex] = useState<number>(-1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // File validation
    const isValidFile = (file: File): boolean => {
        const validExtensions = ['.tsx', '.ts', '.jsx', '.js'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return validExtensions.includes(extension);
    };

    // Read file content
    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    // Handle file upload
    const handleFileUpload = async (files: FileList) => {
        const validFiles = Array.from(files).filter(isValidFile);
        
        if (validFiles.length === 0) {
            alert('Please upload valid React/TypeScript files (.tsx, .ts, .jsx, .js)');
            return;
        }

        setIsAnalyzing(true);

        try {
            const newAnalyzedFiles: AnalyzedFile[] = [];
            
            for (const file of validFiles) {
                const content = await readFileContent(file);
                const result = analyzer.analyzeCode(content);
                
                newAnalyzedFiles.push({
                    name: file.name,
                    content,
                    result
                });
            }

            setAnalyzedFiles(prev => [...prev, ...newAnalyzedFiles]);
            setSelectedFileIndex(analyzedFiles.length); // Select first new file
        } catch (error) {
            // Handle file processing errors
            alert('Error processing files. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        if (e.dataTransfer.files) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, [analyzedFiles.length]);

    // File input handler
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFileUpload(e.target.files);
        }
    };

    // Analyze current code
    const analyzeCode = useCallback(async () => {
        setIsAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = analyzer.analyzeCode(code);
        
        // Add/update manual input file
        const manualFile: AnalyzedFile = {
            name: 'Manual Input',
            content: code,
            result
        };

        setAnalyzedFiles(prev => {
            const filtered = prev.filter(f => f.name !== 'Manual Input');
            return [manualFile, ...filtered];
        });
        
        setSelectedFileIndex(0);
        setIsAnalyzing(false);
    }, [code]);

    // Remove file
    const removeFile = (index: number) => {
        setAnalyzedFiles(prev => prev.filter((_, i) => i !== index));
        if (selectedFileIndex === index) {
            setSelectedFileIndex(analyzedFiles.length > 1 ? 0 : -1);
        } else if (selectedFileIndex > index) {
            setSelectedFileIndex(selectedFileIndex - 1);
        }
    };

    // Get current analysis result
    const currentResult = selectedFileIndex >= 0 ? analyzedFiles[selectedFileIndex]?.result : null;
    const currentFileName = selectedFileIndex >= 0 ? analyzedFiles[selectedFileIndex]?.name : null;

    // Helper functions
    const getIssueIcon = (type: string) => {
        const iconStyle = { width: '16px', height: '16px' };
        switch (type) {
            case 'error': return <XCircle style={{ ...iconStyle, color: '#dc2626' }} />;
            case 'warning': return <AlertCircle style={{ ...iconStyle, color: '#d97706' }} />;
            case 'info': return <CheckCircle style={{ ...iconStyle, color: '#2563eb' }} />;
            default: return <AlertCircle style={iconStyle} />;
        }
    };

    const getMetricColor = (score: number): React.CSSProperties => {
        if (score >= 8) return { color: '#16a34a' };
        if (score >= 6) return { color: '#d97706' };
        return { color: '#dc2626' };
    };

    const getMetricBg = (score: number): React.CSSProperties => {
        if (score >= 8) return { backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' };
        if (score >= 6) return { backgroundColor: '#fef3c7', border: '1px solid #fde68a' };
        return { backgroundColor: '#fee2e2', border: '1px solid #fecaca' };
    };

    const getProgressBarColor = (score: number): string => {
        if (score >= 8) return '#10b981';
        if (score >= 6) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="min-h-screen bg-slate-50 p-5 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Code className="w-10 h-10 text-blue-500" />
                        <h1 className="text-3xl font-bold text-slate-800">React Code Quality Analyzer</h1>
                    </div>
                    <p className="text-slate-600 text-lg max-w-4xl mx-auto leading-relaxed">
                        Analyze your React components for quality issues, performance problems, and best practice violations.
                        Upload files or paste code to get instant feedback and intelligent suggestions.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Input Section */}
                    <div>
                        {/* File Upload Area */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Upload Files
                                </h2>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Browse Files
                                </button>
                            </div>

                            {/* Drag & Drop Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    isDragOver 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : 'border-slate-300 bg-slate-50'
                                }`}
                            >
                                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
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
                            />

                            {/* File List */}
                            {analyzedFiles.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-slate-700 mb-2">Analyzed Files:</h3>
                                    <div className="space-y-2">
                                        {analyzedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                                                    selectedFileIndex === index
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                                }`}
                                                onClick={() => setSelectedFileIndex(index)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <File className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm font-medium text-slate-700">{file.name}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {file.result.summary.total} issues
                                                    </span>
                                                </div>
                                                {file.name !== 'Manual Input' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile(index);
                                                        }}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
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

                        {/* Manual Code Input */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Manual Code Input
                                </h2>
                                <button
                                    onClick={analyzeCode}
                                    disabled={isAnalyzing || !code.trim()}
                                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                        isAnalyzing || !code.trim()
                                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30'
                                    }`}
                                >
                                    {isAnalyzing ? '🔍 Analyzing...' : '🚀 Analyze Code'}
                                </button>
                            </div>

                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-96 p-4 border-2 border-slate-200 rounded-lg font-mono text-sm resize-none outline-none transition-colors bg-slate-50 leading-relaxed focus:border-blue-400"
                                placeholder="Paste your React component code here..."
                            />

                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                💡 <strong>Tip:</strong> Paste your React/TypeScript component code above and click "Analyze Code" to get instant feedback!
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div>
                        {currentResult && currentFileName && (
                            <>
                                {/* File Header */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <File className="w-5 h-5" />
                                        Analysis Results: {currentFileName}
                                    </h3>
                                </div>

                                {/* Metrics Dashboard */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-5">
                                        <TrendingUp className="w-5 h-5" />
                                        Code Quality Metrics
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(currentResult.metrics).map(([key, value]) => (
                                            <div key={key} className={`p-4 rounded-lg ${getMetricBg(value).backgroundColor}`} style={getMetricBg(value)}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-700 capitalize">
                                                        {key}
                                                    </span>
                                                    <span className="text-lg font-bold" style={getMetricColor(value)}>
                                                        {value}/10
                                                    </span>
                                                </div>
                                                <div className="bg-slate-200 rounded h-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full rounded transition-all duration-700"
                                                        style={{
                                                            backgroundColor: getProgressBarColor(value),
                                                            width: `${value * 10}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Issues Summary */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-5">📊 Issues Summary</h3>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-5 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600 mb-1">
                                                {currentResult.summary.errors}
                                            </div>
                                            <div className="text-sm text-red-600 font-medium">Errors</div>
                                        </div>
                                        <div className="text-center p-5 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-600 mb-1">
                                                {currentResult.summary.warnings}
                                            </div>
                                            <div className="text-sm text-yellow-600 font-medium">Warnings</div>
                                        </div>
                                        <div className="text-center p-5 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                                {currentResult.summary.info}
                                            </div>
                                            <div className="text-sm text-blue-600 font-medium">Info</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Issues */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-5">🔍 Detailed Issues</h3>

                                    <div className="max-h-96 overflow-y-auto p-1">
                                        {currentResult.issues.map((issue: CodeIssue) => (
                                            <div
                                                key={issue.id}
                                                className="border border-slate-200 rounded-lg p-4 mb-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {getIssueIcon(issue.type)}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-sm font-semibold text-slate-800">
                                                                {issue.category}
                                                            </span>
                                                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                                                Line {issue.line}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-700 mb-1.5 leading-relaxed">
                                                            {issue.message}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block mb-2">
                                                            Rule: {issue.rule}
                                                        </p>
                                                        {issue.suggestion && (
                                                            <div className="bg-blue-50 border border-blue-200 rounded p-2.5">
                                                                <p className="text-xs text-blue-800 leading-relaxed">
                                                                    <strong>💡 Suggestion:</strong> {issue.suggestion}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {currentResult.issues.length === 0 && (
                                            <div className="text-center py-15">
                                                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                                                <p className="text-xl font-semibold mb-2 text-slate-800">
                                                    🎉 Excellent! No issues found.
                                                </p>
                                                <p className="text-slate-600">
                                                    Your code follows React best practices!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {!currentResult && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center py-15">
                                <Code className="w-20 h-20 mx-auto mb-5 text-slate-400" />
                                <p className="text-xl font-semibold mb-2 text-slate-800">
                                    Ready to analyze your React code?
                                </p>
                                <p className="text-slate-600">
                                    Upload files or paste your component code to get started
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                        🔬 What We Analyze
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            {
                                title: '⚛️ React Hooks',
                                description: 'Detects missing dependencies, incorrect hook usage, and optimization opportunities.'
                            },
                            {
                                title: '🛡️ Type Safety',
                                description: 'Validates PropTypes, TypeScript interfaces, and type-related best practices.'
                            },
                            {
                                title: '♿ Accessibility',
                                description: 'Checks for WCAG compliance and suggests improvements for better accessibility.'
                            },
                            {
                                title: '⚡ Performance',
                                description: 'Identifies performance bottlenecks and suggests React optimization patterns.'
                            },
                            {
                                title: '📊 Code Quality',
                                description: 'Measures complexity, maintainability, and overall code health metrics.'
                            },
                            {
                                title: '✨ Best Practices',
                                description: 'Enforces React community standards and modern development patterns.'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer"
                            >
                                <h3 className="font-semibold text-slate-800 mb-2 text-base">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeAnalyzer;