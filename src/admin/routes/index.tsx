import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from '../layout';
import UsersView from '../views/UsersView';
import RewardsView from '../views/RewardsView';
import ChoresView from '../views/ChoresView';
import RequestsView from '../views/RequestsView';
import SettingsView from '../views/SettingsView';
import NotificationsView from '../views/NotificationsView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <UsersView />,
      },
      {
        path: 'users',
        element: <UsersView />,
      },
      {
        path: 'rewards',
        element: <RewardsView />,
      },
      {
        path: 'chores',
        element: <ChoresView />,
      },
      {
        path: 'requests',
        element: <RequestsView />,
      },
      {
        path: 'settings',
        element: <SettingsView />,
      },
      {
        path: 'notifications',
        element: <NotificationsView />,
      },
    ],
  },
]);

export default router;
