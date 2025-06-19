// Core types for the React Code Quality Analyzer

export interface CodeIssue {
    id: string;
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    line: number;
    column: number;
    rule: string;
    suggestion?: string;
}

export interface AnalysisResult {
    issues: CodeIssue[];
    metrics: CodeMetrics;
    summary: IssueSummary;
}

export interface CodeMetrics {
    complexity: number;
    maintainability: number;
    testability: number;
    performance: number;
}

export interface IssueSummary {
    errors: number;
    warnings: number;
    info: number;
    total: number;
}

export interface AnalyzerConfig {
    enabledRules: string[];
    severity: {
        [ruleName: string]: 'error' | 'warning' | 'info';
    };
}

// Rule interface for extensibility
export interface Rule {
    name: string;
    category: string;
    description: string;
    check: (code: string, lines: string[]) => CodeIssue[];
}

// File upload types
export interface AnalyzedFile {
    name: string;
    content: string;
    result: AnalysisResult;
}