import React, { useState, useMemo, useCallback } from 'react';
import {
    X,
    Settings,
    Search,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
    Shield,
    AlertCircle,
    AlertTriangle,
    Info,
    CheckCircle2,
    Power,
    PowerOff,
} from 'lucide-react';
import { AnalyzerConfig, RuleConfig, RuleCategory, RuleDefinition } from '../types';
import {
    RULE_REGISTRY,
    getRulesByCategory,
    getRuleCategories,
    createDefaultConfig,
    countEnabledRules,
    countTotalRules,
} from '../utils/ruleRegistry';

interface ConfigurationPanelProps {
    config: AnalyzerConfig;
    onConfigChange: (config: AnalyzerConfig) => void;
    onClose: () => void;
}

// ─── Severity badge colors ───────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const SEVERITY_OPTIONS: Array<'error' | 'warning' | 'info'> = ['error', 'warning', 'info'];

// ─── Sub-components ──────────────────────────────────────────────────────────

const SeverityIcon: React.FC<{ severity: string; className?: string }> = ({ severity, className = 'w-3.5 h-3.5' }) => {
    switch (severity) {
        case 'error':
            return <AlertCircle className={`${className} text-red-500`} />;
        case 'warning':
            return <AlertTriangle className={`${className} text-yellow-500`} />;
        case 'info':
            return <Info className={`${className} text-blue-500`} />;
        default:
            return null;
    }
};

const SeverityDropdown: React.FC<{
    value: 'error' | 'warning' | 'info';
    onChange: (val: 'error' | 'warning' | 'info') => void;
    disabled: boolean;
}> = ({ value, onChange, disabled }) => {
    const style = SEVERITY_STYLES[value];
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as 'error' | 'warning' | 'info')}
            disabled={disabled}
            className={`text-xs font-medium pl-2 pr-6 py-1 rounded-md border appearance-none cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors
                ${disabled ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' : `${style.bg} ${style.text} ${style.border}`}`}
        >
            {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
            ))}
        </select>
    );
};

