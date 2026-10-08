import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { ShieldCheck, LogIn, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Wait for user state then navigate or redirect
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Will navigate based on stored user
        const stored = localStorage.getItem('civicfix_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.role === 'CITIZEN') navigate('/citizen');
          else if (u.role === 'OFFICER') navigate('/officer');
          else if (u.role === 'DEPARTMENT_ADMIN') navigate('/dept-admin');
          else if (u.role === 'SYSTEM_ADMIN') navigate('/sys-admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (key: keyof typeof DEMO_CREDENTIALS) => {
    const cred = DEMO_CREDENTIALS[key];
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-14">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white mx-auto flex items-center justify-center shadow-md shadow-primary-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Sign In to CivicFix</h2>
          <p className="text-xs text-slate-500">Access your civic dashboard & issue monitor</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-600/25 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Auto-fill Demo Accounts:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('CITIZEN')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Citizen</div>
              <div className="text-[10px] text-slate-400">citizen.jane</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('OFFICER')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Officer</div>
              <div className="text-[10px] text-slate-400">officer.smith</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('DEPARTMENT_ADMIN')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Dept Admin</div>
              <div className="text-[10px] text-slate-400">roads.admin</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('SYSTEM_ADMIN')}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">System Admin</div>
              <div className="text-[10px] text-slate-400">admin@civicfix</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Register as Citizen
          </Link>
        </div>
      </div>
    </div>
  );
};
