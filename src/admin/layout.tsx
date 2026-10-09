/**
 * Admin Portal Layout
 * Shell for future monetization features
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, UsersIcon, CogIcon } from '../components/icons';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  // Check if user is admin (parent role)
  const isAdmin = true; // TODO: Check from auth state

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Chore Champ Admin
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Family Management Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* TODO: Add user info */}
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <UsersIcon className="w-4 h-4" />
                Family Members
              </button>
              
              <button
                onClick={() => navigate('/admin/settings')}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <CogIcon className="w-4 h-4" />
                Settings
              </button>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                ← Back to App
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Chore Champ Admin Portal © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
