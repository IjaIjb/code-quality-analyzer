import { CodeIssue, AnalysisResult, CodeMetrics, IssueSummary } from '../types';

/**
 * Enhanced TypeScript interfaces for better type safety
 */
interface BracketPair {
    char: string;
    line: number;
}

interface CategorySummary {
    semantics: number;
    syntax: number;
    accessibility: number;
    performance: number;
    typescript: number;
    react: number;
    operators: number;
    symbols: number;
}

interface EnhancedCodeMetrics extends CodeMetrics {
    semanticQuality: number;
    syntaxQuality: number;
    typeQuality: number;
    operatorQuality: number;
    symbolQuality: number;
}

interface EnhancedIssueSummary extends IssueSummary {
    byCategory: CategorySummary;
}

interface OperatorUsage {
    operator: string;
    line: number;
    column: number;
    context: string;
}

/**
 * Complete TypeScript React Code Analyzer with Programming Symbols and Operators Analysis
 */
export class ReactCodeAnalyzer {
    // Component and variable naming
    private readonly GENERIC_COMPONENT_NAMES = ['Component', 'Element', 'Item', 'Container', 'Wrapper', 'Thing'] as const;
    private readonly GENERIC_VARIABLE_NAMES = ['data', 'item', 'temp', 'result', 'value', 'thing'] as const;
    private readonly BOOLEAN_PREFIXES = /^(is|has|can|should|will|was|were|are)/;

    // React and HTML elements
    private readonly REACT_HOOKS = ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef'] as const;
    private readonly VOID_ELEMENTS = ['img', 'input', 'br', 'hr', 'meta', 'link'] as const;
    private readonly SEMANTIC_ELEMENTS = ['button', 'input', 'select', 'textarea', 'a'] as const;
    private readonly CONTENT_INDICATORS = ['title', 'heading', 'content', 'text', 'body'] as const;

    // Brackets and symbols
    private readonly BRACKETS: Record<string, string> = { '(': ')', '[': ']', '{': '}' };

    // Programming operators
    private readonly COMPARISON_OPERATORS = ['===', '!==', '==', '!=', '<=', '>=', '<', '>'] as const;
    private readonly LOGICAL_OPERATORS = ['&&', '||', '!'] as const;
    private readonly ARITHMETIC_OPERATORS = ['+', '-', '*', '/', '%', '**'] as const;
    private readonly ASSIGNMENT_OPERATORS = ['=', '+=', '-=', '*=', '/=', '%=', '**=', '&=', '|=', '^=', '<<=', '>>=', '>>>='] as const;
    private readonly BITWISE_OPERATORS = ['&', '|', '^', '~', '<<', '>>', '>>>'] as const;
    private readonly UNARY_OPERATORS = ['++', '--', 'typeof', 'void', 'delete', 'new'] as const;

    // Modern JavaScript/TypeScript symbols
    private readonly OPTIONAL_CHAINING = '?.' as const;
    private readonly NULLISH_COALESCING = '??' as const;
    private readonly SPREAD_OPERATOR = '...' as const;
    private readonly TEMPLATE_LITERAL = '`' as const;
    private readonly ARROW_FUNCTION = '=>' as const;
    private readonly NON_NULL_ASSERTION = '!' as const;
    private readonly OPTIONAL_PARAMETER = '?' as const;

    // Special symbols
    private readonly SEMICOLON = ';' as const;
    private readonly COMMA = ',' as const;
    private readonly DOT = '.' as const;
    private readonly COLON = ':' as const;
    private readonly QUESTION_MARK = '?' as const;

