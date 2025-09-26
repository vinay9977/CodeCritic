'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CodeCritic AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.username}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.username}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Welcome to your Dashboard!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">User Info</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-blue-700">Username: {user.username}</p>
                  <p className="text-sm text-blue-700">Name: {user.name || 'Not set'}</p>
                  <p className="text-sm text-blue-700">Email: {user.email || 'Not set'}</p>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">GitHub Integration</h3>
                <div className="mt-2">
                  <p className="text-sm text-green-700">✅ Connected</p>
                  <p className="text-sm text-green-700">Ready to analyze repositories</p>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900">AI Analysis</h3>
                <div className="mt-2">
                  <p className="text-sm text-purple-700">🤖 Ready</p>
                  <p className="text-sm text-purple-700">OpenAI integration available</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border">
                  <div className="font-medium">Sync GitHub Repositories</div>
                  <div className="text-sm text-gray-600">Import your repositories for analysis</div>
                </button>
                <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border">
                  <div className="font-medium">Start Code Review</div>
                  <div className="text-sm text-gray-600">Analyze code quality with AI</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}