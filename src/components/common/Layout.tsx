import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, Users, Flame, Settings, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Consolidated Header with Navigation */}
      <header className="bg-gradient-primary border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                🏃 Step Challenge Tracker
              </h1>
              <p className="text-xs md:text-sm text-gray-400">End the Semester Well!</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-gray-400">Nov 10 - Dec 10, 2025</span>
            </div>
          </div>

          {/* Desktop Navigation - Integrated in Header */}
          <nav className="hidden md:flex items-center gap-2">
            <DesktopNavItem to="/" icon={Home} label="Dashboard" />
            <DesktopNavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <DesktopNavItem to="/teams" icon={Users} label="Teams" />
            <DesktopNavItem to="/heat-week" icon={Flame} label="Heat Week" />
            <DesktopNavItem to="/stats" icon={TrendingUp} label="Statistics" />
            <DesktopNavItem to="/admin" icon={Settings} label="Admin" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-primary border-t border-white/10 backdrop-blur-lg z-50">
        <div className="grid grid-cols-6 px-2 py-2">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/leaderboard" icon={Trophy} label="Board" />
          <NavItem to="/teams" icon={Users} label="Teams" />
          <NavItem to="/heat-week" icon={Flame} label="Heat" />
          <NavItem to="/stats" icon={TrendingUp} label="Stats" />
          <NavItem to="/admin" icon={Settings} label="Admin" />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({
  to,
  icon: Icon,
  label,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-1 text-[10px] transition-colors ${
          isActive ? 'text-accent' : 'text-gray-400 hover:text-white'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="truncate w-full text-center">{label}</span>
    </NavLink>
  );
};

const DesktopNavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({
  to,
  icon: Icon,
  label,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isActive
            ? 'bg-accent text-white font-semibold'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </NavLink>
  );
};
