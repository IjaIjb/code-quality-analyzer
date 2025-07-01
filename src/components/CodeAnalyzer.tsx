import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Code,
  FileText,
  TrendingUp,
  Upload,
  File,
  X,
  Plus,
  Download,
  Copy,
  Save,
  FolderOpen,
  FileDown,
  Printer,
} from "lucide-react";

// Types
interface CodeIssue {
  id: string;
  type: "error" | "warning" | "info";
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

interface AnalysisSession {
  id: string;
  name: string;
  timestamp: string;
  files: AnalyzedFile[];
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error";
}

// Export utilities
class ExportManager {
  static exportToJSON(files: AnalyzedFile[]): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      analyzer: "React Code Quality Analyzer",
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
      0
    );
    const totalErrors = files.reduce(
      (sum, file) => sum + file.result.summary.errors,
      0
    );
    const totalWarnings = files.reduce(
      (sum, file) => sum + file.result.summary.warnings,
      0
    );
    const totalInfo = files.reduce(
      (sum, file) => sum + file.result.summary.info,
      0
    );

    const avgMetrics = files.reduce(
      (acc, file) => {
        acc.complexity += file.result.metrics.complexity;
        acc.maintainability += file.result.metrics.maintainability;
        acc.testability += file.result.metrics.testability;
        acc.performance += file.result.metrics.performance;
        return acc;
      },
      { complexity: 0, maintainability: 0, testability: 0, performance: 0 }
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
                1
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
${"─".repeat(50)}
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
            issue.type === "error"
              ? "❌"
              : issue.type === "warning"
                ? "⚠️"
                : "ℹ️";
          report += `  ${issueIndex + 1}. ${icon} [${issue.category}] Line ${
            issue.line
          }
     ${issue.message}
     Rule: ${issue.rule}
     ${issue.suggestion ? `Suggestion: ${issue.suggestion}` : ""}

`;
        });
      } else {
        report += `✅ No issues found - excellent code quality!

`;
      }
      report += "\n";
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
      report += `🎉 EXCELLENT: No issues found! Your code follows best practices.\n`;
    }

    report += `
Generated by React Code Quality Analyzer
For more information, visit: https://github.com/your-repo
`;

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
    mimeType: string = "text/plain"
  ) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Session manager for save/load functionality
class SessionManager {
  private static readonly STORAGE_KEY = "react-analyzer-sessions";

  static saveSessions(sessions: AnalysisSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.warn("Failed to save sessions to localStorage");
    }
  }

  static loadSessions(): AnalysisSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load sessions from localStorage");
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

