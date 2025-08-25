import React from 'react';
import ReactDOM from 'react-dom/client';
import * as tanstackQuery from '@tanstack/react-query';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const queryClient = new tanstackQuery.QueryClient();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <tanstackQuery.QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </tanstackQuery.QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);