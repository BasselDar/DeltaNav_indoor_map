import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import IndoorMapPage from './pages/IndoorMapPage';

// Routes Configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <IndoorMapPage />,
  },
  {
    path: '/IndoorMap',
    element: <IndoorMapPage />,
  },
]);

// Main App Wrapper
const AppWrapper: React.FC = () => (
  <div>
    <RouterProvider router={router} />
  </div>
);

export default AppWrapper;
