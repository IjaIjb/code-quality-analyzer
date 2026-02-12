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

// Session management types
export interface AnalysisSession {
    id: string;
    name: string;
    timestamp: string;
    files: AnalyzedFile[];
}

export interface IssueFilters {
    severity: Set<'error' | 'warning' | 'info'>;
    categories: Set<string>;
    searchTerm: string;
}

export interface FilterStats {
    totalIssues: number;
    filteredIssues: number;
    bySeverity: {
        error: number;
        warning: number;
        info: number;
    };
    byCategory: Map<string, number>;
}

// ─── Configuration Panel Types ───────────────────────────────────────────────

/** Describes a single rule that the analyzer can check */
export interface RuleDefinition {
    id: string;
    name: string;
    category: RuleCategory;
    description: string;
    defaultSeverity: 'error' | 'warning' | 'info';
    source: 'syntax' | 'react' | 'semantic';
}

/** Per-rule user configuration */
export interface RuleConfig {
    enabled: boolean;
    severity: 'error' | 'warning' | 'info';
}

/** Full analyzer configuration – keyed by rule id */
export interface AnalyzerConfig {
    rules: Record<string, RuleConfig>;
}

/** All rule categories used across analyzers */
export type RuleCategory =
    | 'Syntax'
    | 'JSX'
    | 'Operators'
    | 'Symbols'
    | 'React Hooks'
    | 'React'
    | 'Type Safety'
    | 'TypeScript'
    | 'Accessibility'
    | 'Performance'
    | 'Code Quality'
    | 'Best Practices';