import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, XCircle, Code, FileText, TrendingUp } from 'lucide-react';
import { analyzer } from '../utils/analyzer';
import { AnalysisResult, CodeIssue } from '../types';

const CodeAnalyzer: React.FC = () => {
    const [code, setCode] = useState(`import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/' + userId);
      const userData = await response.json();
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => fetchUser()}>Refresh</button>
    </div>
  );
};

export default UserProfile;`);

    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeCode = useCallback(async () => {
        setIsAnalyzing(true);

        // Simulate analysis delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = analyzer.analyzeCode(code);
        setAnalysisResult(result);
        setIsAnalyzing(false);
    }, [code]);

    const getIssueIcon = (type: string) => {
        const iconStyle = { width: '16px', height: '16px' };
        switch (type) {
            case 'error':
                return <XCircle style={{ ...iconStyle, color: '#dc2626' }} />;
            case 'warning':
                return <AlertCircle style={{ ...iconStyle, color: '#d97706' }} />;
            case 'info':
                return <CheckCircle style={{ ...iconStyle, color: '#2563eb' }} />;
            default:
                return <AlertCircle style={iconStyle} />;
        }
    };

    const getMetricColor = (score: number): React.CSSProperties => {
        if (score >= 8) return { color: '#16a34a' };
        if (score >= 6) return { color: '#d97706' };
        return { color: '#dc2626' };
    };

    const getMetricBg = (score: number): React.CSSProperties => {
        if (score >= 8) return { backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' };
        if (score >= 6) return { backgroundColor: '#fef3c7', border: '1px solid #fde68a' };
        return { backgroundColor: '#fee2e2', border: '1px solid #fecaca' };
    };

    const getProgressBarColor = (score: number): string => {
        if (score >= 8) return '#10b981';
        if (score >= 6) return '#f59e0b';
        return '#ef4444';
    };

    // Styles
    const containerStyle: React.CSSProperties = {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    };

    const maxWidthStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto'
    };

    const headerStyle: React.CSSProperties = {
        marginBottom: '40px',
        textAlign: 'center'
    };

    const titleContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '16px'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: 0
    };

    const subtitleStyle: React.CSSProperties = {
        color: '#64748b',
        fontSize: '18px',
        margin: 0,
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.6'
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
        gap: '32px',
        alignItems: 'flex-start'
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        padding: '24px'
    };

    const sectionHeaderStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1e293b',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px 20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
    };

    const disabledButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#94a3b8',
        cursor: 'not-allowed',
        boxShadow: 'none'
    };

    const textareaStyle: React.CSSProperties = {
        width: '100%',
        height: '400px',
        padding: '16px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
        fontSize: '14px',
        resize: 'none',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        backgroundColor: '#fafafa',
        lineHeight: '1.5'
    };

    const tipStyle: React.CSSProperties = {
        marginTop: '12px',
        padding: '12px 16px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e40af'
    };

    const metricsGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px'
    };

    const metricCardStyle: React.CSSProperties = {
        padding: '16px',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden'
    };

    const summaryGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
    };

    const summaryCardStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '20px 16px',
        borderRadius: '8px'
    };

    const issueContainerStyle: React.CSSProperties = {
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '4px'
    };

    const issueStyle: React.CSSProperties = {
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#fafafa',
        transition: 'all 0.2s ease'
    };

    const suggestionStyle: React.CSSProperties = {
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '6px',
        padding: '10px',
        marginTop: '8px'
    };

    const emptyStateStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#64748b'
    };

    const featuresGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
    };

    const featureCardStyle: React.CSSProperties = {
        padding: '20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: 'white',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    };

    return (
        <div style={containerStyle}>
            <div style={maxWidthStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={titleContainerStyle}>
                        <Code style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
                        <h1 style={titleStyle}>React Code Quality Analyzer</h1>
                    </div>
                    <p style={subtitleStyle}>
                        Analyze your React components for quality issues, performance problems, and best practice violations.
                        Get instant feedback and intelligent suggestions for improvement.
                    </p>
                </div>

                <div style={gridStyle}>
                    {/* Code Input Section */}
                    <div>
                        <div style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <FileText style={{ width: '20px', height: '20px' }} />
                                    React Component Code
                                </h2>
                                <button
                                    onClick={analyzeCode}
                                    disabled={isAnalyzing || !code.trim()}
                                    style={isAnalyzing || !code.trim() ? disabledButtonStyle : buttonStyle}
                                    onMouseEnter={(e) => {
                                        if (!isAnalyzing && code.trim()) {
                                            e.currentTarget.style.backgroundColor = '#2563eb';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isAnalyzing && code.trim()) {
                                            e.currentTarget.style.backgroundColor = '#3b82f6';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {isAnalyzing ? '🔍 Analyzing...' : '🚀 Analyze Code'}
                                </button>
                            </div>

                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                style={textareaStyle}
                                placeholder="Paste your React component code here..."
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />

                            <div style={tipStyle}>
                                💡 <strong>Tip:</strong> Paste your React/TypeScript component code above and click "Analyze Code" to get instant feedback!
                            </div>
                        </div>
                    </div>

                    {/* Analysis Results Section */}
                    <div>
                        {analysisResult && (
                            <>
                                {/* Metrics Dashboard */}
                                <div style={{ ...cardStyle, marginBottom: '24px' }}>
                                    <h3 style={{ ...sectionTitleStyle, marginBottom: '20px' }}>
                                        <TrendingUp style={{ width: '20px', height: '20px' }} />
                                        Code Quality Metrics
                                    </h3>

                                    <div style={metricsGridStyle}>
                                        {Object.entries(analysisResult.metrics).map(([key, value]) => (
                                            <div key={key} style={{ ...metricCardStyle, ...getMetricBg(value) }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', textTransform: 'capitalize' }}>
                                                        {key}
                                                    </span>
                                                    <span style={{ fontSize: '18px', fontWeight: 'bold', ...getMetricColor(value) }}>
                                                        {value}/10
                                                    </span>
                                                </div>
                                                <div style={{ backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            backgroundColor: getProgressBarColor(value),
                                                            width: `${value * 10}%`,
                                                            transition: 'width 0.8s ease-in-out',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Issues Summary */}
                                <div style={{ ...cardStyle, marginBottom: '24px' }}>
                                    <h3 style={{ ...sectionTitleStyle, marginBottom: '20px' }}>📊 Issues Summary</h3>

                                    <div style={summaryGridStyle}>
                                        <div style={{ ...summaryCardStyle, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
                                                {analysisResult.summary.errors}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>Errors</div>
                                        </div>
                                        <div style={{ ...summaryCardStyle, backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706', marginBottom: '4px' }}>
                                                {analysisResult.summary.warnings}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#d97706', fontWeight: '500' }}>Warnings</div>
                                        </div>
                                        <div style={{ ...summaryCardStyle, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                                                {analysisResult.summary.info}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500' }}>Info</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Issues */}
                                <div style={cardStyle}>
                                    <h3 style={{ ...sectionTitleStyle, marginBottom: '20px' }}>🔍 Detailed Issues</h3>

                                    <div style={issueContainerStyle}>
                                        {analysisResult.issues.map((issue: CodeIssue) => (
                                            <div
                                                key={issue.id}
                                                style={issueStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fafafa';
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                    {getIssueIcon(issue.type)}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                                                {issue.category}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '12px',
                                                                color: '#64748b',
                                                                backgroundColor: '#f1f5f9',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                Line {issue.line}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '14px', color: '#374151', margin: '6px 0', lineHeight: '1.5' }}>
                                                            {issue.message}
                                                        </p>
                                                        <p style={{
                                                            fontSize: '12px',
                                                            color: '#64748b',
                                                            margin: '4px 0',
                                                            fontFamily: 'monospace',
                                                            backgroundColor: '#f8fafc',
                                                            padding: '2px 4px',
                                                            borderRadius: '3px',
                                                            display: 'inline-block'
                                                        }}>
                                                            Rule: {issue.rule}
                                                        </p>
                                                        {issue.suggestion && (
                                                            <div style={suggestionStyle}>
                                                                <p style={{ fontSize: '12px', color: '#1e40af', margin: 0, lineHeight: '1.4' }}>
                                                                    <strong>💡 Suggestion:</strong> {issue.suggestion}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {analysisResult.issues.length === 0 && (
                                            <div style={emptyStateStyle}>
                                                <CheckCircle style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#10b981' }} />
                                                <p style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                                                    🎉 Excellent! No issues found.
                                                </p>
                                                <p style={{ fontSize: '16px', margin: 0 }}>
                                                    Your code follows React best practices!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {!analysisResult && (
                            <div style={{ ...cardStyle, ...emptyStateStyle }}>
                                <Code style={{ width: '80px', height: '80px', margin: '0 auto 20px', color: '#94a3b8' }} />
                                <p style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>
                                    Ready to analyze your React code?
                                </p>
                                <p style={{ fontSize: '16px', margin: 0 }}>
                                    Paste your component code and click "Analyze Code" to get started
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div style={{ ...cardStyle, marginTop: '48px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px', textAlign: 'center' }}>
                        🔬 What We Analyze
                    </h2>

                    <div style={featuresGridStyle}>
                        {[
                            {
                                title: '⚛️ React Hooks',
                                description: 'Detects missing dependencies, incorrect hook usage, and optimization opportunities.'
                            },
                            {
                                title: '🛡️ Type Safety',
                                description: 'Validates PropTypes, TypeScript interfaces, and type-related best practices.'
                            },
                            {
                                title: '♿ Accessibility',
                                description: 'Checks for WCAG compliance and suggests improvements for better accessibility.'
                            },
                            {
                                title: '⚡ Performance',
                                description: 'Identifies performance bottlenecks and suggests React optimization patterns.'
                            },
                            {
                                title: '📊 Code Quality',
                                description: 'Measures complexity, maintainability, and overall code health metrics.'
                            },
                            {
                                title: '✨ Best Practices',
                                description: 'Enforces React community standards and modern development patterns.'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                style={featureCardStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px -8px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <h3 style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px', fontSize: '16px' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeAnalyzer;