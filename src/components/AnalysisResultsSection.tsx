import React, { useState, useMemo } from 'react';
import {
    File,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    Code,
    Filter
} from 'lucide-react';
import { AnalysisResult, CodeIssue, IssueFilters } from '../types';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import IssueFilterPanel from './IssueFilterPanel';
import { IssueFilterManager } from '../utils/filterUtils';

interface AnalysisResultsSectionProps {
    currentResult: AnalysisResult | null;
    currentFileName: string | null;
}

const AnalysisResultsSection: React.FC<AnalysisResultsSectionProps> = ({
    currentResult,
    currentFileName
}) => {
    // Filter state
    const [filters, setFilters] = useState<IssueFilters>(
        IssueFilterManager.createDefaultFilters()
    );

    // Filtered issues
    const filteredIssues = useMemo(() => {
        if (!currentResult) return [];
        return IssueFilterManager.filterIssues(currentResult.issues, filters);
    }, [currentResult, filters]);

    // Filter statistics
    const stats = useMemo(() => {
        if (!currentResult) {
            return {
                totalIssues: 0,
                filteredIssues: 0,
                bySeverity: { error: 0, warning: 0, info: 0 },
                byCategory: new Map()
            };
        }
        return IssueFilterManager.getFilterStats(currentResult.issues, filteredIssues);
    }, [currentResult, filteredIssues]);

    const getIssueIcon = (type: string) => {
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
    };

    const getMetricColor = (score: number): React.CSSProperties => {
        if (score >= 8) return { color: "#16a34a" };
        if (score >= 6) return { color: "#d97706" };
        return { color: "#dc2626" };
    };

    const getMetricBg = (score: number): React.CSSProperties => {
        if (score >= 8)
            return { backgroundColor: "#dcfce7", border: "1px solid #bbf7d0" };
        if (score >= 6)
            return { backgroundColor: "#fef3c7", border: "1px solid #fde68a" };
        return { backgroundColor: "#fee2e2", border: "1px solid #fecaca" };
    };

    const getProgressBarColor = (score: number): string => {
        if (score >= 8) return "#10b981";
        if (score >= 6) return "#f59e0b";
        return "#ef4444";
    };

    if (!currentResult || !currentFileName) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center py-15">
                <Code className="w-20 h-20 mx-auto mb-5 text-slate-400" />
                <p className="text-xl font-semibold mb-2 text-slate-800">
                    Ready to analyze your React code?
                </p>
                <p className="text-slate-600">
                    Upload files or paste your component code to get started
                </p>
            </div>
        );
    }

    return (
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
                    {Object.entries(currentResult.metrics).map(([key, value]) => (
                        <div
                            key={key}
                            className="p-4 rounded-lg"
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
                    ))}
                </div>
            </div>

            {/* Issues Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-5">
                    Issues Summary
                </h3>

                {/* Number Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
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

                {/* Chart */}
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'Errors', value: currentResult.summary.errors, color: '#dc2626' },
                                { name: 'Warnings', value: currentResult.summary.warnings, color: '#d97706' },
                                { name: 'Info', value: currentResult.summary.info, color: '#2563eb' }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {[
                                    { name: 'Errors', value: currentResult.summary.errors, color: '#dc2626' },
                                    { name: 'Warnings', value: currentResult.summary.warnings, color: '#d97706' },
                                    { name: 'Info', value: currentResult.summary.info, color: '#2563eb' }
                                ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filter Panel */}
            {currentResult.issues.length > 0 && (
                <IssueFilterPanel
                    issues={currentResult.issues}
                    filters={filters}
                    onFiltersChange={setFilters}
                    stats={stats}
                />
            )}

            {/* Detailed Issues */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-5">
                    Detailed Issues
                    {filteredIssues.length !== currentResult.issues.length && (
                        <span className="ml-2 text-sm font-normal text-slate-500">
                            (showing {filteredIssues.length} of {currentResult.issues.length})
                        </span>
                    )}
                </h3>

                <div className="max-h-96 overflow-y-auto p-1">
                    {filteredIssues.length > 0 ? (
                        filteredIssues.map((issue: CodeIssue) => (
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
                                                    <strong>Suggestion:</strong> {issue.suggestion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-15">
                            {currentResult.issues.length === 0 ? (
                                <>
                                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                                    <p className="text-xl font-semibold mb-2 text-slate-800">
                                        Excellent! No issues found.
                                    </p>
                                    <p className="text-slate-600">
                                        Your code follows React best practices!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Filter className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                    <p className="text-xl font-semibold mb-2 text-slate-800">
                                        No issues match your filters
                                    </p>
                                    <p className="text-slate-600">
                                        Try adjusting your filter settings
                                    </p>
                                    <button
                                        onClick={() => setFilters(IssueFilterManager.createDefaultFilters())}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AnalysisResultsSection;