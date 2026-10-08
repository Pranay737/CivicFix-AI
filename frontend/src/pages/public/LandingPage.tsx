import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  Bot,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Search,
  Users,
  Clock,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const handlePersonaLogin = async (key: keyof typeof DEMO_CREDENTIALS) => {
    await switchDemoUser(key);
    const cred = DEMO_CREDENTIALS[key];
    if (cred.role === 'CITIZEN') navigate('/citizen');
    else if (cred.role === 'OFFICER') navigate('/officer');
    else if (cred.role === 'DEPARTMENT_ADMIN') navigate('/dept-admin');
    else if (cred.role === 'SYSTEM_ADMIN') navigate('/sys-admin');
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-4">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span>Next-Gen Smart City Governance &bull; Google Gemini AI Powered</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Empowering Citizens with{' '}
          <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-500 bg-clip-text text-transparent">
            AI-Driven Civic Resolution
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Report civic issues instantly. Our AI automatically classifies urgency, identifies the responsible department, detects duplicates via pgvector, and tracks resolution SLAs end-to-end.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Link
              to={
                user?.role === 'CITIZEN'
                  ? '/citizen'
                  : user?.role === 'OFFICER'
                  ? '/officer'
                  : user?.role === 'DEPARTMENT_ADMIN'
                  ? '/dept-admin'
                  : '/sys-admin'
              }
              className="px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Go to Your {user?.role.replace('_', ' ')} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/track"
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Track Complaint Status</span>
              </Link>
            </>
          )}
        </div>

        {/* Demo Persona Quick Access Bar */}
        <div className="pt-8">
          <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>One-Click Demo Personas (Instant Login)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handlePersonaLogin('CITIZEN')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-primary-600">
                  Jane Citizen
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Citizen Role</div>
              </button>
              <button
                onClick={() => handlePersonaLogin('OFFICER')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-primary-600">
                  Officer Smith
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Field Officer</div>
              </button>
              <button
                onClick={() => handlePersonaLogin('DEPARTMENT_ADMIN')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-primary-600">
                  Roads Admin
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Dept Admin</div>
              </button>
              <button
                onClick={() => handlePersonaLogin('SYSTEM_ADMIN')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-primary-600">
                  System Admin
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Super Admin</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Instant AI Issue Triage
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multi-modal Gemini LLM analysis auto-classifies issue category, estimates urgency priority, and identifies the correct municipal department in seconds.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            pgvector Duplicate Detection
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            768-dimensional text embeddings matched with Haversine 200m spatial clustering prevents duplicate work orders and surfaces recurring problem hotspots.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Grounded RAG Civic Assistant
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Knowledge base retrieval answers citizen queries on city charters, disposal schedules, and bylaws strictly with source citations and live complaint tracking.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            SLA Governance & Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Automated escalation deadlines, officer workload balancing, resolution evidence verification, and real-time citizen satisfaction rating metrics.
          </p>
        </div>
      </section>

      {/* The 4-Step Civic Lifecycle */}
      <section className="bg-slate-100/50 dark:bg-slate-800/40 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Transparent Issue Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From initial report to photo verification, every step is verified and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 relative shadow-sm">
            <span className="text-2xl font-black text-primary-200 dark:text-primary-950 absolute top-3 right-4">
              01
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              1. Report & Triage
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Citizen reports with GPS pin and photo. Gemini AI parses urgency, maps category, and checks nearby duplicates.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 relative shadow-sm">
            <span className="text-2xl font-black text-indigo-200 dark:text-indigo-950 absolute top-3 right-4">
              02
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              2. Dept Auto-Route
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Routed to the relevant Department Admin, who reviews AI triage recommendations and assigns a field officer.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 relative shadow-sm">
            <span className="text-2xl font-black text-emerald-200 dark:text-emerald-950 absolute top-3 right-4">
              03
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              3. Field Resolution
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Field Officer executes repairs, records detailed resolution notes, and attaches photographic proof of completion.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 relative shadow-sm">
            <span className="text-2xl font-black text-amber-200 dark:text-amber-950 absolute top-3 right-4">
              04
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              4. Citizen Verification
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Citizen reviews evidence and confirms closure with 1–5 star rating, or reopens if dissatisfied.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
