import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AnalyzedFile, CodeMetrics } from '../types';

interface FileComparisonViewProps {
  analyzedFiles: AnalyzedFile[];
  onClose: () => void;
}

interface ComparisonResult {
  metric: string;
  fileA: number;
  fileB: number;
  difference: number;
  winner: 'A' | 'B' | 'tie';
}

const FileComparisonView: React.FC<FileComparisonViewProps> = ({
  analyzedFiles,
  onClose,
}) => {
  const [selectedFileA, setSelectedFileA] = useState<number | null>(
    analyzedFiles.length > 0 ? 0 : null,
  );
  const [selectedFileB, setSelectedFileB] = useState<number | null>(
    analyzedFiles.length > 1 ? 1 : null,
  );
  const [viewMode, setViewMode] = useState<'metrics' | 'issues' | 'details'>(
    'metrics',
  );

  const fileA = selectedFileA !== null ? analyzedFiles[selectedFileA] : null;
  const fileB = selectedFileB !== null ? analyzedFiles[selectedFileB] : null;

  // Calculate metric comparisons
  const metricComparisons = useMemo((): ComparisonResult[] => {
    if (!fileA || !fileB) return [];

    const metrics: (keyof CodeMetrics)[] = [
      'complexity',
      'maintainability',
      'testability',
      'performance',
    ];

    return metrics.map((metric) => {
      const valueA = fileA.result.metrics[metric];
      const valueB = fileB.result.metrics[metric];
      const difference = valueA - valueB;

      let winner: 'A' | 'B' | 'tie' = 'tie';
      if (difference > 0) winner = 'A';
      else if (difference < 0) winner = 'B';

      return {
        metric: metric.charAt(0).toUpperCase() + metric.slice(1),
        fileA: valueA,
        fileB: valueB,
        difference,
        winner,
      };
    });
  }, [fileA, fileB]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!fileA || !fileB) return [];

    return [
      {
        metric: 'Complexity',
        fileA: fileA.result.metrics.complexity,
        fileB: fileB.result.metrics.complexity,
      },
      {
        metric: 'Maintainability',
        fileA: fileA.result.metrics.maintainability,
        fileB: fileB.result.metrics.maintainability,
      },
      {
        metric: 'Testability',
        fileA: fileA.result.metrics.testability,
        fileB: fileB.result.metrics.testability,
      },
      {
        metric: 'Performance',
        fileA: fileA.result.metrics.performance,
        fileB: fileB.result.metrics.performance,
      },
    ];
  }, [fileA, fileB]);

  // Issue comparison data
  const issueComparison = useMemo(() => {
    if (!fileA || !fileB) return [];

    return [
      {
        type: 'Errors',
        fileA: fileA.result.summary.errors,
        fileB: fileB.result.summary.errors,
        color: '#dc2626',
      },
      {
        type: 'Warnings',
        fileA: fileA.result.summary.warnings,
        fileB: fileB.result.summary.warnings,
        color: '#d97706',
      },
      {
        type: 'Info',
        fileA: fileA.result.summary.info,
        fileB: fileB.result.summary.info,
        color: '#2563eb',
      },
    ];
  }, [fileA, fileB]);

  // Calculate overall score
  const calculateScore = (metrics: CodeMetrics): number => {
    return Math.round(
      ((metrics.complexity +
        metrics.maintainability +
        metrics.testability +
        metrics.performance) /
        4) *
        10,
    );
  };

  const scoreA = fileA ? calculateScore(fileA.result.metrics) : 0;
  const scoreB = fileB ? calculateScore(fileB.result.metrics) : 0;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (winner: 'A' | 'B' | 'tie', isFileA: boolean) => {
    if (winner === 'tie') return <Minus className="w-4 h-4 text-slate-400" />;
    if ((winner === 'A' && isFileA) || (winner === 'B' && !isFileA)) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'Errors':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Warnings':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (analyzedFiles.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="max-w-md p-8 text-center bg-white rounded-xl">
          <GitCompare className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="mb-2 text-xl font-semibold text-slate-800">
            Need More Files
          </h3>
          <p className="mb-6 text-slate-600">
            Please analyze at least 2 files to use the comparison feature.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <GitCompare className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800">
              File Comparison View
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* File Selectors */}
        <div className="grid grid-cols-2 gap-6 p-6 border-b bg-slate-50 border-slate-200">
          <FileSelector
            label="File A"
            files={analyzedFiles}
            selectedIndex={selectedFileA}
            onSelect={setSelectedFileA}
            excludeIndex={selectedFileB}
            color="blue"
          />
          <FileSelector
            label="File B"
            files={analyzedFiles}
            selectedIndex={selectedFileB}
            onSelect={setSelectedFileB}
            excludeIndex={selectedFileA}
            color="purple"
          />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 px-6 pt-4">
          {(['metrics', 'issues', 'details'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {fileA && fileB ? (
            <>
              {viewMode === 'metrics' && (
                <MetricsComparison
                  fileA={fileA}
                  fileB={fileB}
                  metricComparisons={metricComparisons}
                  radarData={radarData}
                  scoreA={scoreA}
                  scoreB={scoreB}
                  getScoreColor={getScoreColor}
                  getScoreBg={getScoreBg}
                  getTrendIcon={getTrendIcon}
                />
              )}
              {viewMode === 'issues' && (
                <IssuesComparison
                  fileA={fileA}
                  fileB={fileB}
                  issueComparison={issueComparison}
                  getIssueIcon={getIssueIcon}
                />
              )}
              {viewMode === 'details' && (
                <DetailsComparison fileA={fileA} fileB={fileB} />
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Select two files to compare
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// File Selector Component
interface FileSelectorProps {
  label: string;
  files: AnalyzedFile[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  excludeIndex: number | null;
  color: 'blue' | 'purple';
}

const FileSelector: React.FC<FileSelectorProps> = ({
  label,
  files,
  selectedIndex,
  onSelect,
  excludeIndex,
  color,
}) => {
  const colorClasses = {
    blue: 'border-blue-300 bg-blue-50 focus:ring-blue-500',
    purple: 'border-purple-300 bg-purple-50 focus:ring-purple-500',
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedIndex ?? ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          className={`w-full p-3 border-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 ${colorClasses[color]}`}
        >
          {files.map((file, index) => (
            <option key={index} value={index} disabled={index === excludeIndex}>
              {file.name} ({file.result.summary.total} issues)
            </option>
          ))}
        </select>
        <ChevronDown className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none right-3 top-1/2 text-slate-400" />
      </div>
    </div>
  );
};

// Metrics Comparison Component
interface MetricsComparisonProps {
  fileA: AnalyzedFile;
  fileB: AnalyzedFile;
  metricComparisons: ComparisonResult[];
  radarData: any[];
  scoreA: number;
  scoreB: number;
  getScoreColor: (score: number) => string;
  getScoreBg: (score: number) => string;
  getTrendIcon: (
    winner: 'A' | 'B' | 'tie',
    isFileA: boolean,
  ) => React.ReactNode;
}

const MetricsComparison: React.FC<MetricsComparisonProps> = ({
  fileA,
  fileB,
  metricComparisons,
  radarData,
  scoreA,
  scoreB,
  getScoreColor,
  getScoreBg,
  getTrendIcon,
}) => {
  return (
    <div className="space-y-6">
      {/* Overall Scores */}
      <div className="grid grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border-2 ${getScoreBg(scoreA)}`}>
          <div className="mb-1 text-sm text-slate-600">File A Score</div>
          <div className={`text-4xl font-bold ${getScoreColor(scoreA)}`}>
            {scoreA}%
          </div>
          <div className="mt-1 text-sm text-slate-500">{fileA.name}</div>
        </div>
        <div className={`p-6 rounded-xl border-2 ${getScoreBg(scoreB)}`}>
          <div className="mb-1 text-sm text-slate-600">File B Score</div>
          <div className={`text-4xl font-bold ${getScoreColor(scoreB)}`}>
            {scoreB}%
          </div>
          <div className="mt-1 text-sm text-slate-500">{fileB.name}</div>
        </div>
      </div>

      {/* Winner Banner */}
      {scoreA !== scoreB && (
        <div
          className={`p-4 rounded-lg text-center ${
            scoreA > scoreB
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : 'bg-purple-50 border border-purple-200 text-purple-800'
          }`}
        >
          <span className="font-semibold">
            {scoreA > scoreB ? '🏆 File A' : '🏆 File B'}
          </span>{' '}
          has better overall code quality by{' '}
          <span className="font-bold">{Math.abs(scoreA - scoreB)}%</span>
        </div>
      )}

      {/* Radar Chart */}
      <div className="p-6 bg-slate-50 rounded-xl">
        <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-800">
          <BarChart3 className="w-5 h-5" />
          Quality Metrics Comparison
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <Radar
                name={fileA.name}
                dataKey="fileA"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name={fileB.name}
                dataKey="fileB"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metric-by-Metric Comparison */}
      <div className="overflow-hidden bg-white border border-slate-200 rounded-xl">
        <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium border-b bg-slate-50 border-slate-200 text-slate-600">
          <div>Metric</div>
          <div className="text-center">File A</div>
          <div className="text-center">File B</div>
          <div className="text-center">Difference</div>
        </div>
        {metricComparisons.map((comparison, index) => (
          <div
            key={comparison.metric}
            className={`grid grid-cols-4 gap-4 p-4 items-center ${
              index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
            }`}
          >
            <div className="font-medium text-slate-800">
              {comparison.metric}
            </div>
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-lg font-semibold text-blue-600">
                {comparison.fileA}/10
              </span>
              {getTrendIcon(comparison.winner, true)}
            </div>
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-lg font-semibold text-purple-600">
                {comparison.fileB}/10
              </span>
              {getTrendIcon(comparison.winner, false)}
            </div>
            <div className="text-center">
              <span
                className={`font-medium ${
                  comparison.difference > 0
                    ? 'text-green-600'
                    : comparison.difference < 0
                      ? 'text-red-600'
                      : 'text-slate-400'
                }`}
              >
                {comparison.difference > 0 ? '+' : ''}
                {comparison.difference}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Issues Comparison Component
interface IssuesComparisonProps {
  fileA: AnalyzedFile;
  fileB: AnalyzedFile;
  issueComparison: {
    type: string;
    fileA: number;
    fileB: number;
    color: string;
  }[];
  getIssueIcon: (type: string) => React.ReactNode;
}

const IssuesComparison: React.FC<IssuesComparisonProps> = ({
  fileA,
  fileB,
  issueComparison,
  getIssueIcon,
}) => {
  // Get unique categories from both files
  const categoriesA = new Map<string, number>();
  const categoriesB = new Map<string, number>();

  fileA.result.issues.forEach((issue) => {
    categoriesA.set(issue.category, (categoriesA.get(issue.category) || 0) + 1);
  });

  fileB.result.issues.forEach((issue) => {
    categoriesB.set(issue.category, (categoriesB.get(issue.category) || 0) + 1);
  });

  const allCategories = Array.from(
    new Set([
      ...Array.from(categoriesA.keys()),
      ...Array.from(categoriesB.keys()),
    ]),
  ).sort();

  const categoryData = allCategories.map((category) => ({
    category,
    fileA: categoriesA.get(category) || 0,
    fileB: categoriesB.get(category) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Issue Count Summary */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 border bg-slate-50 rounded-xl border-slate-200">
          <div className="mb-2 text-sm text-slate-600">File A Total Issues</div>
          <div className="text-3xl font-bold text-slate-800">
            {fileA.result.summary.total}
          </div>
          <div className="mt-1 text-sm text-slate-500">{fileA.name}</div>
        </div>
        <div className="p-6 border bg-slate-50 rounded-xl border-slate-200">
          <div className="mb-2 text-sm text-slate-600">File B Total Issues</div>
          <div className="text-3xl font-bold text-slate-800">
            {fileB.result.summary.total}
          </div>
          <div className="mt-1 text-sm text-slate-500">{fileB.name}</div>
        </div>
      </div>

      {/* Issue Type Comparison */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Issues by Severity
        </h3>
        <div className="space-y-4">
          {issueComparison.map((item) => (
            <div key={item.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIssueIcon(item.type)}
                  <span className="font-medium text-slate-700">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-blue-600">
                    A: {item.fileA}
                  </span>
                  <span className="font-medium text-purple-600">
                    B: {item.fileB}
                  </span>
                </div>
              </div>
              <div className="flex h-6 gap-1">
                <div
                  className="bg-blue-500 rounded-l"
                  style={{
                    width: `${Math.max(1, (item.fileA / Math.max(item.fileA + item.fileB, 1)) * 100)}%`,
                  }}
                />
                <div
                  className="bg-purple-500 rounded-r"
                  style={{
                    width: `${Math.max(1, (item.fileB / Math.max(item.fileA + item.fileB, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Comparison Chart */}
      {categoryData.length > 0 && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Issues by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="#64748b"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="fileA"
                  fill="#3b82f6"
                  name={fileA.name}
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="fileB"
                  fill="#8b5cf6"
                  name={fileB.name}
                  radius={[0, 4, 4, 0]}
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// Details Comparison Component
interface DetailsComparisonProps {
  fileA: AnalyzedFile;
  fileB: AnalyzedFile;
}

const DetailsComparison: React.FC<DetailsComparisonProps> = ({
  fileA,
  fileB,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* File A Issues */}
      <div className="space-y-4">
        <h3 className="sticky top-0 py-2 text-lg font-semibold text-blue-600 bg-white">
          {fileA.name} ({fileA.result.issues.length} issues)
        </h3>
        <div className="pr-2 space-y-3 overflow-y-auto max-h-96">
          {fileA.result.issues.length > 0 ? (
            fileA.result.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          ) : (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              No issues found
            </div>
          )}
        </div>
      </div>

      {/* File B Issues */}
      <div className="space-y-4">
        <h3 className="sticky top-0 py-2 text-lg font-semibold text-purple-600 bg-white">
          {fileB.name} ({fileB.result.issues.length} issues)
        </h3>
        <div className="pr-2 space-y-3 overflow-y-auto max-h-96">
          {fileB.result.issues.length > 0 ? (
            fileB.result.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          ) : (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              No issues found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Issue Card Component
interface IssueCardProps {
  issue: {
    id: string;
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    line: number;
    rule: string;
  };
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const getBorderColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-slate-500';
    }
  };

  return (
    <div
      className={`p-3 bg-slate-50 rounded-lg border-l-4 ${getBorderColor(issue.type)}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 rounded">
          {issue.category}
        </span>
        <span className="text-xs text-slate-500">Line {issue.line}</span>
      </div>
      <p className="text-sm text-slate-700">{issue.message}</p>
    </div>
  );
};

export default FileComparisonView;
