import { CodeIssue, IssueFilters, FilterStats } from '../types';

export class IssueFilterManager {
    /**
     * Filters issues based on the provided filter criteria
     */
    static filterIssues(issues: CodeIssue[], filters: IssueFilters): CodeIssue[] {
        return issues.filter(issue => {
            // Filter by severity
            const matchesSeverity = filters.severity.size === 0 || 
                                  filters.severity.has(issue.type);
            
            // Filter by category
            const matchesCategory = filters.categories.size === 0 || 
                                  filters.categories.has(issue.category);
            
            // Filter by search term
            const matchesSearch = this.matchesSearchTerm(issue, filters.searchTerm);
            
            return matchesSeverity && matchesCategory && matchesSearch;
        });
    }

    /**
     * Checks if an issue matches the search term
     */
    private static matchesSearchTerm(issue: CodeIssue, searchTerm: string): boolean {
        if (!searchTerm.trim()) return true;
        
        const term = searchTerm.toLowerCase();
        
        return (
            issue.message.toLowerCase().includes(term) ||
            issue.category.toLowerCase().includes(term) ||
            issue.rule.toLowerCase().includes(term) ||
            (issue.suggestion?.toLowerCase().includes(term) ?? false)
        );
    }

    /**
     * Gets statistics about the issues
     */
    static getFilterStats(
        allIssues: CodeIssue[], 
        filteredIssues: CodeIssue[]
    ): FilterStats {
        const bySeverity = {
            error: allIssues.filter(i => i.type === 'error').length,
            warning: allIssues.filter(i => i.type === 'warning').length,
            info: allIssues.filter(i => i.type === 'info').length,
        };

        const byCategory = new Map<string, number>();
        allIssues.forEach(issue => {
            const count = byCategory.get(issue.category) || 0;
            byCategory.set(issue.category, count + 1);
        });

        return {
            totalIssues: allIssues.length,
            filteredIssues: filteredIssues.length,
            bySeverity,
            byCategory
        };
    }

    /**
     * Gets unique categories from issues
     */
    static getUniqueCategories(issues: CodeIssue[]): string[] {
        const categories = new Set(issues.map(issue => issue.category));
        return Array.from(categories).sort();
    }

    /**
     * Creates default filters
     */
    static createDefaultFilters(): IssueFilters {
        return {
            severity: new Set(['error', 'warning', 'info']),
            categories: new Set(),
            searchTerm: ''
        };
    }

    /**
     * Clears all filters
     */
    static clearFilters(): IssueFilters {
        return this.createDefaultFilters();
    }
}