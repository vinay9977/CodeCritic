'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { syncRepositories, listRepositories, getRepositoryStats, startAnalysis } from '@/lib/api';
import { Github, Code, Star, GitFork, RefreshCw, ExternalLink } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  is_private: boolean;
  stars_count: number;
  forks_count: number;
  updated_at: string;
}

interface RepoStats {
  total_repositories: number;
  total_stars: number;
  total_forks: number;
  languages: Record<string, number>;
  private_repos: number;
  public_repos: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzingRepos, setAnalyzingRepos] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadRepositories();
      loadStats();
    }
  }, [user]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const repos = await listRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const repoStats = await getRepositoryStats();
      setStats(repoStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSyncRepositories = async () => {
    try {
      setSyncing(true);
      const result = await syncRepositories();
      setRepositories(result.repositories);
      await loadStats();
      alert(`Successfully synced ${result.synced_count} repositories!`);
    } catch (error: any) {
      console.error('Failed to sync repositories:', error);
      alert(error.response?.data?.detail || 'Failed to sync repositories');
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyzeRepository = async (repoId: number, repoName: string) => {
    try {
      setAnalyzingRepos(prev => new Set(prev).add(repoId));
      
      const result = await startAnalysis(repoId);
      
      if (result.status === 'completed') {
        // Navigate to results page
        router.push(`/analysis/results?id=${result.analysis_id}`);
      } else if (result.status === 'failed') {
        alert(`❌ Analysis failed for ${repoName}`);
      } else {
        // Navigate to results page even if in progress
        router.push(`/analysis/results?id=${result.analysis_id}`);
      }
    } catch (error: any) {
      console.error('Failed to start analysis:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to start analysis';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setAnalyzingRepos(prev => {
        const newSet = new Set(prev);
        newSet.delete(repoId);
        return newSet;
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CodeCritic AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                <Github className="inline w-4 h-4 mr-1" />
                {user.username}
              </span>
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to your Dashboard!
          </h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">Repositories</h3>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                {stats?.total_repositories || 0}
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900">Total Stars</h3>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {stats?.total_stars || 0}
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900">Total Forks</h3>
              <p className="text-3xl font-bold text-purple-700 mt-2">
                {stats?.total_forks || 0}
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900">Languages</h3>
              <p className="text-3xl font-bold text-yellow-700 mt-2">
                {stats?.languages ? Object.keys(stats.languages).length : 0}
              </p>
            </div>
          </div>

          {/* Repositories Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Your Repositories</h3>
                <button
                  onClick={handleSyncRepositories}
                  disabled={syncing}
                  className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Repositories'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading repositories...</p>
              </div>
            ) : repositories.length === 0 ? (
              <div className="p-12 text-center">
                <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No repositories found</p>
                <button
                  onClick={handleSyncRepositories}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sync Your Repositories
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {repositories.map((repo) => (
                  <div key={repo.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {repo.full_name}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          {repo.is_private && (
                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                              Private
                            </span>
                          )}
                        </div>
                        
                        {repo.description && (
                          <p className="text-gray-600 mb-3">{repo.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {repo.language && (
                            <span className="flex items-center">
                              <Code className="w-4 h-4 mr-1" />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {repo.stars_count}
                          </span>
                          <span className="flex items-center">
                            <GitFork className="w-4 h-4 mr-1" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAnalyzeRepository(repo.id, repo.name)}
                        disabled={analyzingRepos.has(repo.id)}
                        className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {analyzingRepos.has(repo.id) ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}