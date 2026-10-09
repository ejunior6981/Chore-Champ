/**
 * Admin Routes
 * Defines protected routes for admin portal
 */

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from '../layout';
import UsersView from '../views/UsersView';
import RewardsView from '../views/RewardsView';
import ChoresView from '../views/ChoresView';
import RequestsView from '../views/RequestsView';
import SettingsView from '../views/SettingsView';
import NotificationsView from '../views/NotificationsView';

// Placeholder views (to be implemented)
const UsersViewPlaceholder: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Family Members
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        Manage family members, reset points, and configure settings.
      </p>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          This feature will be available in the next release.
        </p>
      </div>
    </div>
  </div>
);

const RewardsViewPlaceholder: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Rewards Management
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        View and manage all available rewards.
      </p>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          This feature will be available in the next release.
        </p>
      </div>
    </div>
  </div>
);

const ChoresViewPlaceholder: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Chore Management
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        View and manage all chores in the family.
      </p>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          This feature will be available in the next release.
        </p>
      </div>
    </div>
  </div>
);

const RequestsViewPlaceholder: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Point Requests
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        Approve or deny point requests from children.
      </p>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          This feature will be available in the next release.
        </p>
      </div>
    </div>
  </div>
);

const SettingsViewPlaceholder: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Admin Settings
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        Configure admin settings and preferences.
      </p>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          This feature will be available in the next release.
        </p>
      </div>
    </div>
  </div>
);

const NotificationsViewPlaceholder: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Notifications
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        View and manage all notifications.
      </p>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          This feature will be available in the next release.
        </p>
      </div>
    </div>
  </div>
);

// Router
const router = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <AdminLayout>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Manage your family and app settings
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => {}}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Family Members
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add, edit, or remove family members
                </p>
              </button>

              <button
                onClick={() => {}}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Rewards
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View and manage rewards
                </p>
              </button>

              <button
                onClick={() => {}}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Chores
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View and manage chores
                </p>
              </button>

              <button
                onClick={() => {}}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Point Requests
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Approve or deny requests
                </p>
              </button>

              <button
                onClick={() => {}}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Notifications
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View and manage notifications
                </p>
              </button>

              <button
                onClick={() => {}}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Settings
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Configure admin settings
                </p>
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    ),
    children: [
      {
        index: true,
        element: <UsersViewPlaceholder />,
      },
      {
        path: 'users',
        element: <UsersViewPlaceholder />,
      },
      {
        path: 'rewards',
        element: <RewardsViewPlaceholder />,
      },
      {
        path: 'chores',
        element: <ChoresViewPlaceholder />,
      },
      {
        path: 'requests',
        element: <RequestsViewPlaceholder />,
      },
      {
        path: 'settings',
        element: <SettingsViewPlaceholder />,
      },
      {
        path: 'notifications',
        element: <NotificationsViewPlaceholder />,
      },
    ],
  },
]);

export function AdminRoutes(): React.ReactElement {
  return <RouterProvider router={router} />;
}
