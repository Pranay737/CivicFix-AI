import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import {
  ShieldCheck,
  LogIn,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Role, User } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const navigateByRole = (userObj?: User | null) => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    const role = userObj?.role || JSON.parse(localStorage.getItem('civicfix_user') || '{}')?.role;
    if (role === 'CITIZEN') navigate('/citizen');
    else if (role === 'OFFICER') navigate('/officer');
    else if (role === 'DEPARTMENT_ADMIN') navigate('/dept-admin');
    else if (role === 'SYSTEM_ADMIN') navigate('/sys-admin');
    else navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    // Timeout safety net (12s max) to guarantee button never stays stuck
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setErrorMsg('Login timed out. Check that backend is running on http://localhost:8080.');
    }, 12000);

    try {
      const loggedUser = await login(email.trim(), password);
      clearTimeout(timeoutId);
      navigateByRole(loggedUser);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setErrorMsg('Server took too long to respond. Please verify http://localhost:8080 is online.');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMsg('Cannot reach CivicFix server. Ensure backend is running at http://localhost:8080.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setErrorMsg('Invalid email or password. Please check your credentials.');
      } else {
        setErrorMsg(
          err.response?.data?.message || 'Login failed. Please verify your credentials and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemo = async (roleKey: Role) => {
    const cred = DEMO_CREDENTIALS[roleKey];
    setEmail(cred.email);
    setPassword(cred.password);
    setErrorMsg('');
    setIsLoading(true);
    setActiveDemoRole(roleKey);

    try {
      const demoUser = await switchDemoUser(roleKey);
      navigateByRole(demoUser);
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setErrorMsg('Server timed out during demo login.');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMsg('Cannot reach backend on port 8080. Please ensure the backend is running.');
      } else {
        setErrorMsg(
          err.response?.data?.message || 'Could not authenticate demo user. Make sure backend is running.'
        );
      }
    } finally {
      setIsLoading(false);
      setActiveDemoRole(null);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16 px-4">
      <div className="bg-white/80 dark:bg-[#161618]/90 backdrop-blur-2xl rounded-[32px] shadow-apple-float border border-black/[0.08] dark:border-white/[0.08] p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0071E3] text-white mx-auto flex items-center justify-center shadow-md shadow-[#0071E3]/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Sign in to CivicFix
          </h2>
          <p className="text-xs text-[#86868B]">
            Access municipal telemetry & issue management console
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-xs text-[#FF3B30] flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-[#FF3B30]/70 hover:text-[#FF3B30] p-0.5 rounded-full hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#86868B] absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@civicfix.ai"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#86868B] absolute left-4 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-3.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Apple Cupertino Styled Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50"
          >
            {isLoading && !activeDemoRole ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
              </div>
            )}
          </button>
        </form>

        {/* Instant Demo Personas Dock */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
          <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#0071E3]" /> Single-Click Demo Login:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Citizen */}
            <button
              type="button"
              onClick={() => handleInstantDemo('CITIZEN')}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  Citizen
                </span>
                {activeDemoRole === 'CITIZEN' ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-[#86868B]/40 group-hover:text-[#0071E3]" />
                )}
              </div>
              <div className="text-[10px] text-[#86868B] font-mono mt-0.5">Jane Doe</div>
            </button>

            {/* Field Officer */}
            <button
              type="button"
              onClick={() => handleInstantDemo('OFFICER')}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  Field Officer
                </span>
                {activeDemoRole === 'OFFICER' ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-[#86868B]/40 group-hover:text-[#0071E3]" />
                )}
              </div>
              <div className="text-[10px] text-[#86868B] font-mono mt-0.5">Officer Smith</div>
            </button>

            {/* Dept Admin */}
            <button
              type="button"
              onClick={() => handleInstantDemo('DEPARTMENT_ADMIN')}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  Dept Admin
                </span>
                {activeDemoRole === 'DEPARTMENT_ADMIN' ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-[#86868B]/40 group-hover:text-[#0071E3]" />
                )}
              </div>
              <div className="text-[10px] text-[#86868B] font-mono mt-0.5">Roads Admin</div>
            </button>

            {/* System Admin */}
            <button
              type="button"
              onClick={() => handleInstantDemo('SYSTEM_ADMIN')}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  System Admin
                </span>
                {activeDemoRole === 'SYSTEM_ADMIN' ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-[#86868B]/40 group-hover:text-[#0071E3]" />
                )}
              </div>
              <div className="text-[10px] text-[#86868B] font-mono mt-0.5">Super Admin</div>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#86868B]">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[#0071E3] hover:underline">
            Register as Citizen
          </Link>
        </div>
      </div>
    </div>
  );
};