// Analyzer implementation
class ReactCodeAnalyzer {
  public analyzeCode(code: string): AnalysisResult {
    const lines = code.split("\n");
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

      if (
        trimmedLine.includes("({ ") &&
        !code.includes("PropTypes") &&
        !code.includes("interface")
      ) {
        issues.push({
          id: `prop-types-${lineNum}`,
          type: "warning",
          category: "Type Safety",
          message: "Missing PropTypes validation or TypeScript interface",
          line: lineNum,
          column: line.indexOf("({ "),
          rule: "react/prop-types",
          suggestion: "Add PropTypes validation or use TypeScript interfaces",
        });
      }

      if (
        trimmedLine.includes("useEffect") &&
        !lines[index + 1]?.includes("[]") &&
        !lines[index + 2]?.includes("[]")
      ) {
        const effectContent = lines.slice(index, index + 5).join("\n");
        if (effectContent.includes("fetch") || effectContent.includes("api")) {
          issues.push({
            id: `missing-deps-${lineNum}`,
            type: "error",
            category: "React Hooks",
            message: "Potential missing dependency in useEffect",
            line: lineNum,
            column: 0,
            rule: "react-hooks/exhaustive-deps",
            suggestion:
              "Review and add missing dependencies to dependency array",
          });
        }
      }

      if (trimmedLine.includes(".map(") && !trimmedLine.includes("key=")) {
        issues.push({
          id: `missing-key-${lineNum}`,
          type: "error",
          category: "React",
          message: "Missing key prop in list rendering",
          line: lineNum,
          column: line.indexOf(".map("),
          rule: "react/jsx-key",
          suggestion: "Add unique key prop to each rendered element",
        });
      }
    });

    return issues;
  }

  private checkTypeScriptRules(code: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.includes(": any") || line.includes("<any>")) {
        issues.push({
          id: `any-type-${lineNum}`,
          type: "warning",
          category: "TypeScript",
          message: "Avoid using any type",
          line: lineNum,
          column: line.indexOf("any"),
          rule: "@typescript-eslint/no-explicit-any",
          suggestion: "Define proper types instead of using any",
        });
      }

      if (line.includes("console.log")) {
        issues.push({
          id: `console-log-${lineNum}`,
          type: "info",
          category: "Code Quality",
          message: "Remove console.log statement",
          line: lineNum,
          column: line.indexOf("console.log"),
          rule: "no-console",
          suggestion: "Use proper error handling instead of console.log",
        });
      }
    });

    return issues;
  }

  private checkAccessibilityRules(code: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.includes("<img") && !line.includes("alt=")) {
        issues.push({
          id: `missing-alt-${lineNum}`,
          type: "error",
          category: "Accessibility",
          message: "Image missing alt attribute",
          line: lineNum,
          column: line.indexOf("<img"),
          rule: "jsx-a11y/alt-text",
          suggestion: "Add descriptive alt attribute to image",
        });
      }

      if (
        line.includes("<button") &&
        !line.includes("aria-") &&
        !line.includes("type=")
      ) {
        issues.push({
          id: `a11y-button-${lineNum}`,
          type: "warning",
          category: "Accessibility",
          message: "Button missing accessibility attributes",
          line: lineNum,
          column: line.indexOf("<button"),
          rule: "jsx-a11y/button-has-type",
          suggestion: "Add aria-label or proper button type",
        });
      }
    });

    return issues;
  }

  private checkPerformanceRules(code: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.includes("style={{") || line.includes("onClick={() =>")) {
        issues.push({
          id: `inline-creation-${lineNum}`,
          type: "warning",
          category: "Performance",
          message: "Inline object/function creation in render",
          line: lineNum,
          column: line.indexOf(
            line.includes("style={{") ? "style={{" : "onClick={() =>"
          ),
          rule: "react/jsx-no-bind",
          suggestion:
            "Move object/function creation outside render or use useCallback/useMemo",
        });
      }

      if (line.includes("'/") && line.includes("' + ")) {
        issues.push({
          id: `string-concat-${lineNum}`,
          type: "warning",
          category: "Best Practices",
          message: "Use template literals instead of string concatenation",
          line: lineNum,
          column: line.indexOf("' + "),
          rule: "prefer-template",
          suggestion:
            "Use template literals with backticks instead of string concatenation",
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

      if (trimmedLine.startsWith("import") && trimmedLine.includes("React")) {
        const importMatch = trimmedLine.match(/import\s+{([^}]+)}/);
        if (importMatch) {
          const imports = importMatch[1].split(",").map((s) => s.trim());
          imports.forEach((importName) => {
            if (
              importName !== "React" &&
              !code.includes(importName.split(" as ")[0])
            ) {
              issues.push({
                id: `unused-import-${lineNum}-${importName}`,
                type: "warning",
                category: "Code Quality",
                message: `Unused import: ${importName}`,
                line: lineNum,
                column: line.indexOf(importName),
                rule: "no-unused-vars",
                suggestion: `Remove unused import: ${importName}`,
              });
            }
          });
        }
      }

      if (trimmedLine === "{}" || trimmedLine === "{ }") {
        issues.push({
          id: `empty-block-${lineNum}`,
          type: "info",
          category: "Code Quality",
          message: "Empty block detected",
          line: lineNum,
          column: line.indexOf("{"),
          rule: "no-empty",
          suggestion: "Remove empty block or add implementation",
        });
      }
    });

    return issues;
  }

  private calculateMetrics(code: string, issues: CodeIssue[]): CodeMetrics {
    const complexityIndicators =
      code.match(/(if|for|while|switch|catch|\?\s*:)/g) || [];
    const complexity = Math.min(
      10,
      Math.max(1, 10 - Math.floor(complexityIndicators.length / 2))
    );

    const maintainability = Math.min(
      10,
      Math.max(1, 10 - Math.floor(issues.length / 3))
    );

    const hasExports = code.includes("export");
    const hasPureFunctions = code.includes("const ") && code.includes("=>");
    const testability = hasExports && hasPureFunctions ? 8 : 6;

    const performanceIssues = issues.filter(
      (issue) => issue.category === "Performance"
    ).length;
    const performance = Math.min(10, Math.max(1, 8 - performanceIssues));

    return { complexity, maintainability, testability, performance };
  }

  private generateSummary(issues: CodeIssue[]): IssueSummary {
    const errors = issues.filter((issue) => issue.type === "error").length;
    const warnings = issues.filter((issue) => issue.type === "warning").length;
    const info = issues.filter((issue) => issue.type === "info").length;

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
  const [sessionName, setSessionName] = useState("");
  const [savedSessions, setSavedSessions] = useState<AnalysisSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionInputRef = useRef<any>(null);

  // Load sessions on component mount
  useEffect(() => {
    setSavedSessions(SessionManager.loadSessions());
  }, []);

  // Utility functions
  const showNotification = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    []
  );

  const isValidFile = useCallback((file: File): boolean => {
    const validExtensions = [".tsx", ".ts", ".jsx", ".js"];
    const extension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    return validExtensions.includes(extension);
  }, []);

  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }, []);

  // File upload handlers
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter(isValidFile);

      if (validFiles.length === 0) {
        showNotification(
          "Please upload valid React/TypeScript files (.tsx, .ts, .jsx, .js)",
          "error"
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
          `Successfully analyzed ${newAnalyzedFiles.length} file(s)`
        );
      } catch (error) {
        showNotification("Error processing files. Please try again.", "error");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [analyzedFiles.length, isValidFile, readFileContent, showNotification]
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
    [handleFileUpload]
  );

  // File input handlers
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileUpload(e.target.files);
      }
    },
    [handleFileUpload]
  );

  const handleSessionInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const sessionData = JSON.parse(event.target?.result as string);
            if (sessionData.files && Array.isArray(sessionData.files)) {
              setAnalyzedFiles(sessionData.files);
              setSelectedFileIndex(sessionData.files.length > 0 ? 0 : -1);
              showNotification("Session loaded successfully");
            } else {
              showNotification("Invalid session file format", "error");
            }
          } catch (error) {
            showNotification("Error loading session file", "error");
          }
        };
        reader.readAsText(file);
      }
    },
    [showNotification]
  );

  // Analysis functions
  const analyzeCode = useCallback(async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = analyzer.analyzeCode(code);

    const manualFile: AnalyzedFile = {
      name: "Manual Input",
      content: code,
      result,
    };

    setAnalyzedFiles((prev) => {
      const filtered = prev.filter((f) => f.name !== "Manual Input");
      return [manualFile, ...filtered];
    });

    setSelectedFileIndex(0);
    setIsAnalyzing(false);
    showNotification("Code analysis completed");
  }, [code, showNotification]);

  const removeFile = useCallback(
    (index: number) => {
      setAnalyzedFiles((prev) => prev.filter((_, i) => i !== index));
      if (selectedFileIndex === index) {
        setSelectedFileIndex(analyzedFiles.length > 1 ? 0 : -1);
      } else if (selectedFileIndex > index) {
        setSelectedFileIndex(selectedFileIndex - 1);
      }
      showNotification("File removed from analysis");
    },
    [selectedFileIndex, analyzedFiles.length, showNotification]
  );

  // Export functions
  const exportToJSON = useCallback(() => {
    if (analyzedFiles.length === 0) {
      showNotification("No analysis results to export", "error");
      return;
    }

    const jsonContent = ExportManager.exportToJSON(analyzedFiles);
    const timestamp = new Date().toISOString().slice(0, 10);
    ExportManager.downloadFile(
      jsonContent,
      `code-analysis-${timestamp}.json`,
      "application/json"
    );
    setShowExportMenu(false);
    showNotification("Analysis exported as JSON");
  }, [analyzedFiles, showNotification]);

  const exportToPDF = useCallback(() => {
    if (analyzedFiles.length === 0) {
      showNotification("No analysis results to export", "error");
      return;
    }

    const textReport = ExportManager.generateTextReport(analyzedFiles);
    const timestamp = new Date().toISOString().slice(0, 10);
    ExportManager.downloadFile(
      textReport,
      `code-analysis-report-${timestamp}.txt`,
      "text/plain"
    );
    setShowExportMenu(false);
    showNotification("Report exported as text file");
  }, [analyzedFiles, showNotification]);

  const copyToClipboard = useCallback(async () => {
    if (analyzedFiles.length === 0) {
      showNotification("No analysis results to copy", "error");
      return;
    }

    const summary = ExportManager.generateGlobalSummary(analyzedFiles);
    const summaryText = `React Code Analysis Summary
Files: ${summary.totalFiles} | Issues: ${summary.totalIssues} (${summary.totalErrors} errors, ${summary.totalWarnings} warnings, ${summary.totalInfo} info)
Average Quality: Complexity ${summary.averageMetrics?.complexity}/10, Maintainability ${summary.averageMetrics?.maintainability}/10, Testability ${summary.averageMetrics?.testability}/10, Performance ${summary.averageMetrics?.performance}/10`;

    const success = await ExportManager.copyToClipboard(summaryText);
    setShowExportMenu(false);
    showNotification(
      success ? "Summary copied to clipboard" : "Failed to copy to clipboard",
      success ? "success" : "error"
    );
  }, [analyzedFiles, showNotification]);

  // Session management
  const saveSession = useCallback(() => {
    if (analyzedFiles.length === 0) {
      showNotification("No analysis results to save", "error");
      return;
    }

    if (!sessionName.trim()) {
      showNotification("Please enter a session name", "error");
      return;
    }

    const newSession = SessionManager.createSession(
      sessionName.trim(),
      analyzedFiles
    );
    const updatedSessions = [...savedSessions, newSession];
    setSavedSessions(updatedSessions);
    SessionManager.saveSessions(updatedSessions);
    setSessionName("");
    setShowSaveDialog(false);
    showNotification("Session saved successfully");
  }, [analyzedFiles, sessionName, savedSessions, showNotification]);

  const loadSession = useCallback(
    (session: AnalysisSession) => {
      setAnalyzedFiles(session.files);
      setSelectedFileIndex(session.files.length > 0 ? 0 : -1);
      setShowLoadDialog(false);
      showNotification(`Session "${session.name}" loaded successfully`);
    },
    [showNotification]
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const updatedSessions = savedSessions.filter((s) => s.id !== sessionId);
      setSavedSessions(updatedSessions);
      SessionManager.saveSessions(updatedSessions);
      showNotification("Session deleted");
    },
    [savedSessions, showNotification]
  );

  // Current analysis result
  const currentResult =
    selectedFileIndex >= 0 ? analyzedFiles[selectedFileIndex]?.result : null;
  const currentFileName =
    selectedFileIndex >= 0 ? analyzedFiles[selectedFileIndex]?.name : null;

  // Helper functions for UI
  const getIssueIcon = useCallback((type: string) => {
    const iconStyle = { width: "16px", height: "16px" };
    switch (type) {
      case "error":
        return <XCircle style={{ ...iconStyle, color: "#dc2626" }} />;
      case "warning":
        return <AlertCircle style={{ ...iconStyle, color: "#d97706" }} />;
      case "info":
        return <CheckCircle style={{ ...iconStyle, color: "#2563eb" }} />;
      default:
        return <AlertCircle style={iconStyle} />;
    }
  }, []);

  const getMetricColor = useCallback((score: number): React.CSSProperties => {
    if (score >= 8) return { color: "#16a34a" };
    if (score >= 6) return { color: "#d97706" };
    return { color: "#dc2626" };
  }, []);

  const getMetricBg = useCallback((score: number): React.CSSProperties => {
    if (score >= 8)
      return { backgroundColor: "#dcfce7", border: "1px solid #bbf7d0" };
    if (score >= 6)
      return { backgroundColor: "#fef3c7", border: "1px solid #fde68a" };
    return { backgroundColor: "#fee2e2", border: "1px solid #fecaca" };
  }, []);

  const getProgressBarColor = useCallback((score: number): string => {
    if (score >= 8) return "#10b981";
    if (score >= 6) return "#f59e0b";
    return "#ef4444";
  }, []);

  // Feature data
  const analysisFeatures = [
    {
      title: "⚛️ React Hooks",
      description:
        "Detects missing dependencies, incorrect hook usage, and optimization opportunities.",
    },
    {
      title: "🛡️ Type Safety",
      description:
        "Validates PropTypes, TypeScript interfaces, and type-related best practices.",
    },
    {
      title: "♿ Accessibility",
      description:
        "Checks for WCAG compliance and suggests improvements for better accessibility.",
    },
    {
      title: "⚡ Performance",
      description:
        "Identifies performance bottlenecks and suggests React optimization patterns.",
    },
    {
      title: "📊 Code Quality",
      description:
        "Measures complexity, maintainability, and overall code health metrics.",
    },
    {
      title: "✨ Best Practices",
      description:
        "Enforces React community standards and modern development patterns.",
    },
  ];

  const exportFeatures = [
    {
      icon: <Download className="w-8 h-8 text-blue-500" />,
      title: "JSON Export",
      description:
        "Export complete analysis results in structured JSON format for integration with other tools.",
    },
    {
      icon: <Printer className="w-8 h-8 text-green-500" />,
      title: "Report Generation",
      description:
        "Generate professional text reports with executive summaries and detailed findings.",
    },
    {
      icon: <Copy className="w-8 h-8 text-purple-500" />,
      title: "Quick Copy",
      description:
        "Copy analysis summaries to clipboard for quick sharing in messages or documents.",
    },
    {
      icon: <Save className="w-8 h-8 text-orange-500" />,
      title: "Session Management",
      description:
        "Save and load analysis sessions to continue work later or share with team members.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-5 font-sans">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header with Export Controls */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="w-10 h-10 text-blue-500" />
            <h1 className="text-3xl font-bold text-slate-800">
              React Code Quality Analyzer
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-4xl mx-auto leading-relaxed">
            Analyze your React components for quality issues, performance
            problems, and best practice violations. Upload files or paste code
            to get instant feedback and intelligent suggestions.
          </p>

          {/* Export Controls */}
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={analyzedFiles.length === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  analyzedFiles.length === 0
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
                }`}
              >
                <Download className="w-4 h-4" />
                Export Results
              </button>

              {showExportMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10 min-w-48">
                  <button
                    onClick={exportToJSON}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <FileDown className="w-4 h-4" />
                    Export as JSON
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Printer className="w-4 h-4" />
                    Export Report
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Summary
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={analyzedFiles.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                analyzedFiles.length === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl"
              }`}
            >
              <Save className="w-4 h-4" />
              Save Session
            </button>

            <button
              onClick={() => setShowLoadDialog(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FolderOpen className="w-4 h-4" />
              Load Session
            </button>
          </div>
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
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-300 bg-slate-50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mx-auto mb-4 ${
                    isDragOver ? "text-blue-500" : "text-slate-400"
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
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedFileIndex === index
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedFileIndex(index)}
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
                        {file.name !== "Manual Input" && (
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
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30"
                  }`}
                >
                  {isAnalyzing ? "🔍 Analyzing..." : "🚀 Analyze Code"}
                </button>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 border-2 border-slate-200 rounded-lg font-mono text-sm resize-none outline-none transition-colors bg-slate-50 leading-relaxed focus:border-blue-400"
                placeholder="Paste your React component code here..."
              />

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                💡 <strong>Tip:</strong> Paste your React/TypeScript component
                code above and click "Analyze Code" to get instant feedback!
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
                    {Object.entries(currentResult.metrics).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className={`p-4 rounded-lg`}
                          style={getMetricBg(value)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {key}
                            </span>
                            <span
                              className="text-lg font-bold"
                              style={getMetricColor(value)}
                            >
                              {value}/10
                            </span>
                          </div>
                          <div className="bg-slate-200 rounded h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded transition-all duration-700"
                              style={{
                                backgroundColor: getProgressBarColor(value),
                                width: `${value * 10}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Issues Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-5">
                    📊 Issues Summary
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {currentResult.summary.errors}
                      </div>
                      <div className="text-sm text-red-600 font-medium">
                        Errors
                      </div>
                    </div>
                    <div className="text-center p-5 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {currentResult.summary.warnings}
                      </div>
                      <div className="text-sm text-yellow-600 font-medium">
                        Warnings
                      </div>
                    </div>
                    <div className="text-center p-5 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {currentResult.summary.info}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        Info
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Issues */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-5">
                    🔍 Detailed Issues
                  </h3>

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
                                  <strong>💡 Suggestion:</strong>{" "}
                                  {issue.suggestion}
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

        {/* Save Session Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">
                Save Analysis Session
              </h3>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={saveSession}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSessionName("");
                  }}
                  className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load Session Dialog */}
        {showLoadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Load Analysis Session
              </h3>

              <div className="mb-4">
                <button
                  onClick={() => sessionInputRef.current?.click()}
                  className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
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
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {session.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(session.timestamp).toLocaleString()} •{" "}
                          {session.files.length} files
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadSession(session)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
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
                  onClick={() => setShowLoadDialog(false)}
                  className="w-full px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            🔬 What We Analyze
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {analysisFeatures.map((feature, index) => (
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

        {/* Export Features Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-slate-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            📤 Export & Share Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {exportFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-5 bg-white border border-slate-200 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-center mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-center">
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
