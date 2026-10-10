import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldCheck,
  Sun,
  Moon,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  MapPin,
  PlusCircle,
  BarChart3,
  BookOpen,
  Users,
  Settings,
  Layers,
  FileText,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notificationsApi';
import { NotificationDrawer } from '../notifications/NotificationDrawer';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Poll unread count every 30s if authenticated
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleDemoSwitch = async (key: keyof typeof DEMO_CREDENTIALS) => {
    setIsDemoMenuOpen(false);
    await switchDemoUser(key);
    // Navigate to role landing
    const cred = DEMO_CREDENTIALS[key];
    if (cred.role === 'CITIZEN') navigate('/citizen');
    else if (cred.role === 'OFFICER') navigate('/officer');
    else if (cred.role === 'DEPARTMENT_ADMIN') navigate('/dept-admin');
    else if (cred.role === 'SYSTEM_ADMIN') navigate('/sys-admin');
  };

  const role = user?.role;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/75 dark:bg-[#000000]/75 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#4395E7] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-lg sm:text-xl tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                      Civic<span className="text-[#0071E3] dark:text-[#4395E7]">Fix</span>
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 dark:text-[#4395E7]">
                      AI
                    </span>
                  </div>
                </div>
              </Link>

              {/* Navigation Links per role */}
              <nav className="hidden md:flex items-center space-x-1">
                {isAuthenticated ? (
                  <>
                    {role === 'CITIZEN' && (
                      <>
                        <Link
                          to="/citizen"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            location.pathname === '/citizen'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          My Issues
                        </Link>
                        <Link
                          to="/citizen/report"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/citizen/report'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#4395E7]" />
                          Report Issue
                        </Link>
                      </>
                    )}

                    {role === 'OFFICER' && (
                      <Link
                        to="/officer"
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          location.pathname === '/officer'
                            ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                            : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        Assigned Tasks
                      </Link>
                    )}

                    {role === 'DEPARTMENT_ADMIN' && (
                      <>
                        <Link
                          to="/dept-admin"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            location.pathname === '/dept-admin'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          Issues Board
                        </Link>
                        <Link
                          to="/dept-admin/analytics"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/dept-admin/analytics'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          Analytics
                        </Link>
                        <Link
                          to="/dept-admin/map"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/dept-admin/map'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Live Map
                        </Link>
                      </>
                    )}

                    {role === 'SYSTEM_ADMIN' && (
                      <>
                        <Link
                          to="/sys-admin"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            location.pathname === '/sys-admin'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          Overview
                        </Link>
                        <Link
                          to="/sys-admin/users"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/sys-admin/users'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          Users
                        </Link>
                        <Link
                          to="/sys-admin/kb"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/sys-admin/kb'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Knowledge Base
                        </Link>
                        <Link
                          to="/sys-admin/sla"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/sys-admin/sla'
                              ? 'text-[#0071E3] dark:text-[#4395E7] bg-black/5 dark:bg-white/10'
                              : 'text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <Settings className="w-3.5 h-3.5" />
                          SLA
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
                    >
                      Home
                    </Link>
                    <Link
                      to="/track"
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#1D1D1F]/70 dark:text-[#F5F5F7]/70 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
                    >
                      Track Issue
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Render Cloud Live Indicator */}
              <a
                href="https://civicfix-ai-nvap.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.03] dark:bg-white/[0.05] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all group"
                title="Live Render Cloud Backend"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
                <span className="text-[#86868B]">Cloud:</span>
                <span className="font-semibold text-[#0071E3] dark:text-[#4395E7]">Render</span>
              </a>

              {/* Demo Switcher Quick Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.03] dark:bg-white/[0.05] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] flex items-center gap-1.5 shadow-sm transition-all"
                  title="Switch between pre-seeded role personas"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span className="hidden sm:inline text-[#86868B]">Persona:</span>
                  <span className="font-semibold">{user ? user.role.replace('_', ' ') : 'Select'}</span>
                  <ChevronDown className="w-3 h-3 text-[#86868B]" />
                </button>

                {isDemoMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-2xl shadow-apple-float border border-black/[0.08] dark:border-white/[0.1] py-2 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setIsDemoMenuOpen(false)}
                  >
                    <div className="px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06] mb-1">
                      Switch Role Account
                    </div>
                    {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => handleDemoSwitch(key as keyof typeof DEMO_CREDENTIALS)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors ${
                          user?.email === item.email
                            ? 'font-semibold text-[#0071E3] dark:text-[#4395E7] bg-[#0071E3]/5 dark:bg-[#0071E3]/10'
                            : 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-[10px] text-[#86868B]">{item.email}</div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#86868B]">
                          {item.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Notifications Bell */}
              {isAuthenticated && (
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="p-2 relative rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-[#FF3B30] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User menu or Login */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0071E3] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                      {(user.fullName || user.email || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hidden sm:inline">
                      {user.fullName || user.email}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#86868B]" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-2xl shadow-apple-float border border-black/[0.08] dark:border-white/[0.1] py-2 z-50 animate-in fade-in zoom-in-95"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-black/[0.04] dark:border-white/[0.06]">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white">
                          {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 dark:text-[#4395E7]">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#FF3B30] hover:bg-[#FF3B30]/5 flex items-center gap-2 font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-full transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 text-xs font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-full shadow-sm transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
