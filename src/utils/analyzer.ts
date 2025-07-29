import { CodeIssue, AnalysisResult, CodeMetrics, IssueSummary } from '../types';

/**
 * Enhanced interfaces for comprehensive semantic analysis
 */
interface SemanticContext {
    componentName?: string;
    componentType: 'functional' | 'class' | 'unknown';
    propsInterface?: string;
    stateVariables: string[];
    effectDependencies: string[];
    customHooks: string[];
    isInsideComponent: boolean;
    isInsideHook: boolean;
    nestingLevel: number;
    currentFunction?: string;
}

interface SemanticRule {
    id: string;
    name: string;
    category: 'naming' | 'structure' | 'logic' | 'accessibility' | 'performance' | 'maintainability';
    severity: 'error' | 'warning' | 'info';
    description: string;
    check: (context: SemanticContext, line: string, lineNum: number, allLines: string[]) => CodeIssue[];
}

interface ComponentStructure {
    name: string;
    type: 'functional' | 'class';
    props: string[];
    state: string[];
    hooks: string[];
    methods: string[];
    complexity: number;
    linesOfCode: number;
    dependencies: string[];
}

interface SemanticPattern {
    pattern: RegExp;
    name: string;
    category: string;
    description: string;
    suggestion: string;
    severity: 'error' | 'warning' | 'info';
}

/**
 * Enhanced Semantic Analysis Engine for React/TypeScript Code
 */
export class EnhancedSemanticAnalyzer {
    private context: SemanticContext = {
        componentType: 'unknown',
        stateVariables: [],
        effectDependencies: [],
        customHooks: [],
        isInsideComponent: false,
        isInsideHook: false,
        nestingLevel: 0
    };

    // Enhanced semantic patterns
    private readonly SEMANTIC_PATTERNS: SemanticPattern[] = [
        {
            pattern: /^[a-z][a-zA-Z0-9]*$/,
            name: 'camelCase-variables',
            category: 'naming',
            description: 'Variables should use camelCase',
            suggestion: 'Use camelCase for variable names (e.g., userName, not user_name)',
            severity: 'warning'
        },
        {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            name: 'PascalCase-components',
            category: 'naming',
            description: 'Components should use PascalCase',
            suggestion: 'Use PascalCase for component names (e.g., UserProfile, not userprofile)',
            severity: 'error'
        },
        {
            pattern: /^use[A-Z][a-zA-Z0-9]*$/,
            name: 'hook-naming',
            category: 'naming',
            description: 'Custom hooks should start with "use"',
            suggestion: 'Custom hooks must start with "use" prefix',
            severity: 'error'
        },
        {
            pattern: /^(is|has|can|should|will|was|were|are)[A-Z][a-zA-Z0-9]*$/,
            name: 'boolean-naming',
            category: 'naming',
            description: 'Boolean variables should use descriptive prefixes',
            suggestion: 'Use prefixes like is, has, can, should for boolean variables',
            severity: 'info'
        }
    ];

    // Semantic anti-patterns to detect
    private readonly ANTI_PATTERNS = {
        GOD_COMPONENT: /^[\s\S]{2000,}$/m, // Components over 2000 characters
        DEEP_NESTING: /^(\s{8,})/m, // More than 8 spaces indentation
        MAGIC_NUMBERS: /\b(?<![\w.])\d{3,}(?![\w.])\b/g, // Numbers with 3+ digits
        GENERIC_NAMES: /\b(data|item|temp|result|value|thing|stuff|obj|arr)\b/gi,
        UNCLEAR_BOOLEAN: /\b(flag|check|test|val|var)\d*\b/gi,
        INCONSISTENT_NAMING: /([a-z]+_[a-z]+|[a-z]+[A-Z])/g
    };

    // React-specific semantic rules
    private readonly REACT_SEMANTIC_RULES = {
        COMPONENT_RESPONSIBILITY: 'Components should have single responsibility',
        PROP_DRILLING: 'Avoid excessive prop drilling (more than 3 levels)',
        STATE_MUTATION: 'Never mutate state directly',
        HOOK_DEPENDENCY: 'useEffect dependencies should be complete',
        CUSTOM_HOOK_EXTRACTION: 'Extract complex logic into custom hooks',
        COMPONENT_COMPOSITION: 'Prefer composition over inheritance'
    };

    // TypeScript semantic rules
    private readonly TYPESCRIPT_SEMANTIC_RULES = {
        TYPE_ANNOTATION: 'Prefer explicit type annotations for clarity',
        INTERFACE_NAMING: 'Interface names should be descriptive',
        GENERIC_CONSTRAINTS: 'Use generic constraints for type safety',
        UNION_EXHAUSTIVENESS: 'Handle all cases in union types',
        OPTIONAL_CHAINING: 'Use optional chaining for safe property access'
    };

    // Accessibility semantic rules
    private readonly A11Y_SEMANTIC_RULES = {
        SEMANTIC_HTML: 'Use semantic HTML elements appropriately',
        ARIA_LABELS: 'Provide meaningful ARIA labels',
        KEYBOARD_NAVIGATION: 'Ensure keyboard accessibility',
        COLOR_CONTRAST: 'Consider color contrast for readability',
        FOCUS_MANAGEMENT: 'Manage focus for dynamic content'
    };

    /**
     * Main semantic analysis method
     */
    public analyzeSemantics(code: string): AnalysisResult {
        const lines = code.split('\n');
        const issues: CodeIssue[] = [];

        // Initialize context
        this.initializeContext(code, lines);

        // Run all semantic analyses
        issues.push(
            ...this.analyzeNamingConventions(lines),
            ...this.analyzeComponentStructure(lines),
            ...this.analyzeLogicalFlow(lines),
            ...this.analyzeReactSemantics(lines),
            ...this.analyzeTypeScriptSemantics(lines),
            ...this.analyzeAccessibilitySemantics(lines),
            ...this.analyzePerformanceSemantics(lines),
            ...this.analyzeMaintainabilitySemantics(lines),
            ...this.analyzeArchitecturalPatterns(code, lines),
            ...this.analyzeCognitiveComplexity(lines),
            ...this.analyzeBusinessLogicSeparation(lines)
        );

        // Calculate metrics and summary
        const metrics = this.calculateSemanticMetrics(code, issues);
        const summary = this.generateSemanticSummary(issues);

        return { issues, metrics, summary };
    }

    /**
     * Initialize semantic context by analyzing the code structure
     */
    private initializeContext(code: string, lines: string[]): void {
        this.context = {
            componentType: this.detectComponentType(code),
            stateVariables: this.extractStateVariables(lines),
            effectDependencies: this.extractEffectDependencies(lines),
            customHooks: this.extractCustomHooks(lines),
            isInsideComponent: false,
            isInsideHook: false,
            nestingLevel: 0,
            componentName: this.extractComponentName(lines)
        };
    }

    /**
     * Analyze naming conventions throughout the code
     */
    private analyzeNamingConventions(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check component naming
            const componentMatch = line.match(/(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/);
            if (componentMatch) {
                const componentName = componentMatch[1];
                issues.push(...this.validateComponentName(componentName, lineNum, line));
            }

            // Check variable naming
            const variableMatches: any = line.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
            for (const match of variableMatches) {
                const variableName = match[1];
                issues.push(...this.validateVariableName(variableName, lineNum, line));
            }

            // Check function naming
            const functionMatch = line.match(/(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=)/);
            if (functionMatch) {
                const functionName = functionMatch[1] || functionMatch[2];
                issues.push(...this.validateFunctionName(functionName, lineNum, line));
            }

            // Check hook naming
            if (line.includes('use') && line.includes('=')) {
                const hookMatch = line.match(/const\s+(use[A-Z][a-zA-Z0-9]*)/);
                if (hookMatch) {
                    issues.push(...this.validateHookName(hookMatch[1], lineNum, line));
                }
            }

            // Check boolean naming
            const booleanMatch = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:true|false|!)/);
            if (booleanMatch) {
                issues.push(...this.validateBooleanName(booleanMatch[1], lineNum, line));
            }

