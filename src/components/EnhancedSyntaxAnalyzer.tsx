import { CodeIssue, AnalysisResult, CodeMetrics, IssueSummary } from '../types';

interface SyntaxToken {
    type: 'open' | 'close';
    symbol: string;
    line: number;
    column: number;
    context?: string;
}

interface BracketPair {
    open: string;
    close: string;
    name: string;
}

interface SyntaxPattern {
    pattern: RegExp;
    name: string;
    description: string;
    suggestion: string;
    severity: 'error' | 'warning' | 'info';
}

export class EnhancedSyntaxAnalyzer {
    private readonly BRACKET_PAIRS: BracketPair[] = [
        { open: '{', close: '}', name: 'curly brace' },
        { open: '[', close: ']', name: 'square bracket' },
        { open: '(', close: ')', name: 'parenthesis' },
        { open: '<', close: '>', name: 'angle bracket' }
    ];

    private readonly SYNTAX_PATTERNS: SyntaxPattern[] = [
        // Only check for obviously malformed arrow functions
        {
            pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*(?![a-zA-Z_{(])/,
            name: 'missing-arrow-function-brace',
            description: 'Arrow function with multiple statements missing opening brace',
            suggestion: 'Add opening brace { after => for multi-statement functions',
            severity: 'error'
        },
        // More specific unclosed string check
        {
            pattern: /(['"`])[^'"`]*\n[^'"`]*$/m,
            name: 'unclosed-string',
            description: 'String appears to be unclosed',
            suggestion: 'Add closing quote to match opening quote',
            severity: 'error'
        },
        // More specific object property check
        {
            pattern: /{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*[,}](?!\s*:)/,
            name: 'missing-object-colon',
            description: 'Object property missing colon',
            suggestion: 'Add colon : between property name and value',
            severity: 'error'
        }
    ];

    public analyzeSyntax(code: string): AnalysisResult {
        const lines = code.split('\n');
        const issues: CodeIssue[] = [];

        // Check bracket matching
        issues.push(...this.checkBracketMatching(code, lines));

        // Check syntax patterns
        issues.push(...this.checkSyntaxPatterns(code, lines));

        // Check JavaScript/TypeScript specific syntax
        issues.push(...this.checkJSSpecificSyntax(lines));

        // Check React/JSX specific syntax
        issues.push(...this.checkJSXSyntax(lines));

        // Check operator usage
        issues.push(...this.checkOperatorSyntax(lines));

        // Check symbol usage
        issues.push(...this.checkSymbolSyntax(lines));

        const metrics = this.calculateSyntaxMetrics(code, issues);
        const summary = this.generateSummary(issues);

        return { issues, metrics, summary };
    }

    private checkBracketMatching(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const stack: SyntaxToken[] = [];

        const bracketPairs = [
            { open: '{', close: '}', name: 'curly brace' },
            { open: '[', close: ']', name: 'square bracket' },
            { open: '(', close: ')', name: 'parenthesis' }
        ];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const lineNum = lineIndex + 1;

            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                const column = charIndex + 1;

                // Skip characters inside strings
                if (this.isInsideString(line, charIndex)) {
                    continue;
                }

                // Skip characters inside comments
                if (this.isInsideComment(line, charIndex)) {
                    continue;
                }

                // Skip JSX angle brackets - handle them separately
                if ((char === '<' || char === '>') && this.isInsideJSX(line, charIndex)) {
                    continue;
                }

                // Only check non-JSX brackets
                const bracketPairs = [
                    { open: '{', close: '}', name: 'curly brace' },
                    { open: '[', close: ']', name: 'square bracket' },
                    { open: '(', close: ')', name: 'parenthesis' }
                ];

                for (const pair of bracketPairs) {
                    if (char === pair.open) {
                        stack.push({
                            type: 'open',
                            symbol: char,
                            line: lineNum,
                            column,
                            context: this.getContext(lines, lineIndex, charIndex)
                        });
                    } else if (char === pair.close) {
                        if (stack.length === 0) {
                            issues.push(this.createSyntaxIssue(
                                `unmatched-${pair.name}-close-${lineNum}`,
                                'error',
                                'Syntax',
                                `Unmatched closing ${pair.name}`,
                                lineNum,
                                column,
                                'syntax/bracket-matching',
                                `Remove extra closing ${pair.name} or add matching opening ${pair.name}`
                            ));
                        } else {
                            const lastOpen = stack.pop()!;
                            const expectedClose = bracketPairs.find(p => p.open === lastOpen.symbol)?.close;

                            if (char !== expectedClose) {
                                issues.push(this.createSyntaxIssue(
                                    `mismatched-${pair.name}-${lineNum}`,
                                    'error',
                                    'Syntax',
                                    `Mismatched ${pair.name}: expected ${expectedClose} but found ${char}`,
                                    lineNum,
                                    column,
                                    'syntax/bracket-matching',
                                    `Change ${char} to ${expectedClose} to match opening ${lastOpen.symbol} on line ${lastOpen.line}`
                                ));
                            }
                        }
                    }
                }
            }
        }

        // Check for unclosed brackets
        stack.forEach(token => {
            const pair = bracketPairs.find((p: any) => p.open === token.symbol);
            if (pair) {
                issues.push(this.createSyntaxIssue(
                    `unclosed-${pair.name}-${token.line}`,
                    'error',
                    'Syntax',
                    `Unclosed ${pair.name}`,
                    token.line,
                    token.column,
                    'syntax/bracket-matching',
                    `Add closing ${pair.close} to match opening ${pair.open}`
                ));
            }
        });

        return issues;
    }

    // Add this helper method
    private isInsideJSX(line: string, index: number): boolean {
        // More conservative JSX detection
        const lineContent = line.trim();

        // Don't treat as JSX if it's clearly not JSX context
        if (lineContent.includes('fetch(') ||
            lineContent.includes('api/') ||
            lineContent.includes('async') ||
            lineContent.includes('await') ||
            lineContent.includes('try') ||
            lineContent.includes('catch')) {
            return false;
        }

        // Only treat as JSX if we have clear JSX indicators
        return /<[A-Z][a-zA-Z0-9]*/.test(line) ||
            /return\s*</.test(line) ||
            line.includes('jsx') ||
            line.includes('tsx');
    }

    private checkSyntaxPatterns(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        this.SYNTAX_PATTERNS.forEach(pattern => {
            const matches: any = code.matchAll(new RegExp(pattern.pattern.source, 'gm'));

            for (const match of matches) {
                if (match.index !== undefined) {
                    const beforeMatch = code.substring(0, match.index);
                    const lineNumber = beforeMatch.split('\n').length;
                    const column = match.index - beforeMatch.lastIndexOf('\n');

                    issues.push(this.createSyntaxIssue(
                        `${pattern.name}-${lineNumber}`,
                        pattern.severity,
                        'Syntax',
                        pattern.description,
                        lineNumber,
                        column,
                        `syntax/${pattern.name}`,
                        pattern.suggestion
                    ));
                }
            }
        });

        return issues;
    }

    private checkJSSpecificSyntax(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            // Check for invalid variable declarations
            if (/^(let|const|var)\s+\d/.test(trimmedLine)) {
                issues.push(this.createSyntaxIssue(
                    `invalid-variable-name-${lineNum}`,
                    'error',
                    'Syntax',
                    'Variable name cannot start with a number',
                    lineNum,
                    0,
                    'syntax/variable-naming',
                    'Variable names must start with a letter, underscore, or dollar sign'
                ));
            }

            // Check for invalid assignment operators
            if (/=(?!=)(?!>)\s*$/.test(trimmedLine) && !trimmedLine.includes('=>')) {
                issues.push(this.createSyntaxIssue(
                    `incomplete-assignment-${lineNum}`,
                    'error',
                    'Syntax',
                    'Incomplete assignment statement',
                    lineNum,
                    trimmedLine.indexOf('='),
                    'syntax/assignment',
                    'Complete the assignment with a value'
                ));
            }

            // Check for invalid function calls
            if (/\w+\(\s*$/.test(trimmedLine)) {
                issues.push(this.createSyntaxIssue(
                    `unclosed-function-call-${lineNum}`,
                    'error',
                    'Syntax',
                    'Unclosed function call',
                    lineNum,
                    trimmedLine.lastIndexOf('('),
                    'syntax/function-call',
                    'Add closing parenthesis ) to complete function call'
                ));
            }

            // Check for malformed object literals
            if (/{[^}]*\w+\s+\w+[^:,}]/.test(trimmedLine)) {
                issues.push(this.createSyntaxIssue(
                    `malformed-object-${lineNum}`,
                    'error',
                    'Syntax',
                    'Malformed object literal',
                    lineNum,
                    0,
                    'syntax/object-literal',
                    'Use proper object syntax: { key: value }'
                ));
            }

            // Check for invalid array syntax
            if (/\[\s*[^,\]]+\s+[^,\]]+/.test(trimmedLine)) {
                issues.push(this.createSyntaxIssue(
                    `invalid-array-syntax-${lineNum}`,
                    'error',
                    'Syntax',
                    'Invalid array syntax',
                    lineNum,
                    trimmedLine.indexOf('['),
                    'syntax/array-literal',
                    'Separate array elements with commas'
                ));
            }
        });

        return issues;
    }

    private checkJSXSyntax(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for unclosed JSX tags
            const jsxTagRegex = /<([A-Z][a-zA-Z0-9]*)[^>]*(?!\/?>|<\/)/g;
            let match;
            while ((match = jsxTagRegex.exec(line)) !== null) {
                const tagName = match[1];
                const restOfFile = lines.slice(index).join('\n');
                const closingTagRegex = new RegExp(`</${tagName}>`);
                const selfClosingRegex = new RegExp(`<${tagName}[^>]*/>`);

                if (!closingTagRegex.test(restOfFile) && !selfClosingRegex.test(line)) {
                    issues.push(this.createSyntaxIssue(
                        `unclosed-jsx-${tagName}-${lineNum}`,
                        'error',
                        'JSX',
                        `JSX element <${tagName}> is not closed`,
                        lineNum,
                        match.index!,
                        'jsx/unclosed-element',
                        `Add closing tag </${tagName}> or make it self-closing with />`
                    ));
                }
            }

            // Check for invalid JSX attribute syntax
            if (/<[^>]+\w+\s*[^=>\s][^>]*>/.test(line)) {
                issues.push(this.createSyntaxIssue(
                    `invalid-jsx-attribute-${lineNum}`,
                    'error',
                    'JSX',
                    'Invalid JSX attribute syntax',
                    lineNum,
                    0,
                    'jsx/attribute-syntax',
                    'JSX attributes must have format: attribute="value" or attribute={value}'
                ));
            }

            // Check for unescaped quotes in JSX
            if (/<[^>]+=['"][^'"]*['"][^'"]*['"][^>]*>/.test(line)) {
                issues.push(this.createSyntaxIssue(
                    `unescaped-jsx-quotes-${lineNum}`,
                    'warning',
                    'JSX',
                    'Potentially unescaped quotes in JSX attribute',
                    lineNum,
                    0,
                    'jsx/quotes',
                    'Escape quotes or use different quote types'
                ));
            }
        });

        return issues;
    }

    private checkOperatorSyntax(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for invalid operator combinations
            const invalidOperators = [
                { pattern: /=\s*=(?!=)/, message: 'Invalid assignment operator', suggestion: 'Use === for comparison or = for assignment' },
                { pattern: /!\s*=(?!=)/, message: 'Invalid not-equals operator', suggestion: 'Use !== for strict inequality' },
                { pattern: /&\s*&\s*&/, message: 'Invalid logical operator', suggestion: 'Use && for logical AND' },
                { pattern: /\|\s*\|\s*\|/, message: 'Invalid logical operator', suggestion: 'Use || for logical OR' },
                { pattern: /\+\s*\+\s*\+/, message: 'Invalid increment operator', suggestion: 'Use ++ for increment' },
                { pattern: /-\s*-\s*-/, message: 'Invalid decrement operator', suggestion: 'Use -- for decrement' }
            ];

            invalidOperators.forEach(({ pattern, message, suggestion }, idx) => {
                if (pattern.test(line)) {
                    issues.push(this.createSyntaxIssue(
                        `invalid-operator-${idx}-${lineNum}`,
                        'error',
                        'Operators',
                        message,
                        lineNum,
                        line.search(pattern),
                        'syntax/operators',
                        suggestion
                    ));
                }
            });

            // Check for missing operators
            if (/\w+\s+\w+\s*[;}]/.test(line) && !line.includes('=') && !line.includes('import') && !line.includes('export')) {
                issues.push(this.createSyntaxIssue(
                    `missing-operator-${lineNum}`,
                    'error',
                    'Operators',
                    'Missing operator between operands',
                    lineNum,
                    0,
                    'syntax/missing-operator',
                    'Add appropriate operator (=, +, -, *, /, etc.) between operands'
                ));
            }
        });

        return issues;
    }

    private checkSymbolSyntax(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for invalid symbol usage
            const symbolChecks = [
                { pattern: /\$\$/, message: 'Double dollar sign', suggestion: 'Use single $ for template literals' },
                { pattern: /#[^a-zA-Z]/, message: 'Invalid hash usage', suggestion: 'Hash symbol should be followed by identifier' },
                { pattern: /@(?!\w)/, message: 'Invalid at symbol usage', suggestion: 'At symbol should be followed by identifier' },
                { pattern: /`[^`]*$/, message: 'Unclosed template literal', suggestion: 'Add closing backtick `' },
                { pattern: /\.\.\.\s*\./, message: 'Invalid spread operator', suggestion: 'Use ... for spread operator' }
            ];

            symbolChecks.forEach(({ pattern, message, suggestion }, idx) => {
                if (pattern.test(line)) {
                    issues.push(this.createSyntaxIssue(
                        `invalid-symbol-${idx}-${lineNum}`,
                        'error',
                        'Symbols',
                        message,
                        lineNum,
                        line.search(pattern),
                        'syntax/symbols',
                        suggestion
                    ));
                }
            });

            // Check for misplaced semicolons
            if (/;\s*;/.test(line)) {
                issues.push(this.createSyntaxIssue(
                    `double-semicolon-${lineNum}`,
                    'warning',
                    'Symbols',
                    'Double semicolon detected',
                    lineNum,
                    line.indexOf(';;'),
                    'syntax/semicolon',
                    'Remove extra semicolon'
                ));
            }
        });

        return issues;
    }

    private isInsideString(line: string, index: number): boolean {
        const beforeChar = line.substring(0, index);
        const singleQuotes = (beforeChar.match(/'/g) || []).length;
        const doubleQuotes = (beforeChar.match(/"/g) || []).length;
        const backticks = (beforeChar.match(/`/g) || []).length;

        return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
    }

    private isInsideComment(line: string, index: number): boolean {
        const beforeChar = line.substring(0, index);
        return beforeChar.includes('//') || beforeChar.includes('/*');
    }

    private getContext(lines: string[], lineIndex: number, charIndex: number): string {
        const line = lines[lineIndex];
        const start = Math.max(0, charIndex - 20);
        const end = Math.min(line.length, charIndex + 20);
        return line.substring(start, end);
    }

    private calculateSyntaxMetrics(code: string, issues: CodeIssue[]): CodeMetrics {
        // const lines = code.split('\n');
        // const totalLines = lines.filter(line => line.trim().length > 0).length;

        const syntaxErrors = issues.filter(issue => issue.type === 'error').length;
        const syntaxWarnings = issues.filter(issue => issue.type === 'warning').length;

        // Calculate syntax quality (higher is better)
        const syntaxQuality = Math.max(1, 10 - Math.floor(syntaxErrors * 2) - Math.floor(syntaxWarnings * 0.5));

        // Calculate complexity based on bracket nesting
        const maxNesting = this.calculateMaxNesting(code);
        const complexity = Math.min(10, Math.max(1, 10 - Math.floor(maxNesting / 3)));

        // Calculate maintainability based on syntax cleanliness
        const maintainability = Math.max(1, syntaxQuality - Math.floor(issues.length / 5));

        // Calculate testability (syntax errors make testing harder)
        const testability = Math.max(1, 10 - syntaxErrors);

        return {
            complexity,
            maintainability,
            testability,
            performance: 8 // Syntax doesn't directly affect performance
        };
    }

    private calculateMaxNesting(code: string): number {
        let maxNesting = 0;
        let currentNesting = 0;

        for (const char of code) {
            if (char === '{' || char === '[' || char === '(') {
                currentNesting++;
                maxNesting = Math.max(maxNesting, currentNesting);
            } else if (char === '}' || char === ']' || char === ')') {
                currentNesting = Math.max(0, currentNesting - 1);
            }
        }

        return maxNesting;
    }

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

    private createSyntaxIssue(
        id: string,
        type: 'error' | 'warning' | 'info',
        category: string,
        message: string,
        line: number,
        column: number,
        rule: string,
        suggestion: string
    ): CodeIssue {
        return {
            id,
            type,
            category,
            message,
            line,
            column,
            rule,
            suggestion
        };
    }
}

export const enhancedSyntaxAnalyzer = new EnhancedSyntaxAnalyzer();