import { RuleDefinition, RuleConfig, AnalyzerConfig, RuleCategory } from '../types';

/**
 * Central registry of every rule the analyzer can check.
 * Each entry maps directly to an issue `rule` field in the analyzers.
 */
export const RULE_REGISTRY: RuleDefinition[] = [
    // ── Syntax Rules ─────────────────────────────────────────────────────────
    {
        id: 'syntax/bracket-matching',
        name: 'Bracket Matching',
        category: 'Syntax',
        description: 'Detects unmatched, mismatched, or unclosed brackets, braces, and parentheses.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/missing-arrow-function-brace',
        name: 'Arrow Function Brace',
        category: 'Syntax',
        description: 'Arrow function with multiple statements missing opening brace.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/unclosed-string',
        name: 'Unclosed String',
        category: 'Syntax',
        description: 'Detects strings that are missing their closing quote.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/missing-object-colon',
        name: 'Object Property Colon',
        category: 'Syntax',
        description: 'Object property missing colon between key and value.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/variable-naming',
        name: 'Variable Name Validity',
        category: 'Syntax',
        description: 'Variable names cannot start with a number.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/assignment',
        name: 'Incomplete Assignment',
        category: 'Syntax',
        description: 'Assignment statement is missing a value on the right-hand side.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/function-call',
        name: 'Unclosed Function Call',
        category: 'Syntax',
        description: 'Function call is missing its closing parenthesis.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/object-literal',
        name: 'Malformed Object Literal',
        category: 'Syntax',
        description: 'Object literal syntax is incorrect.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/array-literal',
        name: 'Invalid Array Syntax',
        category: 'Syntax',
        description: 'Array elements should be separated by commas.',
        defaultSeverity: 'error',
        source: 'syntax',
    },

    // ── JSX Rules ────────────────────────────────────────────────────────────
    {
        id: 'jsx/unclosed-element',
        name: 'Unclosed JSX Element',
        category: 'JSX',
        description: 'JSX element is missing its closing tag or self-closing slash.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'jsx/attribute-syntax',
        name: 'JSX Attribute Syntax',
        category: 'JSX',
        description: 'JSX attributes must use attribute="value" or attribute={value} format.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'jsx/quotes',
        name: 'JSX Unescaped Quotes',
        category: 'JSX',
        description: 'Potentially unescaped quotes inside a JSX attribute value.',
        defaultSeverity: 'warning',
        source: 'syntax',
    },

    // ── Operator Rules ───────────────────────────────────────────────────────
    {
        id: 'syntax/operators',
        name: 'Invalid Operators',
        category: 'Operators',
        description: 'Detects invalid or misused operator combinations.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/missing-operator',
        name: 'Missing Operator',
        category: 'Operators',
        description: 'Two operands appear next to each other without an operator.',
        defaultSeverity: 'error',
        source: 'syntax',
    },

    // ── Symbol Rules ─────────────────────────────────────────────────────────
    {
        id: 'syntax/symbols',
        name: 'Invalid Symbol Usage',
        category: 'Symbols',
        description: 'Detects invalid uses of symbols like $$, #, @, or unclosed template literals.',
        defaultSeverity: 'error',
        source: 'syntax',
    },
    {
        id: 'syntax/semicolon',
        name: 'Double Semicolon',
        category: 'Symbols',
        description: 'Redundant double semicolons detected.',
        defaultSeverity: 'warning',
        source: 'syntax',
    },

    // ── React Hooks Rules ────────────────────────────────────────────────────
    {
        id: 'react-hooks/exhaustive-deps',
        name: 'Hook Dependencies',
        category: 'React Hooks',
        description: 'useEffect may have missing dependencies in its dependency array.',
        defaultSeverity: 'error',
        source: 'react',
    },

    // ── React Rules ──────────────────────────────────────────────────────────
    {
        id: 'react/prop-types',
        name: 'Prop Types Validation',
        category: 'Type Safety',
        description: 'Component props are missing PropTypes or TypeScript interface definitions.',
        defaultSeverity: 'warning',
        source: 'react',
    },
    {
        id: 'react/jsx-key',
        name: 'Missing Key Prop',
        category: 'React',
        description: 'Elements in a .map() call should have a unique key prop.',
        defaultSeverity: 'error',
        source: 'react',
    },
    {
        id: 'react/jsx-no-bind',
        name: 'Inline Creation in Render',
        category: 'Performance',
        description: 'Inline object or function creation in render causes unnecessary re-renders.',
        defaultSeverity: 'warning',
        source: 'react',
    },

    // ── TypeScript Rules ─────────────────────────────────────────────────────
    {
        id: '@typescript-eslint/no-explicit-any',
        name: 'No Explicit Any',
        category: 'TypeScript',
        description: 'Avoid using the "any" type — define proper types instead.',
        defaultSeverity: 'warning',
        source: 'react',
    },

    // ── Code Quality Rules ───────────────────────────────────────────────────
    {
        id: 'no-console',
        name: 'No Console Statements',
        category: 'Code Quality',
        description: 'console.log statements should be removed before production.',
        defaultSeverity: 'info',
        source: 'react',
    },
    {
        id: 'no-unused-vars',
        name: 'No Unused Imports',
        category: 'Code Quality',
        description: 'Imported symbols that are never used in the file.',
        defaultSeverity: 'warning',
        source: 'react',
    },
    {
        id: 'no-empty',
        name: 'No Empty Blocks',
        category: 'Code Quality',
        description: 'Empty code blocks should be removed or given an implementation.',
        defaultSeverity: 'info',
        source: 'react',
    },

    // ── Accessibility Rules ──────────────────────────────────────────────────
    {
        id: 'jsx-a11y/alt-text',
        name: 'Image Alt Text',
        category: 'Accessibility',
        description: 'Images must have a descriptive alt attribute.',
        defaultSeverity: 'error',
        source: 'react',
    },
    {
        id: 'jsx-a11y/button-has-type',
        name: 'Button Accessibility',
        category: 'Accessibility',
        description: 'Buttons should have aria-label or explicit type attributes.',
        defaultSeverity: 'warning',
        source: 'react',
    },

    // ── Best Practices Rules ─────────────────────────────────────────────────
    {
        id: 'prefer-template',
        name: 'Prefer Template Literals',
        category: 'Best Practices',
        description: 'Use template literals instead of string concatenation.',
        defaultSeverity: 'warning',
        source: 'react',
    },
];