    // Regex patterns for complex checks
    private readonly REGEX_PATTERNS = {
        functionDeclaration: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
        arrowFunction: /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/,
        destructuring: /(?:const|let|var)\s*\{[^}]+\}\s*=|(?:const|let|var)\s*\[[^\]]+\]\s*=/,
        templateLiteral: /`[^`]*\${[^}]*}[^`]*`/,
        regexLiteral: /\/[^\/\n]+\/[gimuy]*/,
        objectProperty: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/,
        typeAnnotation: /:\s*([a-zA-Z_$][a-zA-Z0-9_$<>[\]|&]+)/,
        genericType: /<[a-zA-Z_$][a-zA-Z0-9_$,\s<>[\]|&]*>/
    } as const;

    /**
     * Main analysis function - analyzes React/TypeScript code
     */
    public analyzeCode(code: string): AnalysisResult {
        const lines = code.split('\n');
        const issues: CodeIssue[] = [];

        // Run all analysis rules
        issues.push(
            ...this.checkBasicReactRules(code, lines),
            ...this.checkTypeScriptRules(code, lines),
            ...this.checkAccessibilityRules(code, lines),
            ...this.checkPerformanceRules(code, lines),
            ...this.checkCodeQualityRules(code, lines),
            ...this.checkSemanticRules(code, lines),
            ...this.checkSyntaxRules(code, lines),
            ...this.checkOperatorsAndSymbols(code, lines) // NEW: Operators and symbols analysis
        );

        const metrics = this.calculateMetrics(code, issues);
        const summary = this.generateSummary(issues);

        return { issues, metrics, summary };
    }

    /**
     * NEW: Check programming operators and symbols usage
     */
    private checkOperatorsAndSymbols(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            issues.push(
                ...this.checkComparisonOperators(line, lineNum),
                ...this.checkLogicalOperators(line, lineNum),
                ...this.checkArithmeticOperators(line, lineNum),
                ...this.checkAssignmentOperators(line, lineNum),
                ...this.checkBitwiseOperators(line, lineNum),
                ...this.checkUnaryOperators(line, lineNum),
                ...this.checkModernJSSymbols(line, lineNum),
                ...this.checkTypeScriptSymbols(line, lineNum),
                ...this.checkPunctuationSymbols(line, lineNum),
                ...this.checkSpecialPatterns(line, lineNum)
            );
        });

        return issues;
    }

    /**
     * Check comparison operators usage
     */
    private checkComparisonOperators(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for == instead of ===
        if (line.includes('==') && !line.includes('===') && !line.includes('!==')) {
            const match = line.match(/(?<!=)={2}(?!=)/);
            if (match) {
                issues.push(this.createIssue(
                    `loose-equality-${lineNum}`,
                    'warning',
                    'Operators',
                    'Use strict equality (===) instead of loose equality (==)',
                    lineNum,
                    line.indexOf('=='),
                    'operators/strict-equality',
                    'Replace == with === for type-safe comparison'
                ));
            }
        }

        // Check for != instead of !==
        if (line.includes('!=') && !line.includes('!==')) {
            issues.push(this.createIssue(
                `loose-inequality-${lineNum}`,
                'warning',
                'Operators',
                'Use strict inequality (!==) instead of loose inequality (!=)',
                lineNum,
                line.indexOf('!='),
                'operators/strict-inequality',
                'Replace != with !== for type-safe comparison'
            ));
        }

        // Check for chained comparisons
        const chainedComparison = line.match(/([<>]=?)\s*[^&|]+\s*([<>]=?)/);
        if (chainedComparison) {
            issues.push(this.createIssue(
                `chained-comparison-${lineNum}`,
                'info',
                'Operators',
                'Chained comparison detected - ensure logical correctness',
                lineNum,
                line.indexOf(chainedComparison[1]),
                'operators/chained-comparison',
                'Consider breaking into separate conditions for clarity'
            ));
        }

        return issues;
    }

    /**
     * Check logical operators usage
     */
    private checkLogicalOperators(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for complex logical expressions
        const logicalCount = (line.match(/&&|\|\|/g) || []).length;
        if (logicalCount > 3) {
            issues.push(this.createIssue(
                `complex-logical-${lineNum}`,
                'warning',
                'Operators',
                'Complex logical expression detected - consider simplifying',
                lineNum,
                0,
                'operators/complex-logical',
                'Break complex logical expressions into smaller, named variables'
            ));
        }

        // Check for potential short-circuit evaluation issues
        if (line.includes('&&') && line.includes('=')) {
            const assignmentIndex = line.indexOf('=');
            const logicalIndex = line.indexOf('&&');
            if (logicalIndex < assignmentIndex) {
                issues.push(this.createIssue(
                    `short-circuit-assignment-${lineNum}`,
                    'info',
                    'Operators',
                    'Assignment in logical expression - verify short-circuit behavior',
                    lineNum,
                    logicalIndex,
                    'operators/short-circuit',
                    'Consider extracting assignment to separate statement'
                ));
            }
        }

        // Check for double negation
        if (line.includes('!!')) {
            issues.push(this.createIssue(
                `double-negation-${lineNum}`,
                'info',
                'Operators',
                'Double negation detected - consider explicit Boolean conversion',
                lineNum,
                line.indexOf('!!'),
                'operators/double-negation',
                'Use Boolean() constructor for explicit type conversion'
            ));
        }

        return issues;
    }

    /**
     * Check arithmetic operators usage
     */
    private checkArithmeticOperators(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for potential division by zero
        if (line.includes('/') && !line.includes('//') && !line.includes('*/')) {
            const divisionMatch = line.match(/\/\s*(\w+|\d+)/);
            if (divisionMatch && divisionMatch[1] === '0') {
                issues.push(this.createIssue(
                    `division-by-zero-${lineNum}`,
                    'error',
                    'Operators',
                    'Division by zero detected',
                    lineNum,
                    line.indexOf('/'),
                    'operators/division-by-zero',
                    'Add zero check before division operation'
                ));
            }
        }

        // Check for string concatenation with +
        if (line.includes('+') && (line.includes('"') || line.includes("'"))) {
            issues.push(this.createIssue(
                `string-concatenation-${lineNum}`,
                'info',
                'Operators',
                'String concatenation with + operator - consider template literals',
                lineNum,
                line.indexOf('+'),
                'operators/string-concatenation',
                'Use template literals (backticks) for string interpolation'
            ));
        }

        // Check for modulo operation
        if (line.includes('%') && !line.includes('/*') && !line.includes('*/')) {
            // This is just informational - modulo is valid
            const moduloMatch = line.match(/\s%\s/);
            if (moduloMatch) {
                issues.push(this.createIssue(
                    `modulo-usage-${lineNum}`,
                    'info',
                    'Operators',
                    'Modulo operator detected - ensure proper handling of negative numbers',
                    lineNum,
                    line.indexOf('%'),
                    'operators/modulo',
                    'Consider Math.abs() if always positive result needed'
                ));
            }
        }

        return issues;
    }

    /**
     * Check assignment operators usage
     */
    private checkAssignmentOperators(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for assignment in conditional
        if ((line.includes('if') || line.includes('while')) && line.includes('=') &&
            !line.includes('==') && !line.includes('===')) {
            issues.push(this.createIssue(
                `assignment-in-conditional-${lineNum}`,
                'warning',
                'Operators',
                'Assignment in conditional expression may be unintentional',
                lineNum,
                line.indexOf('='),
                'operators/assignment-in-conditional',
                'Use comparison operators or wrap assignment in parentheses if intentional'
            ));
        }

        // Check for compound assignment opportunities
        const simpleAssignment = line.match(/(\w+)\s*=\s*\1\s*([+\-*/%])\s*(.+)/);
        if (simpleAssignment) {
            const operator = simpleAssignment[2];
            issues.push(this.createIssue(
                `compound-assignment-${lineNum}`,
                'info',
                'Operators',
                `Consider using compound assignment operator (${operator}=)`,
                lineNum,
                line.indexOf('='),
                'operators/compound-assignment',
                `Replace with ${simpleAssignment[1]} ${operator}= ${simpleAssignment[3]}`
            ));
        }

        return issues;
    }

    /**
     * Check bitwise operators usage
     */
    private checkBitwiseOperators(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for bitwise operators in non-mathematical context
        const bitwiseOps = ['&', '|', '^', '~', '<<', '>>', '>>>'];
        bitwiseOps.forEach(op => {
            if (line.includes(op) && !line.includes(`${op}${op}`) && !line.includes(`${op}=`)) {
                // Skip if it's part of logical operators
                if ((op === '&' && line.includes('&&')) || (op === '|' && line.includes('||'))) {
                    return;
                }

                issues.push(this.createIssue(
                    `bitwise-operator-${lineNum}`,
                    'info',
                    'Operators',
                    `Bitwise operator ${op} detected - ensure intentional use`,
                    lineNum,
                    line.indexOf(op),
                    'operators/bitwise',
                    'Verify bitwise operation is intended, not logical operation'
                ));
            }
        });

        return issues;
    }

    /**
     * Check unary operators usage
     */
    private checkUnaryOperators(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for ++ and -- operators
        if (line.includes('++') || line.includes('--')) {
            const operator = line.includes('++') ? '++' : '--';
            // Check if it's postfix in complex expression
            const postfixMatch = line.match(/\w+(\+\+|--)/);
            if (postfixMatch && line.includes('=') && line.indexOf('=') !== line.indexOf(operator) + 2) {
                issues.push(this.createIssue(
                    `postfix-in-expression-${lineNum}`,
                    'warning',
                    'Operators',
                    'Postfix increment/decrement in complex expression',
                    lineNum,
                    line.indexOf(operator),
                    'operators/postfix-expression',
                    'Use prefix operator or separate statement for clarity'
                ));
            }
        }

        // Check for typeof operator
        if (line.includes('typeof')) {
            // Check if comparing with string literal
            if (!line.includes('"') && !line.includes("'")) {
                issues.push(this.createIssue(
                    `typeof-comparison-${lineNum}`,
                    'info',
                    'Operators',
                    'typeof operator should be compared with string literal',
                    lineNum,
                    line.indexOf('typeof'),
                    'operators/typeof',
                    'Compare typeof result with string literals like "string", "number", etc.'
                ));
            }
        }

        // Check for void operator
        if (line.includes('void')) {
            issues.push(this.createIssue(
                `void-operator-${lineNum}`,
                'info',
                'Operators',
                'void operator detected - ensure necessary',
                lineNum,
                line.indexOf('void'),
                'operators/void',
                'void operator is rarely needed in modern JavaScript'
            ));
        }

        return issues;
    }

    /**
     * Check modern JavaScript symbols
     */
    private checkModernJSSymbols(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for optional chaining
        if (line.includes('?.')) {
            // This is generally good - just informational
            issues.push(this.createIssue(
                `optional-chaining-${lineNum}`,
                'info',
                'Symbols',
                'Optional chaining operator used - good modern JS practice',
                lineNum,
                line.indexOf('?.'),
                'symbols/optional-chaining',
                'Ensure proper fallback handling for undefined values'
            ));
        }

        // Check for nullish coalescing
        if (line.includes('??')) {
            issues.push(this.createIssue(
                `nullish-coalescing-${lineNum}`,
                'info',
                'Symbols',
                'Nullish coalescing operator used - good modern JS practice',
                lineNum,
                line.indexOf('??'),
                'symbols/nullish-coalescing',
                'Preferred over || for null/undefined checks'
            ));
        }

        // Check for spread operator
        if (line.includes('...')) {
            // Check if used in function parameters vs calls
            if (line.includes('function') || line.includes('=>')) {
                issues.push(this.createIssue(
                    `rest-parameters-${lineNum}`,
                    'info',
                    'Symbols',
                    'Rest parameters used - ensure proper typing',
                    lineNum,
                    line.indexOf('...'),
                    'symbols/rest-parameters',
                    'Add proper TypeScript types for rest parameters'
                ));
            } else {
                issues.push(this.createIssue(
                    `spread-operator-${lineNum}`,
                    'info',
                    'Symbols',
                    'Spread operator used - ensure shallow copy behavior is intended',
                    lineNum,
                    line.indexOf('...'),
                    'symbols/spread-operator',
                    'Consider deep copy if nested objects are involved'
                ));
            }
        }

        // Check for template literals
        if (line.includes('`')) {
            if (!line.includes('${')) {
                issues.push(this.createIssue(
                    `template-literal-no-interpolation-${lineNum}`,
                    'info',
                    'Symbols',
                    'Template literal without interpolation - consider regular string',
                    lineNum,
                    line.indexOf('`'),
                    'symbols/template-literal',
                    'Use regular quotes for strings without interpolation'
                ));
            }
        }

        return issues;
    }

    /**
     * Check TypeScript-specific symbols
     */
    private checkTypeScriptSymbols(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for non-null assertion operator
        if (line.includes('!') && !line.includes('!=') && !line.includes('!==') && !line.includes('!!')) {
            const nonNullMatch = line.match(/(\w+)!/);
            if (nonNullMatch) {
                issues.push(this.createIssue(
                    `non-null-assertion-${lineNum}`,
                    'warning',
                    'Symbols',
                    'Non-null assertion operator (!) used - ensure value is not null/undefined',
                    lineNum,
                    line.indexOf('!'),
                    'symbols/non-null-assertion',
                    'Consider proper null checking instead of assertion'
                ));
            }
        }

        // Check for optional properties
        if (line.includes('?:') || (line.includes('?') && line.includes(':'))) {
            issues.push(this.createIssue(
                `optional-property-${lineNum}`,
                'info',
                'Symbols',
                'Optional property syntax detected',
                lineNum,
                line.indexOf('?'),
                'symbols/optional-property',
                'Good TypeScript practice for optional interface properties'
            ));
        }

        // Check for type assertions
        if (line.includes(' as ') || line.includes('<') && line.includes('>') && !line.includes('</')) {
            issues.push(this.createIssue(
                `type-assertion-${lineNum}`,
                'warning',
                'Symbols',
                'Type assertion detected - ensure type safety',
                lineNum,
                line.indexOf(' as ') || line.indexOf('<'),
                'symbols/type-assertion',
                'Prefer type guards over type assertions when possible'
            ));
        }

        // Check for generic type parameters
        if (this.REGEX_PATTERNS.genericType.test(line)) {
            issues.push(this.createIssue(
                `generic-type-${lineNum}`,
                'info',
                'Symbols',
                'Generic type parameters used - ensure proper constraints',
                lineNum,
                line.indexOf('<'),
                'symbols/generic-types',
                'Consider adding type constraints for better type safety'
            ));
        }

        return issues;
    }

    /**
     * Check punctuation symbols
     */
    private checkPunctuationSymbols(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for missing semicolons (configurable)
        const shouldHaveSemicolon = line.trim().length > 0 &&
            !line.trim().endsWith(';') &&
            !line.trim().endsWith('{') &&
            !line.trim().endsWith('}') &&
            !line.trim().endsWith(',') &&
            !line.includes('//') &&
            !['if', 'for', 'while', 'import', 'export', 'class', 'interface', 'type'].some(keyword =>
                line.trim().startsWith(keyword)) &&
            (line.includes('=') || line.includes('return') || line.includes('throw'));

        if (shouldHaveSemicolon) {
            issues.push(this.createIssue(
                `missing-semicolon-${lineNum}`,
                'info',
                'Symbols',
                'Missing semicolon',
                lineNum,
                line.length,
                'symbols/semicolon',
                'Add semicolon for consistent code style'
            ));
        }

        // Check for trailing commas in objects/arrays
        if ((line.includes('{') || line.includes('[')) && line.includes(',')) {
            const lastComma = line.lastIndexOf(',');
            const closingBracket = Math.max(line.lastIndexOf('}'), line.lastIndexOf(']'));
            if (closingBracket > lastComma && closingBracket - lastComma > 1) {
                issues.push(this.createIssue(
                    `missing-trailing-comma-${lineNum}`,
                    'info',
                    'Symbols',
                    'Consider adding trailing comma',
                    lineNum,
                    lastComma,
                    'symbols/trailing-comma',
                    'Trailing commas make diffs cleaner'
                ));
            }
        }

        return issues;
    }

    /**
     * Check special patterns and combinations
     */
    private checkSpecialPatterns(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for complex ternary operators
        if (line.includes('?') && line.includes(':')) {
            const ternaryCount = (line.match(/\?/g) || []).length;
            if (ternaryCount > 1) {
                issues.push(this.createIssue(
                    `nested-ternary-${lineNum}`,
                    'warning',
                    'Symbols',
                    'Nested ternary operators detected - consider if/else for readability',
                    lineNum,
                    line.indexOf('?'),
                    'symbols/nested-ternary',
                    'Break complex ternary into if/else statements'
                ));
            }
        }

        // Check for regex literals
        if (this.REGEX_PATTERNS.regexLiteral.test(line)) {
            issues.push(this.createIssue(
                `regex-literal-${lineNum}`,
                'info',
                'Symbols',
                'Regular expression literal detected',
                lineNum,
                line.indexOf('/'),
                'symbols/regex',
                'Consider using RegExp constructor for dynamic patterns'
            ));
        }

        // Check for destructuring patterns
        if (this.REGEX_PATTERNS.destructuring.test(line)) {
            issues.push(this.createIssue(
                `destructuring-${lineNum}`,
                'info',
                'Symbols',
                'Destructuring assignment used - good modern JS practice',
                lineNum,
                0,
                'symbols/destructuring',
                'Ensure all destructured properties exist to avoid undefined'
            ));
        }

        return issues;
    }

    /**
     * Semantic analysis rule checks
     */
    private checkSemanticRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            issues.push(
                ...this.checkSemanticHtml(line, lineNum),
                ...this.checkNamingConventions(line, lineNum),
                ...this.checkHeadingHierarchy(line, lineNum, lines, index),
                ...this.checkFormSemantics(line, lineNum),
                ...this.checkListSemantics(line, lineNum),
                ...this.checkAriaSemantics(line, lineNum)
            );
        });

        issues.push(...this.checkComponentStructure(code));
        return issues;
    }

    /**
     * Syntax analysis rule checks
     */
    private checkSyntaxRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            issues.push(
                ...this.checkBracketMatching(line, lineNum),
                ...this.checkJSXSyntax(line, lineNum),
                ...this.checkFunctionSyntax(line, lineNum),
                ...this.checkImportExportSyntax(line, lineNum),
                ...this.checkObjectArraySyntax(line, lineNum),
                ...this.checkConditionalSyntax(line, lineNum),
                ...this.checkCommonSyntaxErrors(line, lineNum)
            );
        });

        issues.push(...this.checkCodeStructureSyntax(code));
        return issues;
    }

    /**
     * Check for proper semantic HTML usage
     */
    private checkSemanticHtml(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (line.includes('<div') && !line.includes('className')) {
            const suggestions = this.getSuggestedSemanticElement(line);
            if (suggestions.length > 0) {
                issues.push(this.createIssue(
                    `semantic-html-${lineNum}`,
                    'warning',
                    'Semantics',
                    'Consider using semantic HTML elements instead of generic div',
                    lineNum,
                    line.indexOf('<div'),
                    'semantic-html/prefer-semantic-elements',
                    `Consider using: ${suggestions.join(', ')}`
                ));
            }
        }

        if (line.includes('return (') || line.includes('return(')) {
            const hasLandmarks = ['<main', '<header', '<nav', '<section'].some(tag => line.includes(tag));
            if (!hasLandmarks) {
                issues.push(this.createIssue(
                    `missing-landmarks-${lineNum}`,
                    'info',
                    'Semantics',
                    'Consider adding semantic landmark elements',
                    lineNum,
                    0,
                    'semantic-html/landmark-elements',
                    'Add appropriate landmark elements for better document structure'
                ));
            }
        }

        return issues;
    }

    /**
     * Check for meaningful naming conventions
     */
    private checkNamingConventions(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        const componentMatch = line.match(/(?:const|function)\s+([A-Z][a-zA-Z0-9]*)/);
        if (componentMatch) {
            const componentName = componentMatch[1];
            if (this.GENERIC_COMPONENT_NAMES.includes(componentName as any)) {
                issues.push(this.createIssue(
                    `generic-component-name-${lineNum}`,
                    'warning',
                    'Semantics',
                    `Component name '${componentName}' is too generic`,
                    lineNum,
                    line.indexOf(componentName),
                    'semantic-naming/meaningful-component-names',
                    'Use descriptive names that reflect the component\'s purpose'
                ));
            }
        }

        return issues;
    }

    private checkHeadingHierarchy(line: string, lineNum: number, lines: string[], index: number): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const headingMatch = line.match(/<h([1-6])/);

        if (headingMatch) {
            const currentLevel = parseInt(headingMatch[1], 10);
            for (let i = index - 1; i >= 0; i--) {
                const prevHeadingMatch = lines[i].match(/<h([1-6])/);
                if (prevHeadingMatch) {
                    const prevLevel = parseInt(prevHeadingMatch[1], 10);
                    if (currentLevel > prevLevel + 1) {
                        issues.push(this.createIssue(
                            `heading-hierarchy-${lineNum}`,
                            'warning',
                            'Semantics',
                            `Heading level h${currentLevel} skips levels (previous was h${prevLevel})`,
                            lineNum,
                            line.indexOf(`<h${currentLevel}`),
                            'semantic-html/heading-hierarchy',
                            'Use sequential heading levels for proper document structure'
                        ));
                    }
                    break;
                }
            }
        }
        return issues;
    }

    private checkFormSemantics(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (line.includes('<input') && !line.includes('aria-label') && !line.includes('id=')) {
            issues.push(this.createIssue(
                `input-without-label-${lineNum}`,
                'error',
                'Semantics',
                'Input element should have associated label or aria-label',
                lineNum,
                line.indexOf('<input'),
                'semantic-forms/input-labels',
                'Add id to input and associate with label, or use aria-label'
            ));
        }

        if (line.includes('<form') && !line.includes('onSubmit')) {
            issues.push(this.createIssue(
                `form-without-handler-${lineNum}`,
                'warning',
                'Semantics',
                'Form should have onSubmit handler for proper semantic behavior',
                lineNum,
                line.indexOf('<form'),
                'semantic-forms/form-handler',
                'Add onSubmit handler to form element'
            ));
        }

        return issues;
    }

    private checkListSemantics(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (line.includes('map(') && line.includes('<div')) {
            issues.push(this.createIssue(
                `div-list-${lineNum}`,
                'info',
                'Semantics',
                'Consider using ul/ol and li elements for lists instead of div',
                lineNum,
                line.indexOf('<div'),
                'semantic-html/proper-lists',
                'Use <ul><li> or <ol><li> for better semantic meaning'
            ));
        }

        return issues;
    }

    private checkAriaSemantics(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (line.includes('aria-label=') && this.hasRedundantAriaLabel(line)) {
            issues.push(this.createIssue(
                `redundant-aria-${lineNum}`,
                'info',
                'Semantics',
                'ARIA label may be redundant with existing semantic meaning',
                lineNum,
                line.indexOf('aria-label'),
                'semantic-aria/avoid-redundancy',
                'Remove redundant ARIA attributes when semantic HTML provides meaning'
            ));
        }

        return issues;
    }

    private checkComponentStructure(code: string): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const componentLines = code.split('\n').length;

        if (componentLines > 100) {
            issues.push(this.createIssue(
                'large-component',
                'info',
                'Semantics',
                'Large component detected - consider breaking into smaller components',
                1,
                0,
                'semantic-structure/component-size',
                'Split large components into smaller, single-responsibility components'
            ));
        }

        return issues;
    }

    private checkBracketMatching(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const stack: string[] = [];

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char in this.BRACKETS) {
                stack.push(char);
            } else if (Object.values(this.BRACKETS).includes(char)) {
                const lastOpen = stack.pop();
                if (!lastOpen || this.BRACKETS[lastOpen] !== char) {
                    issues.push(this.createIssue(
                        `bracket-mismatch-${lineNum}-${i}`,
                        'error',
                        'Syntax',
                        'Mismatched brackets or parentheses',
                        lineNum,
                        i,
                        'syntax/bracket-matching',
                        'Check bracket and parentheses pairing'
                    ));
                }
            }
        }

        return issues;
    }

    private checkJSXSyntax(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (line.includes('<') && line.includes('>') && !line.includes('/>') && !line.includes('</')) {
            const tagMatch = line.match(/<([a-zA-Z]+)/);
            if (tagMatch && this.VOID_ELEMENTS.includes(tagMatch[1] as any) && !line.includes('/>')) {
                issues.push(this.createIssue(
                    `self-closing-tag-${lineNum}`,
                    'warning',
                    'Syntax',
                    `Self-closing tag ${tagMatch[1]} should end with />`,
                    lineNum,
                    line.indexOf(`<${tagMatch[1]}`),
                    'jsx-syntax/self-closing-tags',
                    'Add /> to self-closing tags'
                ));
            }
        }

        if (line.includes('class=')) {
            issues.push(this.createIssue(
                `jsx-class-${lineNum}`,
                'error',
                'Syntax',
                'Use className instead of class in JSX',
                lineNum,
                line.indexOf('class='),
                'jsx-syntax/className',
                'Replace class with className'
            ));
        }

        if (line.includes('<!--')) {
            issues.push(this.createIssue(
                `jsx-comment-${lineNum}`,
                'error',
                'Syntax',
                'Use {/* */} for comments in JSX instead of HTML comments',
                lineNum,
                line.indexOf('<!--'),
                'jsx-syntax/comments',
                'Use {/* comment */} syntax for JSX comments'
            ));
        }

        return issues;
    }

    private checkFunctionSyntax(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        const arrowFunctionMatch = line.match(/=\s*\([^)]*\)\s*=>\s*{/);
        if (arrowFunctionMatch && !line.includes('return')) {
            issues.push(this.createIssue(
                `arrow-function-return-${lineNum}`,
                'warning',
                'Syntax',
                'Arrow function with block body should have explicit return',
                lineNum,
                line.indexOf('=>'),
                'function-syntax/explicit-return',
                'Add return statement or use implicit return with parentheses'
            ));
        }

        if (line.includes('function') && !line.includes('(')) {
            issues.push(this.createIssue(
                `function-syntax-${lineNum}`,
                'error',
                'Syntax',
                'Function declaration missing parentheses',
                lineNum,
                line.indexOf('function'),
                'function-syntax/parentheses',
                'Add parentheses after function name'
            ));
        }

        return issues;
    }

    private checkImportExportSyntax(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (line.includes('import') && line.includes('from') && !line.match(/from\s+['"`]/)) {
            issues.push(this.createIssue(
                `import-quotes-${lineNum}`,
                'error',
                'Syntax',
                'Import path should be enclosed in quotes',
                lineNum,
                line.indexOf('from'),
                'import-syntax/quotes',
                'Wrap import path in quotes'
            ));
        }

        return issues;
    }

    private checkObjectArraySyntax(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if ((line.includes('{') || line.includes('[')) && line.includes(',') &&
            (line.endsWith('}') || line.endsWith(']'))) {
            const lastCommaIndex = line.lastIndexOf(',');
            const lastBracketIndex = Math.max(line.lastIndexOf('}'), line.lastIndexOf(']'));
            if (lastCommaIndex < lastBracketIndex - 1) {
                issues.push(this.createIssue(
                    `trailing-comma-${lineNum}`,
                    'info',
                    'Syntax',
                    'Consider adding trailing comma for better diff readability',
                    lineNum,
                    lastBracketIndex - 1,
                    'object-syntax/trailing-comma',
                    'Add trailing comma after last property/element'
                ));
            }
        }

        return issues;
    }

    private checkConditionalSyntax(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (line.includes('?') && line.includes(':') && line.includes('<') && !line.includes('(')) {
            issues.push(this.createIssue(
                `ternary-parentheses-${lineNum}`,
                'warning',
                'Syntax',
                'Consider wrapping ternary operator in parentheses for clarity',
                lineNum,
                line.indexOf('?'),
                'conditional-syntax/ternary-parentheses',
                'Wrap ternary expressions in parentheses'
            ));
        }

        if ((line.includes('if') || line.includes('while')) && line.includes('=') &&
            !line.includes('==') && !line.includes('===')) {
            issues.push(this.createIssue(
                `assignment-in-conditional-${lineNum}`,
                'warning',
                'Syntax',
                'Assignment in conditional may be unintentional',
                lineNum,
                line.indexOf('='),
                'conditional-syntax/assignment',
                'Use === for comparison or wrap assignment in parentheses if intentional'
            ));
        }

        return issues;
    }

    private checkCommonSyntaxErrors(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        const shouldHaveSemicolon = line.trim().length > 0 &&
            !line.trim().endsWith(';') &&
            !line.trim().endsWith('{') &&
            !line.trim().endsWith('}') &&
            !line.trim().endsWith(',') &&
            !line.includes('//') &&
            !['if', 'for', 'while', 'import', 'export'].some(keyword => line.includes(keyword)) &&
            line.includes('=');

        if (shouldHaveSemicolon) {
            issues.push(this.createIssue(
                `missing-semicolon-${lineNum}`,
                'info',
                'Syntax',
                'Consider adding semicolon for consistency',
                lineNum,
                line.length,
                'syntax/semicolons',
                'Add semicolon at end of statement'
            ));
        }

        return issues;
    }

    private checkCodeStructureSyntax(code: string): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const stack: BracketPair[] = [];
        const lines = code.split('\n');

        lines.forEach((line, lineIndex) => {
            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char in this.BRACKETS) {
                    stack.push({ char, line: lineIndex + 1 });
                } else if (Object.values(this.BRACKETS).includes(char)) {
                    const lastOpen = stack.pop();
                    if (!lastOpen || this.BRACKETS[lastOpen.char] !== char) {
                        issues.push(this.createIssue(
                            `unmatched-bracket-${lineIndex + 1}`,
                            'error',
                            'Syntax',
                            'Unmatched bracket in code structure',
                            lineIndex + 1,
                            i,
                            'syntax/code-structure',
                            'Check bracket matching throughout the file'
                        ));
                    }
                }
            }
        });

        stack.forEach(({ char, line }) => {
            issues.push(this.createIssue(
                `unclosed-bracket-${line}`,
                'error',
                'Syntax',
                `Unclosed ${char} bracket`,
                line,
                0,
                'syntax/unclosed-brackets',
                `Add closing ${this.BRACKETS[char]} bracket`
            ));
        });

        return issues;
    }

    private checkBasicReactRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            if (trimmedLine.includes('({ ') && !code.includes('PropTypes') && !code.includes('interface')) {
                issues.push(this.createIssue(
                    `prop-types-${lineNum}`,
                    'warning',
                    'Type Safety',
                    'Missing PropTypes validation or TypeScript interface',
                    lineNum,
                    line.indexOf('({ '),
                    'react/prop-types',
                    'Add PropTypes validation or use TypeScript interfaces'
                ));
            }

            if (trimmedLine.includes('.map(') && !trimmedLine.includes('key=')) {
                issues.push(this.createIssue(
                    `missing-key-${lineNum}`,
                    'error',
                    'React',
                    'Missing key prop in list rendering',
                    lineNum,
                    line.indexOf('.map('),
                    'react/jsx-key',
                    'Add unique key prop to each rendered element'
                ));
            }

            if (this.REACT_HOOKS.some(hook => trimmedLine.includes(hook))) {
                if (!this.isInComponentContext(lines, index)) {
                    issues.push(this.createIssue(
                        `hook-outside-component-${lineNum}`,
                        'error',
                        'React Hooks',
                        'React hooks can only be called inside functional components',
                        lineNum,
                        line.indexOf('use'),
                        'react-hooks/rules-of-hooks',
                        'Move hook call inside component function'
                    ));
                }
            }

            if (['if', 'for', 'while'].some(keyword => trimmedLine.includes(keyword)) &&
                this.containsHook(trimmedLine)) {
                issues.push(this.createIssue(
                    `conditional-hook-${lineNum}`,
                    'error',
                    'React Hooks',
                    'React hooks cannot be called conditionally',
                    lineNum,
                    0,
                    'react-hooks/rules-of-hooks',
                    'Move hook calls to top level of component'
                ));
            }
        });

        return issues;
    }

    private checkTypeScriptRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            if (line.includes(': any') || line.includes('<any>')) {
                issues.push(this.createIssue(
                    `any-type-${lineNum}`,
                    'warning',
                    'TypeScript',
                    'Avoid using any type',
                    lineNum,
                    line.indexOf('any'),
                    '@typescript-eslint/no-explicit-any',
                    'Define proper types instead of using any'
                ));
            }

            if (line.includes('function') && line.includes('(') && !line.includes(':') && !line.includes('=>')) {
                issues.push(this.createIssue(
                    `missing-return-type-${lineNum}`,
                    'info',
                    'TypeScript',
                    'Function missing return type annotation',
                    lineNum,
                    line.indexOf('function'),
                    '@typescript-eslint/explicit-function-return-type',
                    'Add return type annotation to function'
                ));
            }

            if (line.includes('console.log')) {
                issues.push(this.createIssue(
                    `console-log-${lineNum}`,
                    'info',
                    'Code Quality',
                    'Remove console.log statement',
                    lineNum,
                    line.indexOf('console.log'),
                    'no-console',
                    'Use proper error handling instead of console.log'
                ));
            }
        });

        return issues;
    }

    private checkAccessibilityRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            if (line.includes('<img') && !line.includes('alt=')) {
                issues.push(this.createIssue(
                    `missing-alt-${lineNum}`,
                    'error',
                    'Accessibility',
                    'Image missing alt attribute',
                    lineNum,
                    line.indexOf('<img'),
                    'jsx-a11y/alt-text',
                    'Add descriptive alt attribute to image'
                ));
            }

            if (line.includes('<button') && !line.includes('aria-') && !line.includes('type=')) {
                issues.push(this.createIssue(
                    `a11y-button-${lineNum}`,
                    'warning',
                    'Accessibility',
                    'Button missing accessibility attributes',
                    lineNum,
                    line.indexOf('<button'),
                    'jsx-a11y/button-has-type',
                    'Add aria-label or proper button type'
                ));
            }
        });

        return issues;
    }

    private checkPerformanceRules(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            if (line.includes('style={{') || line.includes('onClick={() =>')) {
                issues.push(this.createIssue(
                    `inline-creation-${lineNum}`,
                    'warning',
                    'Performance',
                    'Inline object/function creation in render',
                    lineNum,
                    line.indexOf(line.includes('style={{') ? 'style={{' : 'onClick={() =>'),
                    'react/jsx-no-bind',
                    'Move object/function creation outside render or use useCallback/useMemo'
                ));
            }

            if (line.includes('import') && (line.includes('lodash') || line.includes('moment'))) {
                issues.push(this.createIssue(
                    `large-import-${lineNum}`,
                    'warning',
                    'Performance',
                    'Consider importing specific functions to reduce bundle size',
                    lineNum,
                    line.indexOf('import'),
                    'performance/selective-imports',
                    'Import only needed functions instead of entire library'
                ));
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
                            issues.push(this.createIssue(
                                `unused-import-${lineNum}-${importName}`,
                                'warning',
                                'Code Quality',
                                `Unused import: ${importName}`,
                                lineNum,
                                line.indexOf(importName),
                                'no-unused-vars',
                                `Remove unused import: ${importName}`
                            ));
                        }
                    });
                }
            }

            if (trimmedLine === '{}' || trimmedLine === '{ }') {
                issues.push(this.createIssue(
                    `empty-block-${lineNum}`,
                    'info',
                    'Code Quality',
                    'Empty block detected',
                    lineNum,
                    line.indexOf('{'),
                    'no-empty',
                    'Remove empty block or add implementation'
                ));
            }

            const numberMatch = trimmedLine.match(/\b(\d{2,})\b/);
            if (numberMatch && !line.includes('const') && !line.includes('=')) {
                const number = numberMatch[1];
                if (parseInt(number, 10) > 10) {
                    issues.push(this.createIssue(
                        `magic-number-${lineNum}`,
                        'info',
                        'Code Quality',
                        `Consider extracting magic number ${number} to a named constant`,
                        lineNum,
                        line.indexOf(number),
                        'no-magic-numbers',
                        'Define meaningful constant for numeric value'
                    ));
                }
            }

            const indentLevel = line.length - line.trimStart().length;
            if (indentLevel > 20) {
                issues.push(this.createIssue(
                    `deep-nesting-${lineNum}`,
                    'warning',
                    'Code Quality',
                    'Code is deeply nested - consider refactoring',
                    lineNum,
                    0,
                    'complexity/max-depth',
                    'Extract nested logic into separate functions or components'
                ));
            }

            if (line.length > 120) {
                issues.push(this.createIssue(
                    `long-line-${lineNum}`,
                    'info',
                    'Code Quality',
                    'Line is too long - consider breaking it up',
                    lineNum,
                    120,
                    'line-length/max-length',
                    'Break long line into multiple lines for better readability'
                ));
            }

            if (['TODO', 'FIXME', 'HACK'].some(keyword => line.includes(keyword))) {
                const keyword = ['TODO', 'FIXME', 'HACK'].find(k => line.includes(k))!;
                issues.push(this.createIssue(
                    `todo-comment-${lineNum}`,
                    'info',
                    'Code Quality',
                    `${keyword} comment found`,
                    lineNum,
                    line.indexOf(keyword),
                    'code-quality/todo-comments',
                    'Address TODO comments or create proper issue tracking'
                ));
            }
        });

        return issues;
    }

    /**
     * Calculate enhanced code metrics including operators and symbols quality
     */
    private calculateMetrics(code: string, issues: CodeIssue[]): EnhancedCodeMetrics {
        const complexityIndicators = code.match(/(if|for|while|switch|catch|\?\s*:)/g) || [];
        const complexity = Math.min(10, Math.max(1, 10 - Math.floor(complexityIndicators.length / 2)));

        const issuesByCategory = {
            semantics: issues.filter(issue => issue.category === 'Semantics').length,
            syntax: issues.filter(issue => issue.category === 'Syntax').length,
            typescript: issues.filter(issue => issue.category === 'TypeScript').length,
            performance: issues.filter(issue => issue.category === 'Performance').length,
            operators: issues.filter(issue => issue.category === 'Operators').length,
            symbols: issues.filter(issue => issue.category === 'Symbols').length
        };

        const maintainability = Math.min(10, Math.max(1, 10 - Math.floor(issues.length / 4)));

        const hasExports = code.includes('export');
        const hasPureFunctions = code.includes('const ') && code.includes('=>');
        const hasProperStructure = !issues.some(issue => issue.category === 'Syntax' && issue.type === 'error');
        const testability = hasExports && hasPureFunctions && hasProperStructure ? 8 : 6;

        const performance = Math.min(10, Math.max(1, 8 - issuesByCategory.performance));
        const semanticQuality = Math.min(10, Math.max(1, 10 - issuesByCategory.semantics));
        const syntaxQuality = Math.min(10, Math.max(1, 10 - issuesByCategory.syntax));
        const typeQuality = Math.min(10, Math.max(1, 10 - issuesByCategory.typescript));
        const operatorQuality = Math.min(10, Math.max(1, 10 - issuesByCategory.operators));
        const symbolQuality = Math.min(10, Math.max(1, 10 - issuesByCategory.symbols));

        return {
            complexity,
            maintainability,
            testability,
            performance,
            semanticQuality,
            syntaxQuality,
            typeQuality,
            operatorQuality,
            symbolQuality
        };
    }

    /**
     * Generate enhanced issue summary with operator and symbol categories
     */
    private generateSummary(issues: CodeIssue[]): EnhancedIssueSummary {
        const errors = issues.filter(issue => issue.type === 'error').length;
        const warnings = issues.filter(issue => issue.type === 'warning').length;
        const info = issues.filter(issue => issue.type === 'info').length;

        const byCategory: CategorySummary = {
            semantics: issues.filter(issue => issue.category === 'Semantics').length,
            syntax: issues.filter(issue => issue.category === 'Syntax').length,
            accessibility: issues.filter(issue => issue.category === 'Accessibility').length,
            performance: issues.filter(issue => issue.category === 'Performance').length,
            typescript: issues.filter(issue => issue.category === 'TypeScript').length,
            react: issues.filter(issue => issue.category === 'React' || issue.category === 'React Hooks').length,
            operators: issues.filter(issue => issue.category === 'Operators').length,
            symbols: issues.filter(issue => issue.category === 'Symbols').length
        };

        return {
            errors,
            warnings,
            info,
            total: issues.length,
            byCategory
        };
    }

    // Helper methods
    private isInComponentContext(lines: string[], currentIndex: number): boolean {
        for (let i = currentIndex - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.includes('function') && line.includes('(') && !line.includes('//')) {
                return true;
            }
            if (line.includes('const') && line.includes('=') && line.includes('=>')) {
                return true;
            }
            if (line.includes('class') && line.includes('extends')) {
                return true;
            }
        }
        return false;
    }

    private containsHook(line: string): boolean {
        return this.REACT_HOOKS.some(hook => line.includes(hook));
    }

    private getSuggestedSemanticElement(line: string): string[] {
        const suggestions: string[] = [];
        const lowerLine = line.toLowerCase();

        const elementMap = [
            { keywords: ['header'], element: '<header>' },
            { keywords: ['nav', 'menu'], element: '<nav>' },
            { keywords: ['main', 'content'], element: '<main>' },
            { keywords: ['article', 'post'], element: '<article>' },
            { keywords: ['section'], element: '<section>' },
            { keywords: ['aside', 'sidebar'], element: '<aside>' },
            { keywords: ['footer'], element: '<footer>' }
        ];

        elementMap.forEach(({ keywords, element }) => {
            if (keywords.some(keyword => lowerLine.includes(keyword))) {
                suggestions.push(element);
            }
        });

        return suggestions;
    }

    private hasContentIndicators(line: string): boolean {
        return this.CONTENT_INDICATORS.some(indicator => line.toLowerCase().includes(indicator));
    }

    private hasRedundantAriaLabel(line: string): boolean {
        return this.SEMANTIC_ELEMENTS.some(element => line.includes(`<${element}`));
    }

    /**
     * Helper method to create consistent CodeIssue objects
     */
    private createIssue(
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

// Export singleton instance
export const analyzer = new ReactCodeAnalyzer();

// Export enhanced types for external use
export type {
    EnhancedCodeMetrics,
    EnhancedIssueSummary,
    CategorySummary,
    BracketPair,
    OperatorUsage
};