const RuleRow: React.FC<{
    rule: RuleDefinition;
    ruleConfig: RuleConfig;
    onToggle: () => void;
    onSeverityChange: (severity: 'error' | 'warning' | 'info') => void;
}> = ({ rule, ruleConfig, onToggle, onSeverityChange }) => (
    <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
            ruleConfig.enabled
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-slate-50 border-slate-100 opacity-60'
        }`}
    >
        {/* Toggle */}
        <button
            onClick={onToggle}
            className="flex-shrink-0 focus:outline-none"
            aria-label={`${ruleConfig.enabled ? 'Disable' : 'Enable'} rule ${rule.name}`}
        >
            {ruleConfig.enabled ? (
                <ToggleRight className="w-6 h-6 text-blue-500" />
            ) : (
                <ToggleLeft className="w-6 h-6 text-slate-300" />
            )}
        </button>

        {/* Rule info */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-slate-800 truncate">{rule.name}</span>
                <code className="hidden sm:inline text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                    {rule.id}
                </code>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-1">{rule.description}</p>
        </div>

        {/* Severity selector */}
        <div className="flex-shrink-0">
            <SeverityDropdown
                value={ruleConfig.severity}
                onChange={onSeverityChange}
                disabled={!ruleConfig.enabled}
            />
        </div>
    </div>
);

// ─── Category section ────────────────────────────────────────────────────────

const CategorySection: React.FC<{
    category: RuleCategory;
    rules: RuleDefinition[];
    config: AnalyzerConfig;
    onToggleRule: (ruleId: string) => void;
    onSetSeverity: (ruleId: string, severity: 'error' | 'warning' | 'info') => void;
    onEnableAll: () => void;
    onDisableAll: () => void;
}> = ({ category, rules, config, onToggleRule, onSetSeverity, onEnableAll, onDisableAll }) => {
    const [expanded, setExpanded] = useState(true);
    const enabledCount = rules.filter((r) => config.rules[r.id]?.enabled).length;

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Category header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {expanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="font-semibold text-sm text-slate-800">{category}</span>
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {enabledCount}/{rules.length}
                    </span>
                </div>

                {/* Bulk actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onEnableAll}
                        className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                        title="Enable all in this category"
                    >
                        <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onDisableAll}
                        className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                        title="Disable all in this category"
                    >
                        <PowerOff className="w-3.5 h-3.5" />
                    </button>
                </div>
            </button>

            {/* Rule list */}
            {expanded && (
                <div className="p-3 space-y-2">
                    {rules.map((rule) => (
                        <RuleRow
                            key={rule.id}
                            rule={rule}
                            ruleConfig={config.rules[rule.id] ?? { enabled: true, severity: rule.defaultSeverity }}
                            onToggle={() => onToggleRule(rule.id)}
                            onSeverityChange={(sev) => onSetSeverity(rule.id, sev)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main component ──────────────────────────────────────────────────────────

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
    config,
    onConfigChange,
    onClose,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const rulesByCategory = useMemo(() => getRulesByCategory(), []);
    const categories = useMemo(() => getRuleCategories(), []);
    const enabledCount = useMemo(() => countEnabledRules(config), [config]);
    const totalCount = useMemo(() => countTotalRules(), []);

    // Filter rules by search
    const filteredByCategory = useMemo(() => {
        if (!searchTerm.trim()) return rulesByCategory;

        const term = searchTerm.toLowerCase();
        const filtered = new Map<RuleCategory, RuleDefinition[]>();

        Array.from(rulesByCategory.entries()).forEach(([cat, rules]) => {
            const matched = rules.filter(
                (r) =>
                    r.name.toLowerCase().includes(term) ||
                    r.id.toLowerCase().includes(term) ||
                    r.description.toLowerCase().includes(term) ||
                    r.category.toLowerCase().includes(term)
            );
            if (matched.length > 0) {
                filtered.set(cat, matched);
            }
        });
        return filtered;
    }, [rulesByCategory, searchTerm]);

    // ── Handlers ──

    const updateRule = useCallback(
        (ruleId: string, patch: Partial<RuleConfig>) => {
            const existing = config.rules[ruleId] ?? {
                enabled: true,
                severity: RULE_REGISTRY.find((r) => r.id === ruleId)?.defaultSeverity ?? 'info',
            };
            onConfigChange({
                ...config,
                rules: {
                    ...config.rules,
                    [ruleId]: { ...existing, ...patch },
                },
            });
        },
        [config, onConfigChange]
    );

    const toggleRule = useCallback(
        (ruleId: string) => {
            const current = config.rules[ruleId]?.enabled ?? true;
            updateRule(ruleId, { enabled: !current });
        },
        [config, updateRule]
    );

    const setSeverity = useCallback(
        (ruleId: string, severity: 'error' | 'warning' | 'info') => {
            updateRule(ruleId, { severity });
        },
        [updateRule]
    );

    const enableAllInCategory = useCallback(
        (category: RuleCategory) => {
            const rules = rulesByCategory.get(category) || [];
            const newRules = { ...config.rules };
            for (const rule of rules) {
                newRules[rule.id] = { ...(newRules[rule.id] ?? { severity: rule.defaultSeverity }), enabled: true };
            }
            onConfigChange({ ...config, rules: newRules });
        },
        [config, onConfigChange, rulesByCategory]
    );

    const disableAllInCategory = useCallback(
        (category: RuleCategory) => {
            const rules = rulesByCategory.get(category) || [];
            const newRules = { ...config.rules };
            for (const rule of rules) {
                newRules[rule.id] = { ...(newRules[rule.id] ?? { severity: rule.defaultSeverity }), enabled: false };
            }
            onConfigChange({ ...config, rules: newRules });
        },
        [config, onConfigChange, rulesByCategory]
    );

    const enableAll = useCallback(() => {
        const newRules = { ...config.rules };
        for (const rule of RULE_REGISTRY) {
            newRules[rule.id] = { ...(newRules[rule.id] ?? { severity: rule.defaultSeverity }), enabled: true };
        }
        onConfigChange({ ...config, rules: newRules });
    }, [config, onConfigChange]);

    const disableAll = useCallback(() => {
        const newRules = { ...config.rules };
        for (const rule of RULE_REGISTRY) {
            newRules[rule.id] = { ...(newRules[rule.id] ?? { severity: rule.defaultSeverity }), enabled: false };
        }
        onConfigChange({ ...config, rules: newRules });
    }, [config, onConfigChange]);

    const resetToDefaults = useCallback(() => {
        onConfigChange(createDefaultConfig());
    }, [onConfigChange]);

    // ── Render ──

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Rule Configuration</h2>
                            <p className="text-xs text-slate-500">
                                {enabledCount} of {totalCount} rules enabled
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Close configuration"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* ── Toolbar ── */}
                <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search rules..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Bulk actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={enableAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                text-green-700 bg-green-50 border border-green-200 rounded-lg
                                hover:bg-green-100 transition-colors"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enable All
                        </button>
                        <button
                            onClick={disableAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                text-red-700 bg-red-50 border border-red-200 rounded-lg
                                hover:bg-red-100 transition-colors"
                        >
                            <PowerOff className="w-3.5 h-3.5" />
                            Disable All
                        </button>
                        <button
                            onClick={resetToDefaults}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                text-slate-700 bg-slate-50 border border-slate-200 rounded-lg
                                hover:bg-slate-100 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset Defaults
                        </button>
                    </div>
                </div>

                {/* ── Severity legend ── */}
                <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Severity levels:</span>
                    {SEVERITY_OPTIONS.map((sev) => (
                        <span key={sev} className="flex items-center gap-1">
                            <SeverityIcon severity={sev} className="w-3 h-3" />
                            {sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </span>
                    ))}
                </div>

                {/* ── Rule list ── */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {Array.from(filteredByCategory.entries()).length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm text-slate-500">No rules match "{searchTerm}"</p>
                        </div>
                    ) : (
                        Array.from(filteredByCategory.entries()).map(([category, rules]) => (
                            <CategorySection
                                key={category}
                                category={category}
                                rules={rules}
                                config={config}
                                onToggleRule={toggleRule}
                                onSetSeverity={setSeverity}
                                onEnableAll={() => enableAllInCategory(category)}
                                onDisableAll={() => disableAllInCategory(category)}
                            />
                        ))
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-2xl">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Changes apply immediately and re-analyze open files.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg
                            hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationPanel;