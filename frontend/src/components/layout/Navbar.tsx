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
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                      Civic<span className="text-primary-600 dark:text-primary-400">Fix</span>
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-1 hidden sm:block">
                    Smart Civic Resolution
                  </p>
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            location.pathname === '/citizen'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          My Issues
                        </Link>
                        <Link
                          to="/citizen/report"
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/citizen/report'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <PlusCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          Report Issue
                        </Link>
                      </>
                    )}

                    {role === 'OFFICER' && (
                      <Link
                        to="/officer"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === '/officer'
                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        Assigned Tasks
                      </Link>
                    )}

                    {role === 'DEPARTMENT_ADMIN' && (
                      <>
                        <Link
                          to="/dept-admin"
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            location.pathname === '/dept-admin'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          Issues Board
                        </Link>
                        <Link
                          to="/dept-admin/analytics"
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/dept-admin/analytics'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Analytics
                        </Link>
                        <Link
                          to="/dept-admin/map"
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/dept-admin/map'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                          Live Map
                        </Link>
                      </>
                    )}

                    {role === 'SYSTEM_ADMIN' && (
                      <>
                        <Link
                          to="/sys-admin"
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            location.pathname === '/sys-admin'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          Overview
                        </Link>
                        <Link
                          to="/sys-admin/users"
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/sys-admin/users'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          Users
                        </Link>
                        <Link
                          to="/sys-admin/kb"
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/sys-admin/kb'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          Knowledge Base
                        </Link>
                        <Link
                          to="/sys-admin/sla"
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                            location.pathname === '/sys-admin/sla'
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          SLA
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Home
                    </Link>
                    <Link
                      to="/track"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Track Issue
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Demo Switcher Quick Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1.5 shadow-sm transition-all"
                  title="Switch between pre-seeded role personas"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
                  <span className="hidden sm:inline">Demo Persona:</span>
                  <span className="font-bold">{user ? user.role.replace('_', ' ') : 'Select'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isDemoMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setIsDemoMenuOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                      Switch Role Account
                    </div>
                    {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => handleDemoSwitch(key as keyof typeof DEMO_CREDENTIALS)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ${
                          user?.email === item.email
                            ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-[10px] text-slate-400">{item.email}</div>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
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
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Notifications Bell */}
              {isAuthenticated && (
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="p-2 relative rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
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
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {(user.fullName || user.email || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
                      {user.fullName || user.email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-500/20 transition-all hover:scale-105"
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
