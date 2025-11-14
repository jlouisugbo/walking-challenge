import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ChallengeProvider } from './contexts/ChallengeContext';
import { Layout } from './components/common/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { Teams } from './pages/Teams';
import { HeatWeek } from './pages/HeatWeek';
import { Statistics } from './pages/Statistics';
import { Admin } from './pages/Admin';

function App() {
  return (
    <ChallengeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/heat-week" element={<HeatWeek />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
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
  );
}

export default App;
