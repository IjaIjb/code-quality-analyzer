import React, { useState, useCallback, useEffect } from 'react';
import { Code, Copy, Download, Printer, Save } from 'lucide-react';
import FileUploadSection from './FileUploadSection';
import CodeInputSection from './CodeInputSection';
import AnalysisResultsSection from './AnalysisResultsSection';
import ExportSessionManager from './ExportSessionManager';
import { EnhancedSyntaxAnalyzer } from './EnhancedSyntaxAnalyzer';
import FileComparisonView from './FileComparisonView';
import {
  CodeIssue,
  AnalysisResult,
  CodeMetrics,
  IssueSummary,
  AnalyzedFile,
  AnalysisSession,
} from '../types';

// Types for the refactored component
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error';
}

// Export utilities (same as before)
class ExportManager {
  static exportToJSON(files: AnalyzedFile[]): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      analyzer: 'React Code Quality Analyzer',
      summary: this.generateGlobalSummary(files),
      files: files.map((file) => ({
        name: file.name,
        analysis: {
          metrics: file.result.metrics,
          summary: file.result.summary,
          issues: file.result.issues,
        },
      })),
    };
    return JSON.stringify(exportData, null, 2);
  }

  static generateGlobalSummary(files: AnalyzedFile[]) {
    const totalIssues = files.reduce(
      (sum, file) => sum + file.result.summary.total,
      0,
    );
    const totalErrors = files.reduce(
      (sum, file) => sum + file.result.summary.errors,
      0,
    );
    const totalWarnings = files.reduce(
      (sum, file) => sum + file.result.summary.warnings,
      0,
    );
    const totalInfo = files.reduce(
      (sum, file) => sum + file.result.summary.info,
      0,
    );

    const avgMetrics = files.reduce(
      (acc, file) => {
        acc.complexity += file.result.metrics.complexity;
        acc.maintainability += file.result.metrics.maintainability;
        acc.testability += file.result.metrics.testability;
        acc.performance += file.result.metrics.performance;
        return acc;
      },
      { complexity: 0, maintainability: 0, testability: 0, performance: 0 },
    );

    const fileCount = files.length;
    return {
      totalFiles: fileCount,
      totalIssues,
      totalErrors,
      totalWarnings,
      totalInfo,
      averageMetrics:
        fileCount > 0
          ? {
              complexity: (avgMetrics.complexity / fileCount).toFixed(1),
              maintainability: (avgMetrics.maintainability / fileCount).toFixed(
                1,
              ),
              testability: (avgMetrics.testability / fileCount).toFixed(1),
              performance: (avgMetrics.performance / fileCount).toFixed(1),
            }
          : null,
    };
  }

  static generateTextReport(files: AnalyzedFile[]): string {
    const summary = this.generateGlobalSummary(files);
    const timestamp = new Date().toLocaleString();

    let report = `REACT CODE QUALITY ANALYSIS REPORT
Generated: ${timestamp}
Analyzer: React Code Quality Analyzer v1.0.0

═══════════════════════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════

Total Files Analyzed: ${summary.totalFiles}
Total Issues Found: ${summary.totalIssues}
├─ Errors: ${summary.totalErrors}
├─ Warnings: ${summary.totalWarnings}
└─ Info: ${summary.totalInfo}

Average Quality Metrics:
├─ Complexity: ${summary.averageMetrics?.complexity}/10
├─ Maintainability: ${summary.averageMetrics?.maintainability}/10
├─ Testability: ${summary.averageMetrics?.testability}/10
└─ Performance: ${summary.averageMetrics?.performance}/10

═══════════════════════════════════════════════════════════════
DETAILED FILE ANALYSIS
═══════════════════════════════════════════════════════════════

`;

    files.forEach((file, index) => {
      report += `${index + 1}. ${file.name}
${'─'.repeat(50)}
Issues: ${file.result.summary.total} (${file.result.summary.errors} errors, ${
        file.result.summary.warnings
      } warnings, ${file.result.summary.info} info)

Quality Metrics:
├─ Complexity: ${file.result.metrics.complexity}/10
├─ Maintainability: ${file.result.metrics.maintainability}/10
├─ Testability: ${file.result.metrics.testability}/10
└─ Performance: ${file.result.metrics.performance}/10

`;

      if (file.result.issues.length > 0) {
        report += `Issues Found:\n`;
        file.result.issues.forEach((issue, issueIndex) => {
          const icon =
            issue.type === 'error'
              ? '❌'
              : issue.type === 'warning'
                ? '⚠️'
                : 'ℹ️';
          report += `  ${issueIndex + 1}. ${icon} [${issue.category}] Line ${issue.line}
     ${issue.message}
     Rule: ${issue.rule}
     ${issue.suggestion ? `Suggestion: ${issue.suggestion}` : ''}

`;
        });
      } else {
        report += `✅ No issues found - code quality looks good!\n\n`;
      }
      report += '\n';
    });

    report += `═══════════════════════════════════════════════════════════════
RECOMMENDATIONS
═══════════════════════════════════════════════════════════════

`;

    if (summary.totalErrors > 0) {
      report += `🔴 CRITICAL: ${summary.totalErrors} error(s) require immediate attention\n`;
    }
    if (summary.totalWarnings > 0) {
      report += `🟡 MEDIUM: ${summary.totalWarnings} warning(s) should be addressed soon\n`;
    }
    if (summary.totalInfo > 0) {
      report += `🔵 LOW: ${summary.totalInfo} info item(s) for code improvement\n`;
    }
    if (summary.totalIssues === 0) {
      report += `🎉 No issues found! Your code follows best practices.\n`;
    }

    return report;
  }

  static copyToClipboard(text: string): Promise<boolean> {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  static downloadFile(
    content: string,
    filename: string,
    mimeType: string = 'text/plain',
  ) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Session manager (same as before)
class SessionManager {
  private static readonly STORAGE_KEY = 'react-analyzer-sessions';

  static saveSessions(sessions: AnalysisSession[]): void {
    try {
      // Note: In production, consider alternative storage methods
      // localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      console.log('Sessions would be saved:', sessions);
    } catch (error) {
      console.warn('Failed to save sessions');
    }
  }

  static loadSessions(): AnalysisSession[] {
    try {
      // Note: In production, consider alternative storage methods
      // const stored = localStorage.getItem(this.STORAGE_KEY);
      // return stored ? JSON.parse(stored) : [];
      return [];
    } catch (error) {
      console.warn('Failed to load sessions');
      return [];
    }
  }

  static createSession(name: string, files: AnalyzedFile[]): AnalysisSession {
    return {
      id: Date.now().toString(),
      name,
      timestamp: new Date().toISOString(),
      files: files.map((file) => ({
        name: file.name,
        content: file.content,
        result: file.result,
      })),
    };
  }
}

// Enhanced Analyzer that combines syntax and React analysis
class ReactCodeAnalyzer {
  private syntaxAnalyzer: EnhancedSyntaxAnalyzer;

  constructor() {
    this.syntaxAnalyzer = new EnhancedSyntaxAnalyzer();
  }

  public analyzeCode(code: string): AnalysisResult {
    const lines = code.split('\n');
    const issues: CodeIssue[] = [];

    // First, run comprehensive syntax analysis
    const syntaxAnalysis = this.syntaxAnalyzer.analyzeSyntax(code);
    issues.push(...syntaxAnalysis.issues);

    // Then run React-specific analysis
    issues.push(...this.checkBasicReactRules(code, lines));
    issues.push(...this.checkTypeScriptRules(code, lines));
    issues.push(...this.checkAccessibilityRules(code, lines));
    issues.push(...this.checkPerformanceRules(code, lines));
    issues.push(...this.checkCodeQualityRules(code, lines));

    // Combine metrics from syntax analysis and React analysis
    const reactMetrics = this.calculateReactMetrics(code, issues);
    const combinedMetrics = this.combineMetrics(
      syntaxAnalysis.metrics,
      reactMetrics,
    );
    const summary = this.generateSummary(issues);

    return { issues, metrics: combinedMetrics, summary };
  }

  private checkBasicReactRules(code: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();

      if (
        trimmedLine.includes('({ ') &&
        !code.includes('PropTypes') &&
        !code.includes('interface')
      ) {
        issues.push({
          id: `prop-types-${lineNum}`,
          type: 'warning',
          category: 'Type Safety',
          message: 'Missing PropTypes validation or TypeScript interface',
          line: lineNum,
          column: line.indexOf('({ '),
          rule: 'react/prop-types',
          suggestion: 'Add PropTypes validation or use TypeScript interfaces',
        });
      }

      if (
        trimmedLine.includes('useEffect') &&
        !lines[index + 1]?.includes('[]') &&
        !lines[index + 2]?.includes('[]')
      ) {
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
            suggestion:
              'Review and add missing dependencies to dependency array',
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
          suggestion: 'Add unique key prop to each rendered element',
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
          suggestion: 'Define proper types instead of using any',
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
          suggestion: 'Use proper error handling instead of console.log',
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
          suggestion: 'Add descriptive alt attribute to image',
        });
      }

      if (
        line.includes('<button') &&
        !line.includes('aria-') &&
        !line.includes('type=')
      ) {
        issues.push({
          id: `a11y-button-${lineNum}`,
          type: 'warning',
          category: 'Accessibility',
          message: 'Button missing accessibility attributes',
          line: lineNum,
          column: line.indexOf('<button'),
          rule: 'jsx-a11y/button-has-type',
          suggestion: 'Add aria-label or proper button type',
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
          column: line.indexOf(
            line.includes('style={{') ? 'style={{' : 'onClick={() =>',
          ),
          rule: 'react/jsx-no-bind',
          suggestion:
            'Move object/function creation outside render or use useCallback/useMemo',
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
          suggestion:
            'Use template literals with backticks instead of string concatenation',
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
          const imports = importMatch[1].split(',').map((s) => s.trim());
          imports.forEach((importName) => {
            if (
              importName !== 'React' &&
              !code.includes(importName.split(' as ')[0])
            ) {
              issues.push({
                id: `unused-import-${lineNum}-${importName}`,
                type: 'warning',
                category: 'Code Quality',
                message: `Unused import: ${importName}`,
                line: lineNum,
                column: line.indexOf(importName),
                rule: 'no-unused-vars',
                suggestion: `Remove unused import: ${importName}`,
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
          suggestion: 'Remove empty block or add implementation',
        });
      }
    });

    return issues;
  }

  private calculateReactMetrics(
    code: string,
    issues: CodeIssue[],
  ): CodeMetrics {
    const complexityIndicators =
      code.match(/(if|for|while|switch|catch|\?\s*:)/g) || [];
    const complexity = Math.min(
      10,
      Math.max(1, 10 - Math.floor(complexityIndicators.length / 2)),
    );

    const maintainability = Math.min(
      10,
      Math.max(1, 10 - Math.floor(issues.length / 3)),
    );

    const hasExports = code.includes('export');
    const hasPureFunctions = code.includes('const ') && code.includes('=>');
    const testability = hasExports && hasPureFunctions ? 8 : 6;

    const performanceIssues = issues.filter(
      (issue) => issue.category === 'Performance',
    ).length;
    const performance = Math.min(10, Math.max(1, 8 - performanceIssues));

    return { complexity, maintainability, testability, performance };
  }

  private combineMetrics(
    syntaxMetrics: CodeMetrics,
    reactMetrics: CodeMetrics,
  ): CodeMetrics {
    return {
      complexity: Math.round(
        syntaxMetrics.complexity * 0.3 + reactMetrics.complexity * 0.7,
      ),
      maintainability: Math.round(
        syntaxMetrics.maintainability * 0.4 +
          reactMetrics.maintainability * 0.6,
      ),
      testability: Math.round(
        syntaxMetrics.testability * 0.3 + reactMetrics.testability * 0.7,
      ),
      performance: Math.round(
        syntaxMetrics.performance * 0.2 + reactMetrics.performance * 0.8,
      ),
    };
  }

  private generateSummary(issues: CodeIssue[]): IssueSummary {
    const errors = issues.filter((issue) => issue.type === 'error').length;
    const warnings = issues.filter((issue) => issue.type === 'warning').length;
    const info = issues.filter((issue) => issue.type === 'info').length;

    return { errors, warnings, info, total: issues.length };
  }
}

// Initialize analyzer instance
const analyzer = new ReactCodeAnalyzer();

// Main Component
const CodeAnalyzer: React.FC = () => {
  // State
  const [code, setCode] =
    useState(`import React, { useState, useEffect } from 'react';

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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [savedSessions, setSavedSessions] = useState<AnalysisSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load sessions on component mount
  useEffect(() => {
    setSavedSessions(SessionManager.loadSessions());
  }, []);

  // Utility functions
  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    [],
  );

  const isValidFile = useCallback((file: File): boolean => {
    const validExtensions = ['.tsx', '.ts', '.jsx', '.js'];
    const extension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }, []);

  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  // File upload handlers
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter(isValidFile);

      if (validFiles.length === 0) {
        showNotification(
          'Please upload valid React/TypeScript files (.tsx, .ts, .jsx, .js)',
          'error',
        );
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
            result,
          });
        }

        setAnalyzedFiles((prev) => [...prev, ...newAnalyzedFiles]);
        setSelectedFileIndex(analyzedFiles.length);
        showNotification(
          `Successfully analyzed ${newAnalyzedFiles.length} file(s)`,
        );
      } catch (error) {
        showNotification('Error processing files. Please try again.', 'error');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [analyzedFiles.length, isValidFile, readFileContent, showNotification],
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload],
  );

  // Analysis functions - Updated to use enhanced analyzer
  const analyzeCode = useCallback(async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = analyzer.analyzeCode(code);

    const manualFile: AnalyzedFile = {
      name: 'Manual Input',
      content: code,
      result,
    };

    setAnalyzedFiles((prev) => {
      const filtered = prev.filter((f) => f.name !== 'Manual Input');
      return [manualFile, ...filtered];
    });

    setSelectedFileIndex(0);
    setIsAnalyzing(false);
    showNotification('Code analysis completed');
  }, [code, showNotification]);

  const removeFile = useCallback(
    (index: number) => {
      setAnalyzedFiles((prev) => prev.filter((_, i) => i !== index));
      if (selectedFileIndex === index) {
        setSelectedFileIndex(analyzedFiles.length > 1 ? 0 : -1);
      } else if (selectedFileIndex > index) {
        setSelectedFileIndex(selectedFileIndex - 1);
      }
      showNotification('File removed from analysis');
    },
    [selectedFileIndex, analyzedFiles.length, showNotification],
  );

  // Export functions
  const exportToJSON = useCallback(() => {
    if (analyzedFiles.length === 0) {
      showNotification('No analysis results to export', 'error');
      return;
    }

    const jsonContent = ExportManager.exportToJSON(analyzedFiles);
    const timestamp = new Date().toISOString().slice(0, 10);
    ExportManager.downloadFile(
      jsonContent,
      `code-analysis-${timestamp}.json`,
      'application/json',
    );
    setShowExportMenu(false);
    showNotification('Analysis exported as JSON');
  }, [analyzedFiles, showNotification]);

  const exportToReport = useCallback(() => {
    if (analyzedFiles.length === 0) {
      showNotification('No analysis results to export', 'error');
      return;
    }

    const textReport = ExportManager.generateTextReport(analyzedFiles);
    const timestamp = new Date().toISOString().slice(0, 10);
    ExportManager.downloadFile(
      textReport,
      `code-analysis-report-${timestamp}.txt`,
      'text/plain',
    );
    setShowExportMenu(false);
    showNotification('Report exported as text file');
  }, [analyzedFiles, showNotification]);

  const copyToClipboard = useCallback(async () => {
    if (analyzedFiles.length === 0) {
      showNotification('No analysis results to copy', 'error');
      return;
    }

    const summary = ExportManager.generateGlobalSummary(analyzedFiles);
    const summaryText = `React Code Analysis Summary
Files: ${summary.totalFiles} | Issues: ${summary.totalIssues} (${summary.totalErrors} errors, ${summary.totalWarnings} warnings, ${summary.totalInfo} info)
Average Quality: Complexity ${summary.averageMetrics?.complexity}/10, Maintainability ${summary.averageMetrics?.maintainability}/10, Testability ${summary.averageMetrics?.testability}/10, Performance ${summary.averageMetrics?.performance}/10`;

    const success = await ExportManager.copyToClipboard(summaryText);
    setShowExportMenu(false);
    showNotification(
      success ? 'Summary copied to clipboard' : 'Failed to copy to clipboard',
      success ? 'success' : 'error',
    );
  }, [analyzedFiles, showNotification]);

  // Session management
  const saveSession = useCallback(() => {
    if (analyzedFiles.length === 0) {
      showNotification('No analysis results to save', 'error');
      return;
    }

    if (!sessionName.trim()) {
      showNotification('Please enter a session name', 'error');
      return;
    }

    const newSession = SessionManager.createSession(
      sessionName.trim(),
      analyzedFiles,
    );
    const updatedSessions = [...savedSessions, newSession];
    setSavedSessions(updatedSessions);
    SessionManager.saveSessions(updatedSessions);
    setSessionName('');
    setShowSaveDialog(false);
    showNotification('Session saved successfully');
  }, [analyzedFiles, sessionName, savedSessions, showNotification]);

  const loadSession = useCallback(
    (session: AnalysisSession) => {
      setAnalyzedFiles(session.files);
      setSelectedFileIndex(session.files.length > 0 ? 0 : -1);
      setShowLoadDialog(false);
      showNotification(`Session "${session.name}" loaded successfully`);
    },
    [showNotification],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const updatedSessions = savedSessions.filter((s) => s.id !== sessionId);
      setSavedSessions(updatedSessions);
      SessionManager.saveSessions(updatedSessions);
      showNotification('Session deleted');
    },
    [savedSessions, showNotification],
  );

  const importSession = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const sessionData = JSON.parse(event.target?.result as string);
          if (sessionData.files && Array.isArray(sessionData.files)) {
            setAnalyzedFiles(sessionData.files);
            setSelectedFileIndex(sessionData.files.length > 0 ? 0 : -1);
            showNotification('Session loaded successfully');
          } else {
            showNotification('Invalid session file format', 'error');
          }
        } catch (error) {
          showNotification('Error loading session file', 'error');
        }
      };
      reader.readAsText(file);
    },
    [showNotification],
  );

  // Current analysis result
  const currentResult =
    selectedFileIndex >= 0 ? analyzedFiles[selectedFileIndex]?.result : null;
  const currentFileName =
    selectedFileIndex >= 0 ? analyzedFiles[selectedFileIndex]?.name : null;
  const [showComparisonView, setShowComparisonView] = useState(false);

  // Feature data
  const analysisFeatures = [
    {
      title: 'React Hooks',
      description:
        'Detects missing dependencies, incorrect hook usage, and optimization opportunities.',
    },
    {
      title: 'Type Safety',
      description:
        'Validates PropTypes, TypeScript interfaces, and type-related best practices.',
    },
    {
      title: 'Accessibility',
      description:
        'Checks for WCAG compliance and suggests improvements for better accessibility.',
    },
    {
      title: 'Performance',
      description:
        'Identifies performance bottlenecks and suggests React optimization patterns.',
    },
    {
      title: 'Code Quality',
      description:
        'Measures complexity, maintainability, and overall code health metrics.',
    },
    {
      title: 'Best Practices',
      description:
        'Enforces React community standards and modern development patterns.',
    },
    {
      title: 'Syntax Checking',
      description:
        'Comprehensive syntax validation including bracket matching, function structure, and JSX syntax.',
    },
    {
      title: 'Symbol & Operator Validation',
      description:
        'Validates correct usage of operators, symbols, and punctuation throughout your code.',
    },
  ];

  return (
    <div className="min-h-screen p-5 font-sans bg-slate-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="w-10 h-10 text-blue-500" />
            <h1 className="text-3xl font-bold text-slate-800">
              React Code Quality Analyzer
            </h1>
          </div>
          <p className="max-w-4xl mx-auto text-lg leading-relaxed text-slate-600">
            Analyze your React components for quality issues, performance
            problems, and best practice violations. Upload files or paste code
            to get instant feedback and intelligent suggestions.
          </p>

          {showComparisonView && (
            <FileComparisonView
              analyzedFiles={analyzedFiles}
              onClose={() => setShowComparisonView(false)}
            />
          )}

          {/* Export Session Manager */}
          <ExportSessionManager
            analyzedFiles={analyzedFiles}
            showExportMenu={showExportMenu}
            showSaveDialog={showSaveDialog}
            showLoadDialog={showLoadDialog}
            sessionName={sessionName}
            savedSessions={savedSessions}
            notifications={notifications}
            onToggleExportMenu={() => setShowExportMenu(!showExportMenu)}
            onToggleSaveDialog={() => setShowSaveDialog(!showSaveDialog)}
            onToggleLoadDialog={() => setShowLoadDialog(!showLoadDialog)}
            onSessionNameChange={setSessionName}
            onSaveSession={saveSession}
            onSetShowComparisonView={setShowComparisonView}
            onLoadSession={loadSession}
            onDeleteSession={deleteSession}
            onExportJSON={exportToJSON}
            onExportReport={exportToReport}
            onCopyToClipboard={copyToClipboard}
            onImportSession={importSession}
          />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div>
            {/* File Upload Section */}
            <FileUploadSection
              analyzedFiles={analyzedFiles}
              selectedFileIndex={selectedFileIndex}
              isAnalyzing={isAnalyzing}
              isDragOver={isDragOver}
              onFileUpload={handleFileUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileSelect={setSelectedFileIndex}
              onFileRemove={removeFile}
              setIsDragOver={setIsDragOver}
            />

            {/* Code Input Section */}
            <CodeInputSection
              code={code}
              isAnalyzing={isAnalyzing}
              onCodeChange={setCode}
              onAnalyzeCode={analyzeCode}
            />
          </div>

          {/* Results Section */}
          <div>
            <AnalysisResultsSection
              currentResult={currentResult}
              currentFileName={currentFileName}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="p-8 mt-12 bg-white border shadow-sm rounded-xl border-slate-200">
          <h2 className="mb-6 text-2xl font-bold text-center text-slate-800">
            What We Analyze
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {analysisFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-5 transition-all duration-200 bg-white border rounded-lg cursor-pointer border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="mb-2 text-base font-semibold text-slate-800">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Features Section */}
        <div className="p-8 mt-8 border bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-slate-200">
          <h2 className="mb-6 text-2xl font-bold text-center text-slate-800">
            Export & Share Features
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 transition-all duration-200 bg-white border rounded-lg border-slate-200 hover:shadow-lg">
              <div className="flex justify-center mb-3">
                <Download className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="mb-2 font-semibold text-center text-slate-800">
                JSON Export
              </h3>
              <p className="text-sm leading-relaxed text-center text-slate-600">
                Export complete analysis results in structured JSON format for
                integration with other tools.
              </p>
            </div>

            <div className="p-5 transition-all duration-200 bg-white border rounded-lg border-slate-200 hover:shadow-lg">
              <div className="flex justify-center mb-3">
                <Printer className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="mb-2 font-semibold text-center text-slate-800">
                Report Generation
              </h3>
              <p className="text-sm leading-relaxed text-center text-slate-600">
                Generate professional text reports with executive summaries and
                detailed findings.
              </p>
            </div>

            <div className="p-5 transition-all duration-200 bg-white border rounded-lg border-slate-200 hover:shadow-lg">
              <div className="flex justify-center mb-3">
                <Copy className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="mb-2 font-semibold text-center text-slate-800">
                Quick Copy
              </h3>
              <p className="text-sm leading-relaxed text-center text-slate-600">
                Copy analysis summaries to clipboard for quick sharing in
                messages or documents.
              </p>
            </div>

            <div className="p-5 transition-all duration-200 bg-white border rounded-lg border-slate-200 hover:shadow-lg">
              <div className="flex justify-center mb-3">
                <Save className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="mb-2 font-semibold text-center text-slate-800">
                Session Management
              </h3>
              <p className="text-sm leading-relaxed text-center text-slate-600">
                Save and load analysis sessions to continue work later or share
                with team members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeAnalyzer;
