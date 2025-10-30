'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Zap, Target, Github, CheckCircle, Code2, TrendingUp, Lock, X, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Code2 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CodeCritic AI</span>
            </div>
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              <Github className="w-5 h-5" />
              <span>Sign in with GitHub</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Code Analysis</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Catch Bugs Before
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              They Ship
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Automated AI code reviews that identify security vulnerabilities, performance issues, 
            and code quality problems in seconds. Integrate seamlessly with your GitHub repositories.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Github className="w-5 h-5" />
              <span>Get Started Free</span>
            </Link>
            <button 
              onClick={() => setShowDemo(true)}
              className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg transition-colors font-semibold text-lg border-2 border-gray-200 w-full sm:w-auto"
            >
              <span>View Demo</span>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            Free for open source • No credit card required
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
            <div className="text-gray-600">Repositories Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">500K+</div>
            <div className="text-gray-600">Issues Detected</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">15+</div>
            <div className="text-gray-600">Languages Supported</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Code Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by advanced AI models to deliver deep insights into your codebase
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Security Analysis</h3>
              <p className="text-gray-700 mb-6">
                Detect SQL injection, XSS vulnerabilities, exposed secrets, and other critical 
                security issues before they reach production.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">OWASP Top 10 coverage</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Secret scanning</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Dependency vulnerabilities</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Optimization</h3>
              <p className="text-gray-700 mb-6">
                Identify performance bottlenecks, memory leaks, inefficient algorithms, 
                and areas for optimization.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Complexity analysis</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Memory leak detection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Database query optimization</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h3>
              <p className="text-gray-700 mb-6">
                Ensure your code follows industry standards, design patterns, and 
                language-specific best practices.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Code style consistency</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Architecture patterns</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Documentation quality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              Simple setup, powerful results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect GitHub</h3>
              <p className="text-gray-600">
                Sign in with your GitHub account and select repositories to analyze
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Run Analysis</h3>
              <p className="text-gray-600">
                Our AI instantly scans your code for issues across security, performance, and quality
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Insights</h3>
              <p className="text-gray-600">
                Review detailed reports with actionable recommendations to improve your code
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Supports Your Tech Stack
            </h2>
            <p className="text-xl text-gray-600">
              Works with the languages and frameworks you use
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C++', 'Rust', 'Swift'].map((lang) => (
              <div key={lang} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-center font-semibold text-gray-700 transition-colors">
                {lang}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Improve Your Code Quality?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of developers using CodeCritic AI to ship better code
          </p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg transition-colors font-semibold text-lg shadow-lg"
          >
            <Github className="w-5 h-5" />
            <span>Start Analyzing for Free</span>
          </Link>
          <p className="text-blue-100 mt-6 text-sm">
            <Lock className="w-4 h-4 inline mr-1" />
            Your code stays private and secure
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Code2 className="w-6 h-6 text-blue-500" />
              <span className="text-white font-bold">CodeCritic AI</span>
            </div>
            <div className="text-sm">
              © 2024 CodeCritic AI. Built with AI for developers.
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Sample Analysis Report</h3>
                <p className="text-gray-600 mt-1">Example repository: react-e-commerce-app</p>
              </div>
              <button
                onClick={() => setShowDemo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Score Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Overall Code Quality</h4>
                    <p className="text-gray-600">Based on 23 files and 3,847 lines of code</p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold text-green-600">78</div>
                    <div className="text-gray-600 font-medium">Good</div>
                  </div>
                </div>
              </div>

              {/* Issue Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-700">Critical</span>
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-red-600">2</div>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-orange-700">High</span>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600">5</div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-yellow-700">Medium</span>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-600">12</div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-700">Low</span>
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">18</div>
                </div>
              </div>

              {/* Sample Issues */}
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Sample Issues Detected</h4>

                {/* Critical Issue */}
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">CRITICAL</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">Security</span>
                    </div>
                    <span className="text-sm text-gray-600">auth.js:45</span>
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">SQL Injection Vulnerability</h5>
                  <p className="text-gray-700 mb-3">
                    User input is directly concatenated into SQL query without sanitization or parameterization, 
                    creating a critical SQL injection vulnerability.
                  </p>
                  <div className="bg-white p-3 rounded border border-red-200">
                    <p className="text-sm font-semibold text-gray-700 mb-1">💡 Suggestion:</p>
                    <p className="text-sm text-gray-600">
                      Use parameterized queries or prepared statements. Replace direct concatenation with 
                      placeholder binding to prevent SQL injection attacks.
                    </p>
                  </div>
                </div>

                {/* High Issue */}
                <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded">HIGH</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">Security</span>
                    </div>
                    <span className="text-sm text-gray-600">config.js:12</span>
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">Exposed API Key in Source Code</h5>
                  <p className="text-gray-700 mb-3">
                    Hardcoded API key detected in source code. This sensitive credential should be stored 
                    in environment variables.
                  </p>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <p className="text-sm font-semibold text-gray-700 mb-1">💡 Suggestion:</p>
                    <p className="text-sm text-gray-600">
                      Move API keys to environment variables (.env file) and use process.env to access them. 
                      Add .env to .gitignore to prevent committing secrets.
                    </p>
                  </div>
                </div>

                {/* Medium Issue */}
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded">MEDIUM</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">Performance</span>
                    </div>
                    <span className="text-sm text-gray-600">ProductList.jsx:89</span>
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">Inefficient Loop in Render Method</h5>
                  <p className="text-gray-700 mb-3">
                    Multiple nested loops with O(n²) complexity causing performance degradation with large datasets.
                  </p>
                  <div className="bg-white p-3 rounded border border-yellow-200">
                    <p className="text-sm font-semibold text-gray-700 mb-1">💡 Suggestion:</p>
                    <p className="text-sm text-gray-600">
                      Use a Map or object for O(1) lookups instead of nested loops. Consider memoization 
                      with useMemo to prevent unnecessary recalculations.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
                <h4 className="text-2xl font-bold text-white mb-3">
                  Ready to analyze your code?
                </h4>
                <p className="text-blue-100 mb-6">
                  Get detailed insights like this for all your repositories
                </p>
                <Link
                  href="/login"
                  onClick={() => setShowDemo(false)}
                  className="inline-flex items-center space-x-2 bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  <Github className="w-5 h-5" />
                  <span>Sign Up with GitHub</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}