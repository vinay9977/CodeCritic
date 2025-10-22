'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAnalysis } from '@/lib/api';
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, XCircle, FileCode, Clock, DollarSign } from 'lucide-react';

interface CodeIssue {
  id: number;
  severity: string;
  category: string;
  file_path: string;
  line_number: number | null;
  title: string;
  description: string;
  suggestion: string | null;
  created_at: string;
}

interface Analysis {
  id: number;
  repository_id: number;
  status: string;
  overall_score: number | null;
  total_issues: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  summary: string | null;
  files_analyzed: number;
  lines_analyzed: number;
  tokens_used: number;
  estimated_cost: number;
  created_at: string;
  completed_at: string | null;
  issues: CodeIssue[];
}

export default function AnalysisResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const analysisId = searchParams.get('id');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (analysisId && user) {
      loadAnalysis();
    }
  }, [analysisId, user]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await getAnalysis(parseInt(analysisId!));
      setAnalysis(data);
    } catch (error: any) {
      console.error('Failed to load analysis:', error);
      setError(error.response?.data?.detail || 'Failed to load analysis results');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'high': return <AlertCircle className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredIssues = analysis?.issues.filter(issue => 
    selectedSeverity === 'all' || issue.severity.toLowerCase() === selectedSeverity
  ) || [];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">{user?.username}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Analysis Results
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Score</h3>
              <p className={`text-4xl font-bold ${getScoreColor(analysis.overall_score || 0)}`}>
                {analysis.overall_score || 0}/100
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Issues</h3>
              <p className="text-4xl font-bold text-gray-900">{analysis.total_issues}</p>
              <div className="mt-2 text-sm text-gray-600">
                <span className="text-red-600 font-semibold">{analysis.critical_issues}</span> Critical, 
                <span className="text-orange-600 font-semibold ml-1">{analysis.high_issues}</span> High
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Files Analyzed</h3>
              <p className="text-4xl font-bold text-gray-900">{analysis.files_analyzed}</p>
              <p className="text-sm text-gray-600 mt-2">{analysis.lines_analyzed.toLocaleString()} lines</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost</h3>
              <p className="text-4xl font-bold text-gray-900">${analysis.estimated_cost.toFixed(4)}</p>
              <p className="text-sm text-gray-600 mt-2">{analysis.tokens_used.toLocaleString()} tokens</p>
            </div>
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>
          )}

          {/* Issue Filter */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Issues ({filteredIssues.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSeverity('all')}
                  className={`px-4 py-2 rounded ${selectedSeverity === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedSeverity('critical')}
                  className={`px-4 py-2 rounded ${selectedSeverity === 'critical' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Critical ({analysis.critical_issues})
                </button>
                <button
                  onClick={() => setSelectedSeverity('high')}
                  className={`px-4 py-2 rounded ${selectedSeverity === 'high' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  High ({analysis.high_issues})
                </button>
                <button
                  onClick={() => setSelectedSeverity('medium')}
                  className={`px-4 py-2 rounded ${selectedSeverity === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Medium ({analysis.medium_issues})
                </button>
                <button
                  onClick={() => setSelectedSeverity('low')}
                  className={`px-4 py-2 rounded ${selectedSeverity === 'low' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Low ({analysis.low_issues})
                </button>
              </div>
            </div>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg">No issues found in this category!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`border-l-4 p-4 rounded ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
                            {issue.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {issue.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <FileCode className="w-4 h-4" />
                          <span className="font-mono">{issue.file_path}</span>
                          {issue.line_number && (
                            <span className="text-gray-400">Line {issue.line_number}</span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{issue.description}</p>
                        {issue.suggestion && (
                          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                            <p className="text-sm font-semibold text-green-800 mb-1">Suggestion:</p>
                            <p className="text-sm text-green-700">{issue.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Analysis ID:</span>
                <span className="ml-2 text-gray-600">{analysis.id}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <span className="ml-2 text-gray-600">{analysis.status}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Started:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(analysis.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Completed:</span>
                <span className="ml-2 text-gray-600">
                  {analysis.completed_at ? new Date(analysis.completed_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}