'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { syncRepositories, listRepositories, getRepositoryStats, startAnalysis } from '@/lib/api';
import { Github, Code, Star, GitFork, RefreshCw } from 'lucide-react';

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
        alert(`✅ Analysis completed for ${repoName}!\n\nAnalysis ID: ${result.analysis_id}`);
      } else if (result.status === 'failed') {
        alert(`❌ Analysis failed for ${repoName}`);
      } else {
        alert(`⏳ Analysis in progress for ${repoName}...`);
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

          {/* Sync Button */}
          <div className="mb-6">
            <button
              onClick={handleSyncRepositories}
              disabled={syncing}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync GitHub Repositories'}
            </button>
          </div>

          {/* Repositories List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Repositories</h3>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading repositories...</div>
            ) : repositories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No repositories found. Click "Sync GitHub Repositories" to import your repos.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {repositories.map((repo) => (
                  <div key={repo.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                          >
                            {repo.full_name}
                          </a>
                          {repo.is_private && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Private
                            </span>
                          )}
                        </div>
                        
                        {repo.description && (
                          <p className="mt-1 text-sm text-gray-600">{repo.description}</p>
                        )}
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
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
                        onClick={() => handleAnalyzeRepository(repo.id, repo.full_name)}
                        disabled={analyzingRepos.has(repo.id)}
                        className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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