            // Check interface/type naming
            const typeMatch = line.match(/(?:interface|type)\s+([A-Z][a-zA-Z0-9]*)/);
            if (typeMatch) {
                issues.push(...this.validateTypeName(typeMatch[1], lineNum, line));
            }
        });

        return issues;
    }

    /**
     * Analyze component structure and organization
     */
    private analyzeComponentStructure(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const structure = this.extractComponentStructure(lines);

        // Check component size
        if (structure.linesOfCode > 200) {
            issues.push(this.createSemanticIssue(
                'large-component',
                'warning',
                'structure',
                'Component is too large - consider breaking it down',
                1,
                0,
                'semantic/component-size',
                'Split into smaller, focused components'
            ));
        }

        // Check component complexity
        if (structure.complexity > 10) {
            issues.push(this.createSemanticIssue(
                'complex-component',
                'warning',
                'structure',
                'Component has high cyclomatic complexity',
                1,
                0,
                'semantic/component-complexity',
                'Reduce complexity by extracting logic into separate functions'
            ));
        }

        // Check hook usage patterns
        if (structure.hooks.length > 8) {
            issues.push(this.createSemanticIssue(
                'many-hooks',
                'info',
                'structure',
                'Component uses many hooks - consider custom hook extraction',
                1,
                0,
                'semantic/hook-count',
                'Extract related hooks into custom hooks'
            ));
        }

        // Check prop drilling
        const propDepth = this.calculatePropDrillingDepth(lines);
        if (propDepth > 3) {
            issues.push(this.createSemanticIssue(
                'prop-drilling',
                'warning',
                'structure',
                'Excessive prop drilling detected',
                1,
                0,
                'semantic/prop-drilling',
                'Consider using Context API or state management'
            ));
        }

        return issues;
    }

    /**
     * Analyze logical flow and control structures
     */
    private analyzeLogicalFlow(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for deeply nested conditions
            const indentLevel = (line.match(/^\s*/)?.[0].length || 0) / 2;
            if (indentLevel > 5) {
                issues.push(this.createSemanticIssue(
                    `deep-nesting-${lineNum}`,
                    'warning',
                    'logic',
                    'Deeply nested code structure',
                    lineNum,
                    0,
                    'semantic/deep-nesting',
                    'Consider extracting nested logic into separate functions'
                ));
            }

            // Check for complex conditions
            const conditionComplexity = (line.match(/&&|\|\|/g) || []).length;
            if (conditionComplexity > 3) {
                issues.push(this.createSemanticIssue(
                    `complex-condition-${lineNum}`,
                    'info',
                    'logic',
                    'Complex conditional expression',
                    lineNum,
                    0,
                    'semantic/complex-condition',
                    'Break complex conditions into named boolean variables'
                ));
            }

            // Check for early returns pattern
            if (line.includes('if') && !line.includes('return') &&
                lines[index + 1]?.trim().includes('return')) {
                issues.push(this.createSemanticIssue(
                    `early-return-opportunity-${lineNum}`,
                    'info',
                    'logic',
                    'Consider early return pattern',
                    lineNum,
                    0,
                    'semantic/early-return',
                    'Use early returns to reduce nesting'
                ));
            }

            // Check for magic numbers
            const magicNumbers = line.match(/\b(?<![\w.])\d{2,}(?![\w.])\b/g);
            if (magicNumbers) {
                magicNumbers.forEach(number => {
                    if (parseInt(number) > 10) {
                        issues.push(this.createSemanticIssue(
                            `magic-number-${lineNum}-${number}`,
                            'info',
                            'logic',
                            `Magic number detected: ${number}`,
                            lineNum,
                            line.indexOf(number),
                            'semantic/magic-numbers',
                            'Define meaningful constants for numeric values'
                        ));
                    }
                });
            }
        });

        return issues;
    }

    /**
     * Analyze React-specific semantic patterns
     */
    private analyzeReactSemantics(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check useEffect dependencies
            if (line.includes('useEffect')) {
                const effectIssues = this.analyzeUseEffectPattern(lines, index);
                issues.push(...effectIssues);
            }

            // Check useState patterns
            if (line.includes('useState')) {
                const stateIssues = this.analyzeUseStatePattern(line, lineNum);
                issues.push(...stateIssues);
            }

            // Check custom hook extraction opportunities
            if (this.isComplexLogicInComponent(line, lines, index)) {
                issues.push(this.createSemanticIssue(
                    `custom-hook-opportunity-${lineNum}`,
                    'info',
                    'structure',
                    'Complex logic could be extracted to custom hook',
                    lineNum,
                    0,
                    'semantic/custom-hook-extraction',
                    'Extract reusable logic into custom hooks'
                ));
            }

            // Check for direct state mutation
            if (this.isDirectStateMutation(line)) {
                issues.push(this.createSemanticIssue(
                    `state-mutation-${lineNum}`,
                    'error',
                    'logic',
                    'Direct state mutation detected',
                    lineNum,
                    0,
                    'semantic/state-mutation',
                    'Use state setter functions instead of direct mutation'
                ));
            }

            // Check component composition patterns
            if (line.includes('render') && line.includes('props')) {
                issues.push(...this.analyzeCompositionPattern(line, lineNum));
            }
        });

        return issues;
    }

    /**
     * Analyze TypeScript-specific semantic patterns
     */
    private analyzeTypeScriptSemantics(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for missing type annotations
            if (this.isMissingTypeAnnotation(line)) {
                issues.push(this.createSemanticIssue(
                    `missing-type-${lineNum}`,
                    'info',
                    'maintainability',
                    'Consider adding explicit type annotation',
                    lineNum,
                    0,
                    'semantic/type-annotation',
                    'Add type annotation for better code documentation'
                ));
            }

            // Check for overly broad types
            if (line.includes(': any') || line.includes('<any>')) {
                issues.push(this.createSemanticIssue(
                    `broad-type-${lineNum}`,
                    'warning',
                    'maintainability',
                    'Overly broad type annotation',
                    lineNum,
                    line.indexOf('any'),
                    'semantic/broad-types',
                    'Use more specific types instead of any'
                ));
            }

            // Check for generic constraints
            if (line.includes('<T>') && !line.includes('extends')) {
                issues.push(this.createSemanticIssue(
                    `unconstrained-generic-${lineNum}`,
                    'info',
                    'maintainability',
                    'Consider constraining generic type',
                    lineNum,
                    line.indexOf('<T>'),
                    'semantic/generic-constraints',
                    'Add constraints to generic types for better type safety'
                ));
            }

            // Check for proper error handling types
            if (line.includes('catch') && !line.includes(': Error')) {
                issues.push(this.createSemanticIssue(
                    `error-type-${lineNum}`,
                    'info',
                    'maintainability',
                    'Consider typing catch block parameter',
                    lineNum,
                    0,
                    'semantic/error-types',
                    'Type catch parameters as Error or specific error types'
                ));
            }
        });

        return issues;
    }

    /**
     * Analyze accessibility semantic patterns
     */
    private analyzeAccessibilitySemantics(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check semantic HTML usage
            if (line.includes('<div') && this.shouldUseSemanticElement(line)) {
                const suggestedElement = this.suggestSemanticElement(line);
                issues.push(this.createSemanticIssue(
                    `semantic-html-${lineNum}`,
                    'warning',
                    'accessibility',
                    'Consider using semantic HTML element',
                    lineNum,
                    line.indexOf('<div'),
                    'semantic/semantic-html',
                    `Consider using ${suggestedElement} instead of div`
                ));
            }

            // Check for interactive elements without proper semantics
            if (this.isInteractiveElement(line) && !this.hasProperSemantics(line)) {
                issues.push(this.createSemanticIssue(
                    `interactive-semantics-${lineNum}`,
                    'warning',
                    'accessibility',
                    'Interactive element lacks proper semantics',
                    lineNum,
                    0,
                    'semantic/interactive-semantics',
                    'Add proper ARIA attributes or use semantic HTML'
                ));
            }

            // Check for form elements without labels
            if (this.isFormElement(line) && !this.hasAssociatedLabel(line, lines, index)) {
                issues.push(this.createSemanticIssue(
                    `form-label-${lineNum}`,
                    'error',
                    'accessibility',
                    'Form element without associated label',
                    lineNum,
                    0,
                    'semantic/form-labels',
                    'Associate form elements with descriptive labels'
                ));
            }

            // Check for heading hierarchy
            const headingLevel = this.getHeadingLevel(line);
            if (headingLevel && !this.isProperHeadingHierarchy(headingLevel, lines, index)) {
                issues.push(this.createSemanticIssue(
                    `heading-hierarchy-${lineNum}`,
                    'warning',
                    'accessibility',
                    'Improper heading hierarchy',
                    lineNum,
                    0,
                    'semantic/heading-hierarchy',
                    'Use sequential heading levels (h1, h2, h3, etc.)'
                ));
            }
        });

        return issues;
    }

    /**
     * Analyze performance-related semantic patterns
     */
    private analyzePerformanceSemantics(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for expensive operations in render
            if (this.isExpensiveOperation(line) && this.isInRenderMethod(lines, index)) {
                issues.push(this.createSemanticIssue(
                    `expensive-render-${lineNum}`,
                    'warning',
                    'performance',
                    'Expensive operation in render method',
                    lineNum,
                    0,
                    'semantic/expensive-render',
                    'Move expensive operations to useMemo or useCallback'
                ));
            }

            // Check for missing React.memo opportunities
            if (this.isPureComponent(lines, index) && !this.hasMemoization(lines, index)) {
                issues.push(this.createSemanticIssue(
                    `memo-opportunity-${lineNum}`,
                    'info',
                    'performance',
                    'Component could benefit from React.memo',
                    lineNum,
                    0,
                    'semantic/memo-opportunity',
                    'Wrap component with React.memo for performance optimization'
                ));
            }

            // Check for unnecessary re-renders
            if (this.causesUnnecessaryReRender(line)) {
                issues.push(this.createSemanticIssue(
                    `unnecessary-rerender-${lineNum}`,
                    'warning',
                    'performance',
                    'Potential unnecessary re-render trigger',
                    lineNum,
                    0,
                    'semantic/unnecessary-rerender',
                    'Use useCallback or useMemo to prevent unnecessary re-renders'
                ));
            }
        });

        return issues;
    }

    /**
     * Analyze maintainability semantic patterns
     */
    private analyzeMaintainabilitySemantics(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for code duplication patterns
            if (this.isDuplicatedLogic(line, lines, index)) {
                issues.push(this.createSemanticIssue(
                    `duplicated-logic-${lineNum}`,
                    'info',
                    'maintainability',
                    'Potential code duplication detected',
                    lineNum,
                    0,
                    'semantic/code-duplication',
                    'Extract common logic into reusable functions'
                ));
            }

            // Check for long parameter lists
            const parameterCount = this.countParameters(line);
            if (parameterCount > 5) {
                issues.push(this.createSemanticIssue(
                    `long-parameter-list-${lineNum}`,
                    'warning',
                    'maintainability',
                    'Function has too many parameters',
                    lineNum,
                    0,
                    'semantic/parameter-count',
                    'Consider using an options object for multiple parameters'
                ));
            }

            // Check for unclear variable scope
            if (this.hasUnclearScope(line, lines, index)) {
                issues.push(this.createSemanticIssue(
                    `unclear-scope-${lineNum}`,
                    'info',
                    'maintainability',
                    'Variable scope could be clearer',
                    lineNum,
                    0,
                    'semantic/variable-scope',
                    'Declare variables in the smallest possible scope'
                ));
            }
        });

        return issues;
    }

    /**
     * Analyze architectural patterns and code organization
     */
    private analyzeArchitecturalPatterns(code: string, lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check separation of concerns
        if (this.hasMixedConcerns(code)) {
            issues.push(this.createSemanticIssue(
                'mixed-concerns',
                'warning',
                'structure',
                'Mixed concerns detected in component',
                1,
                0,
                'semantic/separation-of-concerns',
                'Separate business logic, UI logic, and data fetching'
            ));
        }

        // Check for proper abstraction layers
        if (this.hasInappropriateAbstraction(code)) {
            issues.push(this.createSemanticIssue(
                'inappropriate-abstraction',
                'info',
                'structure',
                'Inappropriate level of abstraction',
                1,
                0,
                'semantic/abstraction-level',
                'Ensure consistent abstraction levels throughout the code'
            ));
        }

        // Check dependency direction
        if (this.hasWrongDependencyDirection(lines)) {
            issues.push(this.createSemanticIssue(
                'wrong-dependency-direction',
                'warning',
                'structure',
                'Dependencies point in wrong direction',
                1,
                0,
                'semantic/dependency-direction',
                'Higher-level modules should not depend on lower-level modules'
            ));
        }

        return issues;
    }

    /**
     * Analyze cognitive complexity of the code
     */
    private analyzeCognitiveComplexity(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];
        let cognitiveScore = 0;

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Add complexity for control structures
            if (line.includes('if') || line.includes('else') || line.includes('switch')) {
                cognitiveScore += 1;
            }
            if (line.includes('for') || line.includes('while') || line.includes('do')) {
                cognitiveScore += 1;
            }
            if (line.includes('catch') || line.includes('finally')) {
                cognitiveScore += 1;
            }

            // Add complexity for nested structures
            const nestingLevel = (line.match(/^\s*/)?.[0].length || 0) / 2;
            if (nestingLevel > 2) {
                cognitiveScore += nestingLevel - 2;
            }

            // Add complexity for logical operators
            const logicalOps = (line.match(/&&|\|\|/g) || []).length;
            cognitiveScore += logicalOps;
        });

        if (cognitiveScore > 15) {
            issues.push(this.createSemanticIssue(
                'high-cognitive-complexity',
                'warning',
                'maintainability',
                `High cognitive complexity: ${cognitiveScore}`,
                1,
                0,
                'semantic/cognitive-complexity',
                'Break down complex logic into smaller, simpler functions'
            ));
        }

        return issues;
    }

    /**
     * Analyze separation between business logic and presentation
     */
    private analyzeBusinessLogicSeparation(lines: string[]): CodeIssue[] {
        const issues: CodeIssue[] = [];

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // Check for business logic in JSX
            if (this.hasBusinessLogicInJSX(line)) {
                issues.push(this.createSemanticIssue(
                    `business-logic-in-jsx-${lineNum}`,
                    'warning',
                    'structure',
                    'Business logic should not be in JSX',
                    lineNum,
                    0,
                    'semantic/business-logic-separation',
                    'Extract business logic to separate functions or hooks'
                ));
            }

            // Check for presentation logic in business functions
            if (this.hasPresentationLogicInBusinessFunction(line, lines, index)) {
                issues.push(this.createSemanticIssue(
                    `presentation-in-business-${lineNum}`,
                    'warning',
                    'structure',
                    'Presentation logic in business function',
                    lineNum,
                    0,
                    'semantic/presentation-separation',
                    'Keep presentation logic separate from business logic'
                ));
            }
        });

        return issues;
    }

    // Validation methods for naming conventions
    private validateComponentName(name: string, lineNum: number, line: string): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
            issues.push(this.createSemanticIssue(
                `component-naming-${lineNum}`,
                'error',
                'naming',
                'Component name should use PascalCase',
                lineNum,
                line.indexOf(name),
                'semantic/component-naming',
                'Use PascalCase for component names (e.g., UserProfile)'
            ));
        }

        if (['Component', 'Element', 'Item', 'Container', 'Wrapper'].includes(name)) {
            issues.push(this.createSemanticIssue(
                `generic-component-name-${lineNum}`,
                'warning',
                'naming',
                'Component name is too generic',
                lineNum,
                line.indexOf(name),
                'semantic/meaningful-names',
                'Use descriptive names that reflect the component\'s purpose'
            ));
        }

        return issues;
    }

    private validateVariableName(name: string, lineNum: number, line: string): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (!/^[a-z][a-zA-Z0-9]*$/.test(name) && !['_', '$'].includes(name[0])) {
            issues.push(this.createSemanticIssue(
                `variable-naming-${lineNum}`,
                'warning',
                'naming',
                'Variable name should use camelCase',
                lineNum,
                line.indexOf(name),
                'semantic/variable-naming',
                'Use camelCase for variable names (e.g., userName, not user_name)'
            ));
        }

        if (['data', 'item', 'temp', 'result', 'value', 'thing', 'stuff'].includes(name.toLowerCase())) {
            issues.push(this.createSemanticIssue(
                `generic-variable-name-${lineNum}`,
                'info',
                'naming',
                'Variable name is too generic',
                lineNum,
                line.indexOf(name),
                'semantic/meaningful-names',
                'Use descriptive names that clearly indicate the variable\'s purpose'
            ));
        }

        if (name.length < 3 && !['i', 'j', 'k', 'x', 'y', 'z'].includes(name)) {
            issues.push(this.createSemanticIssue(
                `short-variable-name-${lineNum}`,
                'info',
                'naming',
                'Variable name is too short',
                lineNum,
                line.indexOf(name),
                'semantic/descriptive-names',
                'Use longer, more descriptive variable names'
            ));
        }

        return issues;
    }

    private validateFunctionName(name: string, lineNum: number, line: string): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (!/^[a-z][a-zA-Z0-9]*$/.test(name) && !name.startsWith('use')) {
            issues.push(this.createSemanticIssue(
                `function-naming-${lineNum}`,
                'warning',
                'naming',
                'Function name should use camelCase',
                lineNum,
                line.indexOf(name),
                'semantic/function-naming',
                'Use camelCase for function names (e.g., handleClick, not handle_click)'
            ));
        }

        // Check for verb-noun pattern
        if (!/^(get|set|is|has|can|should|will|handle|create|update|delete|fetch|send|receive|process|validate|calculate|format|parse|render|toggle|show|hide|open|close|start|stop|play|pause|reset|clear|save|load|export|import)/.test(name)) {
            issues.push(this.createSemanticIssue(
                `function-verb-pattern-${lineNum}`,
                'info',
                'naming',
                'Function name should start with a verb',
                lineNum,
                line.indexOf(name),
                'semantic/function-verb-pattern',
                'Use verb-noun pattern for function names (e.g., getUserData, handleButtonClick)'
            ));
        }

        return issues;
    }

    private validateHookName(name: string, lineNum: number, line: string): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (!name.startsWith('use')) {
            issues.push(this.createSemanticIssue(
                `hook-naming-${lineNum}`,
                'error',
                'naming',
                'Custom hook must start with "use"',
                lineNum,
                line.indexOf(name),
                'semantic/hook-naming',
                'Custom hooks must start with "use" prefix for React rules compliance'
            ));
        }

        if (!/^use[A-Z][a-zA-Z0-9]*$/.test(name)) {
            issues.push(this.createSemanticIssue(
                `hook-case-${lineNum}`,
                'warning',
                'naming',
                'Hook name should use camelCase after "use"',
                lineNum,
                line.indexOf(name),
                'semantic/hook-case',
                'Use camelCase for hook names (e.g., useUserData, not useuserdata)'
            ));
        }

        return issues;
    }

    private validateBooleanName(name: string, lineNum: number, line: string): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (!/^(is|has|can|should|will|was|were|are)[A-Z]/.test(name) && !['enabled', 'disabled', 'visible', 'hidden', 'loading', 'error'].includes(name)) {
            issues.push(this.createSemanticIssue(
                `boolean-naming-${lineNum}`,
                'info',
                'naming',
                'Boolean variable should use descriptive prefix',
                lineNum,
                line.indexOf(name),
                'semantic/boolean-naming',
                'Use prefixes like is, has, can, should for boolean variables (e.g., isVisible, hasError)'
            ));
        }

        return issues;
    }

    private validateTypeName(name: string, lineNum: number, line: string): CodeIssue[] {
        const issues: CodeIssue[] = [];

        if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
            issues.push(this.createSemanticIssue(
                `type-naming-${lineNum}`,
                'error',
                'naming',
                'Type/Interface name should use PascalCase',
                lineNum,
                line.indexOf(name),
                'semantic/type-naming',
                'Use PascalCase for type and interface names'
            ));
        }

        if (name.endsWith('Type') || name.endsWith('Interface')) {
            issues.push(this.createSemanticIssue(
                `redundant-type-suffix-${lineNum}`,
                'info',
                'naming',
                'Avoid redundant Type/Interface suffix',
                lineNum,
                line.indexOf(name),
                'semantic/type-suffix',
                'Remove Type/Interface suffix from type names'
            ));
        }

        return issues;
    }

    // Helper methods for structural analysis
    private detectComponentType(code: string): 'functional' | 'class' | 'unknown' {
        if (code.includes('class') && code.includes('extends')) {
            return 'class';
        } else if (code.includes('function') || code.includes('=>')) {
            return 'functional';
        }
        return 'unknown';
    }

    private extractStateVariables(lines: string[]): string[] {
        const stateVars: string[] = [];
        lines.forEach(line => {
            const match = line.match(/const\s+\[([^,]+),\s*set[A-Z][a-zA-Z0-9]*\]\s*=\s*useState/);
            if (match) {
                stateVars.push(match[1].trim());
            }
        });
        return stateVars;
    }

    private extractEffectDependencies(lines: string[]): string[] {
        const dependencies: string[] = [];
        lines.forEach(line => {
            const match = line.match(/useEffect\([^,]+,\s*\[([^\]]*)\]/);
            if (match) {
                const deps = match[1].split(',').map(dep => dep.trim()).filter(dep => dep);
                dependencies.push(...deps);
            }
        });
        return dependencies;
    }

    private extractCustomHooks(lines: string[]): string[] {
        const hooks: string[] = [];
        lines.forEach(line => {
            const match = line.match(/const\s+(use[A-Z][a-zA-Z0-9]*)\s*=/);
            if (match) {
                hooks.push(match[1]);
            }
        });
        return hooks;
    }

    private extractComponentName(lines: string[]): string | undefined {
        for (const line of lines) {
            const match = line.match(/(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/);
            if (match) {
                return match[1];
            }
        }
        return undefined;
    }

    private extractComponentStructure(lines: string[]): ComponentStructure {
        const structure: any = {
            name: this.extractComponentName(lines) || 'Unknown',
            type: this.detectComponentType(lines.join('\n')),
            props: [],
            state: this.extractStateVariables(lines),
            hooks: this.extractCustomHooks(lines),
            methods: [],
            complexity: this.calculateCyclomaticComplexity(lines),
            linesOfCode: lines.filter(line => line.trim().length > 0).length,
            dependencies: this.extractDependencies(lines)
        };

        return structure;
    }

    private calculateCyclomaticComplexity(lines: string[]): number {
        let complexity = 1; // Base complexity
        lines.forEach(line => {
            // Add complexity for control flow statements
            if (line.includes('if') || line.includes('else if')) complexity++;
            if (line.includes('for') || line.includes('while') || line.includes('do')) complexity++;
            if (line.includes('switch')) complexity++;
            if (line.includes('case')) complexity++;
            if (line.includes('catch')) complexity++;
            if (line.includes('&&') || line.includes('||')) complexity++;
            if (line.includes('?') && line.includes(':')) complexity++;
        });
        return complexity;
    }

    private calculatePropDrillingDepth(lines: string[]): number {
        let maxDepth = 0;
        let currentDepth = 0;

        lines.forEach(line => {
            if (line.includes('props.') || line.includes('{...props}')) {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            if (line.includes('return') || line.includes('}')) {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        });

        return maxDepth;
    }

    private extractDependencies(lines: string[]): string[] {
        const dependencies: string[] = [];
        lines.forEach(line => {
            const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
                dependencies.push(importMatch[1]);
            }
        });
        return dependencies;
    }

    // Pattern detection methods
    private analyzeUseEffectPattern(lines: string[], effectIndex: number): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const effectLine = lines[effectIndex];
        const lineNum = effectIndex + 1;

        // Check for missing dependency array
        if (effectLine.includes('useEffect') && !effectLine.includes('[')) {
            let nextLineIndex = effectIndex + 1;
            let foundDependencyArray = false;

            while (nextLineIndex < lines.length && nextLineIndex < effectIndex + 5) {
                if (lines[nextLineIndex].includes('[') && lines[nextLineIndex].includes(']')) {
                    foundDependencyArray = true;
                    break;
                }
                nextLineIndex++;
            }

            if (!foundDependencyArray) {
                issues.push(this.createSemanticIssue(
                    `useeffect-missing-deps-${lineNum}`,
                    'warning',
                    'logic',
                    'useEffect missing dependency array',
                    lineNum,
                    0,
                    'semantic/useeffect-deps',
                    'Add dependency array to useEffect to prevent infinite re-renders'
                ));
            }
        }

        // Check for effect cleanup
        if (effectLine.includes('addEventListener') || effectLine.includes('setInterval') || effectLine.includes('setTimeout')) {
            let hasCleanup = false;
            for (let i = effectIndex; i < Math.min(effectIndex + 10, lines.length); i++) {
                if (lines[i].includes('return') && lines[i + 1]?.includes('removeEventListener') ||
                    lines[i].includes('clearInterval') || lines[i].includes('clearTimeout')) {
                    hasCleanup = true;
                    break;
                }
            }

            if (!hasCleanup) {
                issues.push(this.createSemanticIssue(
                    `useeffect-missing-cleanup-${lineNum}`,
                    'warning',
                    'logic',
                    'useEffect with side effects missing cleanup',
                    lineNum,
                    0,
                    'semantic/useeffect-cleanup',
                    'Add cleanup function to prevent memory leaks'
                ));
            }
        }

        return issues;
    }

    private analyzeUseStatePattern(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for proper state naming convention
        const stateMatch = line.match(/const\s+\[([^,]+),\s*([^,\]]+)\]/);
        if (stateMatch) {
            const stateName = stateMatch[1].trim();
            const setterName = stateMatch[2].trim();

            const expectedSetter = `set${stateName.charAt(0).toUpperCase()}${stateName.slice(1)}`;
            if (setterName !== expectedSetter) {
                issues.push(this.createSemanticIssue(
                    `useState-naming-${lineNum}`,
                    'info',
                    'naming',
                    'useState setter name doesn\'t follow convention',
                    lineNum,
                    line.indexOf(setterName),
                    'semantic/usestate-naming',
                    `Use ${expectedSetter} instead of ${setterName}`
                ));
            }
        }

        return issues;
    }

    private isComplexLogicInComponent(line: string, lines: string[], index: number): boolean {
        // Check if there's complex business logic that could be extracted
        const hasComplexCalculation = line.includes('reduce') || line.includes('filter') || line.includes('map');
        const hasMultipleOperations = (line.match(/\./g) || []).length > 3;
        const isInRender = this.isInRenderMethod(lines, index);

        return (hasComplexCalculation || hasMultipleOperations) && isInRender;
    }

    private isDirectStateMutation(line: string): boolean {
        // Check for direct state mutation patterns
        return /\w+\.(push|pop|shift|unshift|splice|sort|reverse)\s*\(/.test(line) ||
            /\w+\[\w+\]\s*=/.test(line) ||
            /\w+\.\w+\s*=/.test(line);
    }

    private analyzeCompositionPattern(line: string, lineNum: number): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Check for render props pattern
        if (line.includes('render=') || line.includes('children=')) {
            issues.push(this.createSemanticIssue(
                `composition-pattern-${lineNum}`,
                'info',
                'structure',
                'Good use of composition pattern detected',
                lineNum,
                0,
                'semantic/composition-pattern',
                'Consider if this pattern is the best choice for the use case'
            ));
        }

        return issues;
    }

    // TypeScript pattern detection
    private isMissingTypeAnnotation(line: string): boolean {
        // Function parameters without types
        if (line.includes('function') && line.includes('(') && !line.includes(':')) {
            return true;
        }

        // Variables without explicit types that could benefit from them
        if (line.includes('const') && line.includes('=') && !line.includes(':') &&
            (line.includes('fetch') || line.includes('axios') || line.includes('localStorage'))) {
            return true;
        }

        return false;
    }

    // Accessibility pattern detection
    private shouldUseSemanticElement(line: string): boolean {
        const indicators = ['button', 'link', 'navigation', 'header', 'footer', 'main', 'article', 'section'];
        return indicators.some(indicator => line.toLowerCase().includes(indicator));
    }

    private suggestSemanticElement(line: string): string {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('button') || lowerLine.includes('click')) return '<button>';
        if (lowerLine.includes('link') || lowerLine.includes('href')) return '<a>';
        if (lowerLine.includes('navigation') || lowerLine.includes('nav')) return '<nav>';
        if (lowerLine.includes('header')) return '<header>';
        if (lowerLine.includes('footer')) return '<footer>';
        if (lowerLine.includes('main')) return '<main>';
        if (lowerLine.includes('article')) return '<article>';
        if (lowerLine.includes('section')) return '<section>';
        return '<div>';
    }

    private isInteractiveElement(line: string): boolean {
        return line.includes('onClick') || line.includes('onKeyDown') ||
            line.includes('onFocus') || line.includes('onBlur') ||
            line.includes('tabIndex');
    }

    private hasProperSemantics(line: string): boolean {
        return line.includes('role=') || line.includes('aria-') ||
            line.includes('<button') || line.includes('<a ');
    }

    private isFormElement(line: string): boolean {
        return line.includes('<input') || line.includes('<select') ||
            line.includes('<textarea') || line.includes('<checkbox');
    }

    private hasAssociatedLabel(line: string, lines: string[], index: number): boolean {
        if (line.includes('aria-label') || line.includes('aria-labelledby')) {
            return true;
        }

        // Check for associated label in nearby lines
        const idMatch = line.match(/id=['"]([^'"]+)['"]/);
        if (idMatch) {
            const id = idMatch[1];
            for (let i = Math.max(0, index - 3); i <= Math.min(lines.length - 1, index + 3); i++) {
                if (lines[i].includes(`htmlFor="${id}"`) || lines[i].includes(`htmlFor='${id}'`)) {
                    return true;
                }
            }
        }

        return false;
    }

    private getHeadingLevel(line: string): number | null {
        const match = line.match(/<h([1-6])/);
        return match ? parseInt(match[1]) : null;
    }

    private isProperHeadingHierarchy(level: number, lines: string[], index: number): boolean {
        // Find previous heading
        for (let i = index - 1; i >= 0; i--) {
            const prevLevel = this.getHeadingLevel(lines[i]);
            if (prevLevel) {
                return level <= prevLevel + 1;
            }
        }
        return level === 1; // First heading should be h1
    }

    // Performance pattern detection
    private isExpensiveOperation(line: string): boolean {
        return line.includes('sort()') || line.includes('filter(') ||
            line.includes('reduce(') || line.includes('find(') ||
            line.includes('map(') || line.includes('forEach(') ||
            line.includes('JSON.parse') || line.includes('JSON.stringify');
    }

    private isInRenderMethod(lines: string[], index: number): boolean {
        // Look backwards to see if we're in a render method or component body
        for (let i = index; i >= 0; i--) {
            if (lines[i].includes('return (') || lines[i].includes('return(')) {
                return true;
            }
            if (lines[i].includes('function') || lines[i].includes('=>')) {
                break;
            }
        }
        return false;
    }

    private isPureComponent(lines: string[], index: number): boolean {
        // Simple heuristic: component that only depends on props
        const componentCode = lines.slice(Math.max(0, index - 10), Math.min(lines.length, index + 10)).join('\n');
        return !componentCode.includes('useState') &&
            !componentCode.includes('useEffect') &&
            componentCode.includes('props');
    }

    private hasMemoization(lines: string[], index: number): boolean {
        const componentCode = lines.slice(Math.max(0, index - 10), Math.min(lines.length, index + 10)).join('\n');
        return componentCode.includes('React.memo') || componentCode.includes('useMemo') || componentCode.includes('useCallback');
    }

    private causesUnnecessaryReRender(line: string): boolean {
        return line.includes('style={{') ||
            line.includes('onClick={()') ||
            line.includes('onChange={()') ||
            line.includes('onSubmit={()');
    }

    // Maintainability pattern detection
    private isDuplicatedLogic(line: string, lines: string[], index: number): boolean {
        const trimmedLine = line.trim();
        if (trimmedLine.length < 10) return false;

        let duplicateCount = 0;
        lines.forEach((otherLine, otherIndex) => {
            if (otherIndex !== index && otherLine.trim() === trimmedLine) {
                duplicateCount++;
            }
        });

        return duplicateCount > 0;
    }

    private countParameters(line: string): number {
        const match = line.match(/\(([^)]+)\)/);
        if (!match) return 0;

        const params = match[1].split(',').filter(param => param.trim().length > 0);
        return params.length;
    }

    private hasUnclearScope(line: string, lines: string[], index: number): boolean {
        // Check for variables declared far from their usage
        const varMatch = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (!varMatch) return false;

        const varName = varMatch[1];
        let usageCount = 0;
        let lastUsage = index;

        for (let i = index + 1; i < Math.min(lines.length, index + 20); i++) {
            if (lines[i].includes(varName)) {
                usageCount++;
                lastUsage = i;
            }
        }

        return usageCount > 0 && (lastUsage - index) > 10;
    }

    // Architectural pattern detection
    private hasMixedConcerns(code: string): boolean {
        const hasDataFetching = code.includes('fetch') || code.includes('axios') || code.includes('api');
        const hasUILogic = code.includes('useState') || code.includes('render') || code.includes('return (');
        const hasBusinessLogic = code.includes('calculate') || code.includes('validate') || code.includes('process');

        return (hasDataFetching && hasUILogic && hasBusinessLogic);
    }

    private hasInappropriateAbstraction(code: string): boolean {
        // Check for inconsistent abstraction levels
        const hasLowLevelOperations = code.includes('document.') || code.includes('window.');
        const hasHighLevelComponents = code.includes('Component') || code.includes('Provider');

        return hasLowLevelOperations && hasHighLevelComponents;
    }

    private hasWrongDependencyDirection(lines: string[]): boolean {
        // Simplified check for dependency inversion
        let hasHighLevelImports = false;
        let hasLowLevelImplementation = false;

        lines.forEach(line => {
            if (line.includes('import') && (line.includes('Component') || line.includes('Provider'))) {
                hasHighLevelImports = true;
            }
            if (line.includes('document.') || line.includes('localStorage') || line.includes('fetch')) {
                hasLowLevelImplementation = true;
            }
        });

        return hasHighLevelImports && hasLowLevelImplementation;
    }

    private hasBusinessLogicInJSX(line: string): boolean {
        return line.includes('<') && line.includes('>') &&
            (line.includes('calculate') || line.includes('validate') ||
                line.includes('process') || line.includes('transform'));
    }

    private hasPresentationLogicInBusinessFunction(line: string, lines: string[], index: number): boolean {
        // Check if we're in a business function that contains presentation logic
        const isInBusinessFunction = this.isInBusinessFunction(lines, index);
        const hasPresentationLogic = line.includes('style') || line.includes('className') ||
            line.includes('render') || line.includes('<');

        return isInBusinessFunction && hasPresentationLogic;
    }

    private isInBusinessFunction(lines: string[], index: number): boolean {
        // Look for function names that suggest business logic
        for (let i = index; i >= Math.max(0, index - 10); i--) {
            const line = lines[i];
            if (line.includes('function') || line.includes('=>')) {
                return /\b(calculate|validate|process|transform|compute|analyze|generate)\w*/i.test(line);
            }
        }
        return false;
    }

    // Metrics calculation
    private calculateSemanticMetrics(code: string, issues: CodeIssue[]): any {
        const lines = code.split('\n');
        const complexity = this.calculateCyclomaticComplexity(lines);

        const issuesByCategory = {
            naming: issues.filter(issue => issue.category === 'naming').length,
            structure: issues.filter(issue => issue.category === 'structure').length,
            logic: issues.filter(issue => issue.category === 'logic').length,
            accessibility: issues.filter(issue => issue.category === 'accessibility').length,
            performance: issues.filter(issue => issue.category === 'performance').length,
            maintainability: issues.filter(issue => issue.category === 'maintainability').length
        };

        // Calculate quality scores (1-10 scale)
        const semanticQuality = Math.max(1, 10 - issuesByCategory.naming - issuesByCategory.structure);
        const syntaxQuality = Math.max(1, 10 - Math.floor(issues.filter(i => i.type === 'error').length / 2));
        const typeQuality = Math.max(1, 10 - issues.filter(i => i.message.includes('type')).length);
        const operatorQuality = Math.max(1, 10 - issues.filter(i => i.message.includes('operator')).length);
        const symbolQuality = Math.max(1, 10 - issues.filter(i => i.message.includes('symbol')).length);

        const maintainability = Math.max(1, 10 - issuesByCategory.maintainability);
        const testability = this.calculateTestability(code);
        const performance = Math.max(1, 10 - issuesByCategory.performance);

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

    private calculateTestability(code: string): number {
        let score = 5; // Base score

        // Positive factors
        if (code.includes('export')) score += 2; // Exportable functions
        if (code.includes('pure') || !code.includes('side effect')) score += 1;
        if (code.includes('interface') || code.includes('type')) score += 1;
        if (!code.includes('document.') && !code.includes('window.')) score += 1;

        // Negative factors
        if (code.includes('localStorage') || code.includes('sessionStorage')) score -= 1;
        if (code.includes('Date.now') || code.includes('Math.random')) score -= 1;
        if (code.includes('setTimeout') || code.includes('setInterval')) score -= 1;

        return Math.max(1, Math.min(10, score));
    }

    private generateSemanticSummary(issues: CodeIssue[]): any {
        const errors = issues.filter(issue => issue.type === 'error').length;
        const warnings = issues.filter(issue => issue.type === 'warning').length;
        const info = issues.filter(issue => issue.type === 'info').length;

        const byCategory: any = {
            semantics: issues.filter(issue => issue.category === 'naming' || issue.category === 'structure').length,
            syntax: issues.filter(issue => issue.category === 'Syntax').length,
            accessibility: issues.filter(issue => issue.category === 'accessibility').length,
            performance: issues.filter(issue => issue.category === 'performance').length,
            typescript: issues.filter(issue => issue.category === 'TypeScript').length,
            react: issues.filter(issue => issue.category === 'React').length,
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

    /**
     * Helper method to create semantic issues
     */
    private createSemanticIssue(
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
            category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize category
            message,
            line,
            column,
            rule,
            suggestion
        };
    }

    /**
     * Public method to get semantic analysis report
     */
    public getSemanticReport(code: string): {
        summary: string;
        recommendations: string[];
        patterns: string[];
        metrics: any;
    } {
        const analysis = this.analyzeSemantics(code);

        const summary = `Analyzed ${code.split('\n').length} lines of code. ` +
            `Found ${analysis.issues.length} semantic issues: ` +
            `${analysis.summary.errors} errors, ${analysis.summary.warnings} warnings, ${analysis.summary.info} suggestions.`;

        const recommendations = this.generateRecommendations(analysis.issues);
        const patterns = this.identifyPatterns(code, analysis.issues);

        return {
            summary,
            recommendations,
            patterns,
            metrics: analysis.metrics as any
        };
    }

    private generateRecommendations(issues: CodeIssue[]): string[] {
        const recommendations: string[] = [];

        const errorCount = issues.filter(i => i.type === 'error').length;
        const warningCount = issues.filter(i => i.type === 'warning').length;
        const infoCount = issues.filter(i => i.type === 'info').length;

        // High-priority recommendations based on error patterns
        if (errorCount > 0) {
            recommendations.push('🚨 Critical: Fix all error-level issues before deployment');

            const namingErrors = issues.filter(i => i.type === 'error' && i.category === 'Naming').length;
            if (namingErrors > 0) {
                recommendations.push('📝 Fix naming convention violations for better code maintainability');
            }

            const syntaxErrors = issues.filter(i => i.type === 'error' && i.category === 'Syntax').length;
            if (syntaxErrors > 0) {
                recommendations.push('🔧 Resolve syntax errors to prevent runtime failures');
            }
        }

        // Medium-priority recommendations based on warning patterns
        if (warningCount > 5) {
            recommendations.push('⚠️ Consider addressing warning-level issues to improve code quality');

            const structureWarnings = issues.filter(i => i.type === 'warning' && i.category === 'Structure').length;
            if (structureWarnings > 2) {
                recommendations.push('🏗️ Refactor component structure for better maintainability');
            }

            const performanceWarnings = issues.filter(i => i.type === 'warning' && i.category === 'Performance').length;
            if (performanceWarnings > 0) {
                recommendations.push('⚡ Optimize performance by addressing render-related issues');
            }

            const accessibilityWarnings = issues.filter(i => i.type === 'warning' && i.category === 'Accessibility').length;
            if (accessibilityWarnings > 0) {
                recommendations.push('♿ Improve accessibility for better user experience');
            }
        }

        // Code quality recommendations
        const complexityIssues = issues.filter(i => i.message.includes('complexity') || i.message.includes('nested'));
        if (complexityIssues.length > 0) {
            recommendations.push('🎯 Reduce code complexity by extracting functions and simplifying logic');
        }

        const duplicateIssues = issues.filter(i => i.message.includes('duplicate') || i.message.includes('repeated'));
        if (duplicateIssues.length > 0) {
            recommendations.push('♻️ Extract common logic to reduce code duplication');
        }

        // React-specific recommendations
        const hookIssues = issues.filter(i => i.message.includes('hook') || i.message.includes('useEffect') || i.message.includes('useState'));
        if (hookIssues.length > 2) {
            recommendations.push('🪝 Review React hooks usage and consider custom hook extraction');
        }

        // TypeScript recommendations
        const typeIssues = issues.filter(i => i.message.includes('type') || i.message.includes('any') || i.message.includes('annotation'));
        if (typeIssues.length > 0) {
            recommendations.push('📘 Improve type safety with better TypeScript annotations');
        }

        // General recommendations based on issue count
        if (infoCount > 10) {
            recommendations.push('💡 Consider addressing informational suggestions for code excellence');
        }

        // Architecture recommendations
        const architectureIssues = issues.filter(i =>
            i.message.includes('separation') ||
            i.message.includes('abstraction') ||
            i.message.includes('dependency')
        );
        if (architectureIssues.length > 0) {
            recommendations.push('🏛️ Review architecture patterns for better code organization');
        }

        // Add default recommendation if no specific patterns found
        if (recommendations.length === 0) {
            recommendations.push('✅ Code quality looks good! Continue following best practices');
        }

        return recommendations;
    }

    private identifyPatterns(code: string, issues: CodeIssue[]): string[] {
        const patterns: string[] = [];

        // Analyze code patterns
        const lines = code.split('\n');
        const totalLines = lines.length;

        // Component patterns
        if (code.includes('useState') && code.includes('useEffect')) {
            patterns.push('📊 Stateful functional component with side effects');
        } else if (code.includes('useState')) {
            patterns.push('📊 Stateful functional component');
        } else if (code.includes('useEffect')) {
            patterns.push('📊 Component with side effects only');
        } else {
            patterns.push('📊 Pure/stateless component');
        }

        // Hook patterns
        const customHooks = issues.filter(i => i.message.includes('custom hook')).length;
        if (customHooks > 0) {
            patterns.push('🪝 Custom hooks usage detected');
        }

        const hookCount = (code.match(/use[A-Z]\w+/g) || []).length;
        if (hookCount > 5) {
            patterns.push('🪝 Heavy hooks usage - consider optimization');
        }

        // Complexity patterns
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(lines);
        if (cyclomaticComplexity > 10) {
            patterns.push('🌀 High cyclomatic complexity detected');
        } else if (cyclomaticComplexity > 5) {
            patterns.push('🌀 Moderate complexity - manageable');
        } else {
            patterns.push('🌀 Low complexity - good maintainability');
        }

        // Size patterns
        if (totalLines > 200) {
            patterns.push('📏 Large component - consider splitting');
        } else if (totalLines > 100) {
            patterns.push('📏 Medium-sized component');
        } else {
            patterns.push('📏 Compact component size');
        }

        // TypeScript patterns
        const hasTypes = code.includes('interface') || code.includes('type ') || code.includes(': ');
        if (hasTypes) {
            patterns.push('📘 TypeScript types usage detected');
        }

        const hasGenerics = code.includes('<T>') || code.includes('<T,') || code.includes('<');
        if (hasGenerics) {
            patterns.push('📘 Generic types usage detected');
        }

        // Accessibility patterns
        const a11yElements = (code.match(/aria-\w+|role=|alt=/g) || []).length;
        if (a11yElements > 0) {
            patterns.push('♿ Accessibility considerations present');
        }

        // Performance patterns
        const memoization = code.includes('useMemo') || code.includes('useCallback') || code.includes('React.memo');
        if (memoization) {
            patterns.push('⚡ Performance optimization techniques used');
        }

        // Error handling patterns
        const errorHandling = code.includes('try') || code.includes('catch') || code.includes('error');
        if (errorHandling) {
            patterns.push('🛡️ Error handling mechanisms detected');
        }

        // Testing patterns
        const testable = !code.includes('document.') && !code.includes('window.') && code.includes('export');
        if (testable) {
            patterns.push('🧪 Code appears testable');
        }

        return patterns;
    }

    /**
     * Advanced semantic analysis methods
     */
    public analyzeCodeSmells(code: string): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = code.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // God Object/Component smell
            if (this.isGodComponent(code)) {
                issues.push(this.createSemanticIssue(
                    'god-component',
                    'warning',
                    'structure',
                    'Component has too many responsibilities',
                    lineNum,
                    0,
                    'code-smell/god-component',
                    'Break down into smaller, focused components'
                ));
            }

            // Long Parameter List smell
            const paramCount = this.countParameters(line);
            if (paramCount > 6) {
                issues.push(this.createSemanticIssue(
                    `long-parameter-list-${lineNum}`,
                    'warning',
                    'structure',
                    'Function has too many parameters',
                    lineNum,
                    0,
                    'code-smell/long-parameter-list',
                    'Use parameter object or builder pattern'
                ));
            }

            // Duplicate Code smell
            if (this.hasDuplicateCode(line, lines, index)) {
                issues.push(this.createSemanticIssue(
                    `duplicate-code-${lineNum}`,
                    'info',
                    'maintainability',
                    'Potential code duplication detected',
                    lineNum,
                    0,
                    'code-smell/duplicate-code',
                    'Extract common logic into shared functions'
                ));
            }

            // Dead Code smell
            if (this.isDeadCode(line, code)) {
                issues.push(this.createSemanticIssue(
                    `dead-code-${lineNum}`,
                    'info',
                    'maintainability',
                    'Potentially unused code detected',
                    lineNum,
                    0,
                    'code-smell/dead-code',
                    'Remove unused code to reduce complexity'
                ));
            }

            // Primitive Obsession smell
            if (this.hasPrimitiveObsession(line)) {
                issues.push(this.createSemanticIssue(
                    `primitive-obsession-${lineNum}`,
                    'info',
                    'structure',
                    'Consider using domain objects instead of primitives',
                    lineNum,
                    0,
                    'code-smell/primitive-obsession',
                    'Create value objects for related primitive data'
                ));
            }

            // Feature Envy smell
            if (this.hasFeatureEnvy(line)) {
                issues.push(this.createSemanticIssue(
                    `feature-envy-${lineNum}`,
                    'info',
                    'structure',
                    'Method seems more interested in other class than its own',
                    lineNum,
                    0,
                    'code-smell/feature-envy',
                    'Move method closer to the data it uses'
                ));
            }
        });

        return issues;
    }

    public analyzeDesignPatterns(code: string): { patterns: string[], antiPatterns: string[] } {
        const patterns: string[] = [];
        const antiPatterns: string[] = [];

        // Observer Pattern
        if (code.includes('addEventListener') || code.includes('subscribe') || code.includes('emit')) {
            patterns.push('Observer Pattern - Event-driven architecture');
        }

        // Strategy Pattern
        if (code.includes('switch') && code.includes('case') && code.includes('function')) {
            antiPatterns.push('Switch Statement - Consider Strategy Pattern');
        }

        // Factory Pattern
        if (code.includes('create') && code.includes('new ') && code.includes('switch')) {
            patterns.push('Factory Pattern - Object creation abstraction');
        }

        // Singleton Pattern (Anti-pattern in React)
        if (code.includes('getInstance') || (code.includes('let instance') && code.includes('null'))) {
            antiPatterns.push('Singleton Pattern - Avoid in React applications');
        }

        // Hook Pattern (React-specific)
        if (code.includes('useState') || code.includes('useEffect')) {
            patterns.push('React Hooks Pattern - Modern state management');
        }

        // Higher-Order Component Pattern
        if (code.includes('WithAuth') || code.includes('withLoading') || code.includes('connect(')) {
            patterns.push('Higher-Order Component Pattern');
        }

        // Render Props Pattern
        if (code.includes('render=') || code.includes('children={')) {
            patterns.push('Render Props Pattern - Component composition');
        }

        // Context Pattern
        if (code.includes('createContext') || code.includes('useContext')) {
            patterns.push('Context Pattern - State sharing without prop drilling');
        }

        // Custom Hook Pattern
        if (code.includes('use') && code.includes('function') && code.includes('useState')) {
            patterns.push('Custom Hook Pattern - Logic reuse');
        }

        // God Component Anti-pattern
        if (code.length > 2000 || (code.match(/useState/g) || []).length > 5) {
            antiPatterns.push('God Component - Component doing too much');
        }

        // Prop Drilling Anti-pattern
        if ((code.match(/props\./g) || []).length > 10) {
            antiPatterns.push('Prop Drilling - Consider Context or state management');
        }

        return { patterns, antiPatterns };
    }

    public generateSemanticScore(code: string): {
        overallScore: number;
        breakdown: {
            naming: number;
            structure: number;
            complexity: number;
            maintainability: number;
            performance: number;
            accessibility: number;
        };
        grade: string;
    } {
        const analysis = this.analyzeSemantics(code);
        const issues = analysis.issues;
        const lines = code.split('\n');

        // Calculate individual scores (0-100)
        const naming = Math.max(0, 100 - (issues.filter(i => i.category === 'Naming').length * 5));
        const structure = Math.max(0, 100 - (issues.filter(i => i.category === 'Structure').length * 8));
        const complexity = Math.max(0, 100 - (this.calculateCyclomaticComplexity(lines) * 5));
        const maintainability = Math.max(0, 100 - (issues.filter(i => i.category === 'Maintainability').length * 6));
        const performance = Math.max(0, 100 - (issues.filter(i => i.category === 'Performance').length * 10));
        const accessibility = Math.max(0, 100 - (issues.filter(i => i.category === 'Accessibility').length * 8));

        const breakdown = {
            naming,
            structure,
            complexity,
            maintainability,
            performance,
            accessibility
        };

        // Calculate weighted overall score
        const overallScore = Math.round(
            naming * 0.15 +           // 15% weight
            structure * 0.25 +        // 25% weight
            complexity * 0.20 +       // 20% weight
            maintainability * 0.20 +  // 20% weight
            performance * 0.10 +      // 10% weight
            accessibility * 0.10      // 10% weight
        );

        // Determine grade
        let grade: string;
        if (overallScore >= 90) grade = 'A+';
        else if (overallScore >= 85) grade = 'A';
        else if (overallScore >= 80) grade = 'A-';
        else if (overallScore >= 75) grade = 'B+';
        else if (overallScore >= 70) grade = 'B';
        else if (overallScore >= 65) grade = 'B-';
        else if (overallScore >= 60) grade = 'C+';
        else if (overallScore >= 55) grade = 'C';
        else if (overallScore >= 50) grade = 'C-';
        else if (overallScore >= 45) grade = 'D+';
        else if (overallScore >= 40) grade = 'D';
        else grade = 'F';

        return {
            overallScore,
            breakdown,
            grade
        };
    }

    // Helper methods for code smell detection
    private isGodComponent(code: string): boolean {
        const lines = code.split('\n').length;
        const methods = (code.match(/function\s+\w+|const\s+\w+\s*=/g) || []).length;
        const hooks = (code.match(/use[A-Z]\w+/g) || []).length;

        return lines > 300 || methods > 15 || hooks > 8;
    }

    private hasDuplicateCode(line: string, lines: string[], index: number): boolean {
        const trimmedLine = line.trim();
        if (trimmedLine.length < 20) return false;

        let duplicateCount = 0;
        lines.forEach((otherLine, otherIndex) => {
            if (otherIndex !== index && otherLine.trim() === trimmedLine) {
                duplicateCount++;
            }
        });

        return duplicateCount >= 2;
    }

    private isDeadCode(line: string, code: string): boolean {
        // Check for unused imports
        const importMatch = line.match(/import\s+\{([^}]+)\}/);
        if (importMatch) {
            const imports = importMatch[1].split(',').map(imp => imp.trim());
            return imports.some(imp => {
                const importName = imp.split(' as ')[0].trim();
                return !code.includes(importName) || code.indexOf(importName) === code.indexOf(line);
            });
        }

        // Check for unused variables
        const varMatch = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (varMatch) {
            const varName = varMatch[1];
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            const matches = code.match(regex) || [];
            return matches.length <= 1; // Only declaration, no usage
        }

        return false;
    }

    private hasPrimitiveObsession(line: string): boolean {
        // Look for multiple related primitive parameters
        const primitiveParams = line.match(/\b(string|number|boolean)\b/g);
        return (primitiveParams || []).length > 3;
    }

    private hasFeatureEnvy(line: string): boolean {
        // Check for excessive dot notation (accessing other object's properties)
        const dotCount = (line.match(/\./g) || []).length;
        const chainLength = line.match(/\w+(\.\w+){3,}/);

        return dotCount > 5 || chainLength !== null;
    }

    /**
     * Public interface methods
     */
    public generateFullSemanticReport(code: string): {
        analysis: AnalysisResult;
        recommendations: string[];
        patterns: string[];
        codeSmells: CodeIssue[];
        designPatterns: { patterns: string[], antiPatterns: string[] };
        score: {
            overallScore: number;
            breakdown: any;
            grade: string;
        };
        summary: string;
    } {
        const analysis = this.analyzeSemantics(code);
        const recommendations = this.generateRecommendations(analysis.issues);
        const patterns = this.identifyPatterns(code, analysis.issues);
        const codeSmells = this.analyzeCodeSmells(code);
        const designPatterns = this.analyzeDesignPatterns(code);
        const score = this.generateSemanticScore(code);

        const summary = this.generateExecutiveSummary(analysis, score, codeSmells.length, designPatterns);

        return {
            analysis,
            recommendations,
            patterns,
            codeSmells,
            designPatterns,
            score,
            summary
        };
    }

    private generateExecutiveSummary(
        analysis: AnalysisResult,
        score: any,
        codeSmellCount: number,
        designPatterns: { patterns: string[], antiPatterns: string[] }
    ): string {
        const lines = analysis.metrics ? 'N/A' : 'multiple'; // Fallback if metrics not available
        const grade = score.grade;
        const overallScore = score.overallScore;

        let summary = `📊 **Code Quality Report**\n\n`;
        summary += `**Overall Grade:** ${grade} (${overallScore}/100)\n\n`;
        summary += `**Issues Found:** ${analysis.summary.total} total - `;
        summary += `${analysis.summary.errors} errors, ${analysis.summary.warnings} warnings, ${analysis.summary.info} suggestions\n\n`;

        if (codeSmellCount > 0) {
            summary += `**Code Smells:** ${codeSmellCount} detected\n\n`;
        }

        if (designPatterns.patterns.length > 0) {
            summary += `**Design Patterns:** ${designPatterns.patterns.length} good patterns identified\n`;
        }

        if (designPatterns.antiPatterns.length > 0) {
            summary += `**Anti-patterns:** ${designPatterns.antiPatterns.length} problematic patterns found\n`;
        }

        summary += `\n**Key Areas:**\n`;
        summary += `- Naming: ${score.breakdown.naming}/100\n`;
        summary += `- Structure: ${score.breakdown.structure}/100\n`;
        summary += `- Complexity: ${score.breakdown.complexity}/100\n`;
        summary += `- Maintainability: ${score.breakdown.maintainability}/100\n`;
        summary += `- Performance: ${score.breakdown.performance}/100\n`;
        summary += `- Accessibility: ${score.breakdown.accessibility}/100\n`;

        return summary;
    }
}

// Export the enhanced analyzer
export const enhancedSemanticAnalyzer = new EnhancedSemanticAnalyzer();

// Export types for external use
export type {
    SemanticContext,
    SemanticRule,
    ComponentStructure,
    SemanticPattern
};