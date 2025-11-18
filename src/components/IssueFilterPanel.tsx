import React, { useMemo } from 'react';
import { Search, Filter, X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { CodeIssue, IssueFilters, FilterStats } from '../types';
import { IssueFilterManager } from '../utils/filterUtils';

interface IssueFilterPanelProps {
    issues: CodeIssue[];
    filters: IssueFilters;
    onFiltersChange: (filters: IssueFilters) => void;
    stats: FilterStats;
}

const IssueFilterPanel: React.FC<IssueFilterPanelProps> = ({
    issues,
    filters,
    onFiltersChange,
    stats
}) => {
    const categories = useMemo(() => 
        IssueFilterManager.getUniqueCategories(issues), 
        [issues]
    );

    const handleSeverityToggle = (severity: 'error' | 'warning' | 'info') => {
        const newSeverity = new Set(filters.severity);
        
        if (newSeverity.has(severity)) {
            newSeverity.delete(severity);
        } else {
            newSeverity.add(severity);
        }
        
        onFiltersChange({
            ...filters,
            severity: newSeverity
        });
    };

    const handleCategoryToggle = (category: string) => {
        const newCategories = new Set(filters.categories);
        
        if (newCategories.has(category)) {
            newCategories.delete(category);
        } else {
            newCategories.add(category);
        }
        
        onFiltersChange({
            ...filters,
            categories: newCategories
        });
    };

    const handleSearchChange = (searchTerm: string) => {
        onFiltersChange({
            ...filters,
            searchTerm
        });
    };

    const handleClearFilters = () => {
        onFiltersChange(IssueFilterManager.createDefaultFilters());
    };

    const hasActiveFilters = 
        filters.severity.size < 3 || 
        filters.categories.size > 0 || 
        filters.searchTerm.length > 0;

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-800">Filter Issues</h3>
                    <span className="text-sm text-slate-500">
                        ({stats.filteredIssues} of {stats.totalIssues})
                    </span>
                </div>
                
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search issues by message, category, or rule..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {filters.searchTerm && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Severity Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Severity
                    </label>
                    <div className="space-y-2">
                        <SeverityButton
                            severity="error"
                            count={stats.bySeverity.error}
                            isActive={filters.severity.has('error')}
                            onClick={() => handleSeverityToggle('error')}
                            icon={<AlertCircle className="w-4 h-4" />}
                            color="red"
                        />
                        <SeverityButton
                            severity="warning"
                            count={stats.bySeverity.warning}
                            isActive={filters.severity.has('warning')}
                            onClick={() => handleSeverityToggle('warning')}
                            icon={<AlertTriangle className="w-4 h-4" />}
                            color="yellow"
                        />
                        <SeverityButton
                            severity="info"
                            count={stats.bySeverity.info}
                            isActive={filters.severity.has('info')}
                            onClick={() => handleSeverityToggle('info')}
                            icon={<Info className="w-4 h-4" />}
                            color="blue"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Categories
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2">
                        {categories.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No categories available</p>
                        ) : (
                            categories.map(category => (
                                <CategoryButton
                                    key={category}
                                    category={category}
                                    count={stats.byCategory.get(category) || 0}
                                    isActive={filters.categories.has(category)}
                                    onClick={() => handleCategoryToggle(category)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                        {Array.from(filters.categories).map(category => (
                            <FilterTag
                                key={category}
                                label={category}
                                onRemove={() => handleCategoryToggle(category)}
                            />
                        ))}
                        {filters.searchTerm && (
                            <FilterTag
                                label={`Search: "${filters.searchTerm}"`}
                                onRemove={() => handleSearchChange('')}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Severity Button Component
interface SeverityButtonProps {
    severity: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    color: 'red' | 'yellow' | 'blue';
}

const SeverityButton: React.FC<SeverityButtonProps> = ({
    severity,
    count,
    isActive,
    onClick,
    icon,
    color
}) => {
    const colorClasses = {
        red: {
            active: 'bg-red-100 border-red-300 text-red-700',
            inactive: 'bg-slate-50 border-slate-200 text-slate-400'
        },
        yellow: {
            active: 'bg-yellow-100 border-yellow-300 text-yellow-700',
            inactive: 'bg-slate-50 border-slate-200 text-slate-400'
        },
        blue: {
            active: 'bg-blue-100 border-blue-300 text-blue-700',
            inactive: 'bg-slate-50 border-slate-200 text-slate-400'
        }
    };

    const classes = isActive ? colorClasses[color].active : colorClasses[color].inactive;

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${classes} hover:shadow-sm`}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-medium capitalize">{severity}</span>
            </div>
            <span className="text-sm font-semibold">{count}</span>
        </button>
    );
};

// Category Button Component
interface CategoryButtonProps {
    category: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
    category,
    count,
    isActive,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-all ${
                isActive
                    ? 'bg-blue-100 border border-blue-300 text-blue-700'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
        >
            <span className="font-medium">{category}</span>
            <span className="text-xs font-semibold">{count}</span>
        </button>
    );
};

// Filter Tag Component
interface FilterTagProps {
    label: string;
    onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove }) => {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <span>{label}</span>
            <button
                onClick={onRemove}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

export default IssueFilterPanel;