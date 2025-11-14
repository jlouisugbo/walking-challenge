import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChallengeProvider } from './contexts/ChallengeContext';
import { Layout } from './components/common/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { Teams } from './pages/Teams';
import { HeatWeek } from './pages/HeatWeek';
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
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </ChallengeProvider>
  );
}

export default App;
