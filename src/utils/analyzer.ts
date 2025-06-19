import { CodeIssue, AnalysisResult, CodeMetrics, IssueSummary } from '../types';

/**
 * Core analyzer utility functions
 * This is the basic version that will be enhanced by the community
 */

export class ReactCodeAnalyzer {
    /**
     * Main analysis function - analyzes React/TypeScript code
     * @param code - The source code to analyze
     * @returns Analysis results with issues and metrics
     */
    public analyzeCode(code: string): AnalysisResult {
        const lines = code.split('\n');
        const issues: CodeIssue[] = [];

        // Run all basic analysis rules
        issues.push(...this.checkBasicReactRules(code, lines));
        issues.push(...this.checkTypeScriptRules(code, lines));
        issues.push(...this.checkAccessibilityRules(code, lines));
        issues.push(...this.checkPerformanceRules(code, lines));
        issues.push(...this.checkCodeQualityRules(code, lines));

        // Calculate metrics
        const metrics = this.calculateMetrics(code, issues);

        // Generate summary
        const summary = this.generateSummary(issues);

        return {
            issues,
            metrics,
            summary
        };
    }

    /**
     * Basic React-specific rule checks
     */
    private checkBasicReactRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            // Check for missing prop types
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

            // Check for missing dependency in useEffect
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

            // Check for missing keys in map
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

    /**
     * TypeScript-specific rule checks
     */
    private checkTypeScriptRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for any type usage
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

            // Check for console.log
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

    /**
     * Basic accessibility rule checks
     */
    private checkAccessibilityRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for missing alt text on images
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

            // Check for buttons without proper accessibility
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

    /**
     * Performance-related rule checks
     */
    private checkPerformanceRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for inline object creation
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

            // Check for string concatenation in JSX
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

    /**
     * General code quality rule checks
     */
    private checkCodeQualityRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            // Check for unused imports (basic check)
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

            // Check for empty blocks
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

    /**
     * Calculate code metrics
     */
    private calculateMetrics(code: string, issues: CodeIssue[]): CodeMetrics {
        // Calculate complexity (basic: count if statements, loops, etc.)
        const complexityIndicators = code.match(/(if|for|while|switch|catch|\?\s*:)/g) || [];
        const complexity = Math.min(10, Math.max(1, 10 - Math.floor(complexityIndicators.length / 2)));

        // Calculate maintainability (based on issues and code length)
        const maintainability = Math.min(10, Math.max(1, 10 - Math.floor(issues.length / 3)));

        // Calculate testability (presence of pure functions, proper exports)
        const hasExports = code.includes('export');
        const hasPureFunctions = code.includes('const ') && code.includes('=>');
        const testability = hasExports && hasPureFunctions ? 8 : 6;

        // Calculate performance score
        const performanceIssues = issues.filter(issue => issue.category === 'Performance').length;
        const performance = Math.min(10, Math.max(1, 8 - performanceIssues));

        return {
            complexity,
            maintainability,
            testability,
            performance
        };
    }

    /**
     * Generate issue summary
     */
    private generateSummary(issues: CodeIssue[]): IssueSummary {
        const errors = issues.filter(issue => issue.type === 'error').length;
        const warnings = issues.filter(issue => issue.type === 'warning').length;
        const info = issues.filter(issue => issue.type === 'info').length;

        return {
            errors,
            warnings,
            info,
            total: issues.length
        };
    }
}

// Export singleton instance
export const analyzer = new ReactCodeAnalyzer();