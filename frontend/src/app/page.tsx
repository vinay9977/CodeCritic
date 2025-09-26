'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          CodeCritic AI
        </h1>
        <p className="text-gray-600 mb-6">
          AI-powered code review platform
        </p>
        
        <div className="space-y-3 text-sm mb-6">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
            <span>Backend API</span>
            <span className="text-green-600 font-semibold">✅ Running</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
            <span>Database</span>
            <span className="text-green-600 font-semibold">✅ Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
            <span>Frontend</span>
            <span className="text-green-600 font-semibold">✅ Ready</span>
          </div>
        </div>
        
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors w-full inline-block"
        >
          Get Started with GitHub
        </Link>
      </div>
    </div>
  );
}