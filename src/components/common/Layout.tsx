import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, Users, Flame, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                🏃 Step Challenge Tracker
              </h1>
              <p className="text-sm text-gray-400">End the Semester Well!</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-400">Nov 10 - Dec 10, 2025</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-primary border-t border-white/10 backdrop-blur-lg">
        <div className="flex items-center justify-around px-4 py-3">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
          <NavItem to="/teams" icon={Users} label="Teams" />
          <NavItem to="/heat-week" icon={Flame} label="Heat Week" />
          <NavItem to="/admin" icon={Settings} label="Admin" />
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-20 left-0 right-0 bg-primary-light/80 border-b border-white/10 backdrop-blur-lg z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            <DesktopNavItem to="/" icon={Home} label="Dashboard" />
            <DesktopNavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <DesktopNavItem to="/teams" icon={Users} label="Teams" />
            <DesktopNavItem to="/heat-week" icon={Flame} label="Heat Week" />
            <DesktopNavItem to="/admin" icon={Settings} label="Admin" />
          </div>
        </div>
      </nav>

      {/* Spacer for desktop nav */}
      <div className="hidden md:block h-14" />
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
        `flex flex-col items-center gap-1 text-xs transition-colors ${
          isActive ? 'text-accent' : 'text-gray-400 hover:text-white'
        }`
      }
    >
      <Icon className="w-6 h-6" />
      <span>{label}</span>
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
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
};