// ─── Helper functions ────────────────────────────────────────────────────────

/** All unique categories, in display order */
export function getRuleCategories(): RuleCategory[] {
    const seen = new Set<RuleCategory>();
    const ordered: RuleCategory[] = [];
    for (const rule of RULE_REGISTRY) {
        if (!seen.has(rule.category)) {
            seen.add(rule.category);
            ordered.push(rule.category);
        }
    }
    return ordered;
}

/** Rules grouped by category */
export function getRulesByCategory(): Map<RuleCategory, RuleDefinition[]> {
    const map = new Map<RuleCategory, RuleDefinition[]>();
    for (const rule of RULE_REGISTRY) {
        const list = map.get(rule.category) || [];
        list.push(rule);
        map.set(rule.category, list);
    }
    return map;
}

/** Build a default AnalyzerConfig with every rule enabled at its default severity */
export function createDefaultConfig(): AnalyzerConfig {
    const rules: Record<string, RuleConfig> = {};
    for (const rule of RULE_REGISTRY) {
        rules[rule.id] = {
            enabled: true,
            severity: rule.defaultSeverity,
        };
    }
    return { rules };
}

/** Look up a rule definition by its id */
export function getRuleById(id: string): RuleDefinition | undefined {
    return RULE_REGISTRY.find((r) => r.id === id);
}

/** Count how many rules are enabled in a config */
export function countEnabledRules(config: AnalyzerConfig): number {
    return Object.values(config.rules).filter((r) => r.enabled).length;
}

/** Count total rules */
export function countTotalRules(): number {
    return RULE_REGISTRY.length;
}

/**
 * Check whether a specific rule is enabled in the config.
 * Rules not present in the config are treated as enabled with their default severity.
 */
export function isRuleEnabled(config: AnalyzerConfig, ruleId: string): boolean {
    // Rules can share a prefix (e.g. "syntax/operators" matches issues whose
    // rule field is "syntax/operators"). We do an exact match first, then a
    // prefix match so that grouped rules like syntax/bracket-matching work
    // when the issue's rule field exactly matches or starts with the id.
    const exact = config.rules[ruleId];
    if (exact !== undefined) return exact.enabled;

    // Fallback: not in config → enabled
    return true;
}

/**
 * Get the configured severity for a rule, falling back to its default.
 */
export function getRuleSeverity(
    config: AnalyzerConfig,
    ruleId: string
): 'error' | 'warning' | 'info' {
    const entry = config.rules[ruleId];
    if (entry) return entry.severity;

    const def = getRuleById(ruleId);
    return def?.defaultSeverity ?? 'info';
}