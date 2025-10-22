'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAnalysis } from '@/lib/api';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  Code,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';

interface CodeIssue {
  id: number;
  severity: string;
  category: string;
  file_path: string;
  line_number: number | null;
  title: string;
  description: string;
  suggestion: string;
}

interface Analysis {
  id: number;
  repository_id: number;
  status: string;
  overall_score: number;
  summary: string;
  total_issues: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  files_analyzed: number;
  lines_analyzed: number;
  created_at: string;
  completed_at: string;
  issues: CodeIssue[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analysisId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && analysisId) {
      loadAnalysis();
    }
  }, [user, analysisId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalysis(parseInt(analysisId));
      setAnalysis(data);
    } catch (err: any) {
      console.error('Failed to load analysis:', err);
      setError(err.response?.data?.detail || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <XCircle className="w-5 h-5" />;
      case 'high':
        return <AlertCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Analysis</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Analysis not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
              <h1 className="text-xl font-bold text-gray-900">Analysis Results</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analysis #{analysis.id}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(analysis.created_at).toLocaleString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    analysis.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    analysis.status === 'failed' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analysis.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            </div>

            {analysis.summary && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
                <p className="text-gray-700">{analysis.summary}</p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Files Analyzed</p>
                  <p className="text-3xl font-bold text-gray-900">{analysis.files_analyzed}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lines of Code</p>
                  <p className="text-3xl font-bold text-gray-900">{analysis.lines_analyzed}</p>
                </div>
                <Code className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-900">{analysis.total_issues}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Code Quality</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score >= 90 ? 'Excellent' : 
                     analysis.overall_score >= 70 ? 'Good' : 
                     analysis.overall_score >= 50 ? 'Fair' : 'Poor'}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Issues by Severity */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Issues by Severity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border-2 border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-red-600">Critical</span>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{analysis.critical_issues}</p>
              </div>

              <div className="p-4 border-2 border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-orange-600">High</span>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600">{analysis.high_issues}</p>
              </div>

              <div className="p-4 border-2 border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-yellow-600">Medium</span>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{analysis.medium_issues}</p>
              </div>

              <div className="p-4 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-600">Low</span>
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{analysis.low_issues}</p>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {analysis.issues && analysis.issues.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Detected Issues ({analysis.issues.length})
              </h3>
              <div className="space-y-4">
                {analysis.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`border-2 rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(issue.severity)}
                        <h4 className="font-semibold text-lg">{issue.title}</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white">
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">File:</span> {issue.file_path}
                        {issue.line_number && (
                          <span className="ml-2">
                            <span className="font-semibold">Line:</span> {issue.line_number}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Category:</span> {issue.category}
                      </p>
                    </div>

                    <p className="text-gray-700 mb-3">{issue.description}</p>

                    {issue.suggestion && (
                      <div className="bg-white bg-opacity-50 rounded p-3">
                        <p className="text-sm font-semibold text-gray-900 mb-1">💡 Suggestion:</p>
                        <p className="text-sm text-gray-700">{issue.suggestion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Issues Found!
              </h3>
              <p className="text-gray-600">
                Your code looks great! No issues were detected during the analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}