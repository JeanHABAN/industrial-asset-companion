// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './App';

// CSS: tailwind first, then your design layer, then site overrides
import './styles/tailwind.css';
import './styles/pro.css';
import './index.css';

import { ToastProvider } from './ui/Toast';
import { PlantsProvider } from '../src/storage/plantsContext'; // <-- add this

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
          {/* Make the Plants context available to everything (including /plants) */}
          <PlantsProvider>
            <App />
          </PlantsProvider>
        </BrowserRouter>
      </ToastProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
