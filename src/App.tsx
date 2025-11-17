import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ChallengeProvider } from './contexts/ChallengeContext';
import { Layout } from './components/common/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { HeatWeek } from './pages/HeatWeek';
import { WelcomeModal } from './components/ui/WelcomeModal';

// Lazy load less frequently accessed pages
const Teams = lazy(() => import('./pages/Teams').then(module => ({ default: module.Teams })));
const Statistics = lazy(() => import('./pages/Statistics').then(module => ({ default: module.Statistics })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ChallengeProvider>
        <Router>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="/leaderboard" element={<ErrorBoundary><Leaderboard /></ErrorBoundary>} />
                  <Route path="/teams" element={<ErrorBoundary><Teams /></ErrorBoundary>} />
                  <Route path="/heat-week" element={<ErrorBoundary><HeatWeek /></ErrorBoundary>} />
                  <Route path="/stats" element={<ErrorBoundary><Statistics /></ErrorBoundary>} />
                  <Route path="/admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </Layout>
        </Router>
        {/* Welcome Modal - shows rules on first visit */}
        <WelcomeModal />
        {/* Toast Notifications */}
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1f2e',
            color: '#fff',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      </ChallengeProvider>
    </ErrorBoundary>
  );
}

export default App;
