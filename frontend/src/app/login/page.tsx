'use client';

import { useState } from 'react';
import { githubLogin } from '@/lib/api';
import { Github } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      const { auth_url } = await githubLogin();
      window.location.href = auth_url;
    } catch (error) {
      console.error('GitHub login error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to CodeCritic AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your GitHub account to start analyzing your repositories
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github className="w-5 h-5 mr-2" />
            {loading ? 'Redirecting...' : 'Continue with GitHub'}
          </button>
        </div>
      </div>
    </div>
  );
}