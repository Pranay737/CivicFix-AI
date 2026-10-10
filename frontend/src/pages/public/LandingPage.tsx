import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import {
  Sparkles,
  MapPin,
  Bot,
  ArrowRight,
  Search,
  Clock,
  Layers,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Eye,
  Camera,
  Activity,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'sla'>('overview');

  const handlePersonaLogin = async (key: keyof typeof DEMO_CREDENTIALS) => {
    await switchDemoUser(key);
    const cred = DEMO_CREDENTIALS[key];
    if (cred.role === 'CITIZEN') navigate('/citizen');
    else if (cred.role === 'OFFICER') navigate('/officer');
    else if (cred.role === 'DEPARTMENT_ADMIN') navigate('/dept-admin');
    else if (cred.role === 'SYSTEM_ADMIN') navigate('/sys-admin');
  };

  return (
    <div className="space-y-20 sm:space-y-32 py-4">
      {/* 1. Apple-Style Hero Header */}
      <section className="relative text-center max-w-4xl mx-auto space-y-7 pt-8 sm:pt-16">
        {/* Introducer Pill */}
        <a
          href="https://civicfix-ai-nvap.onrender.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all group"
          title="Open Live Render Cloud Deployment"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
          <span>Introducing CivicFix 2.0</span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-[#0071E3] dark:text-[#4395E7] font-semibold group-hover:underline flex items-center gap-1">
            Live on Render Cloud
            <span className="text-[10px] opacity-70">&#8599;</span>
          </span>
        </a>

        {/* Display Typography with Negative Tracking */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.035em] text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
          Civic grievances. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] via-[#4395E7] to-[#0071E3]">
            Resolved with extraordinary precision.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-[#86868B] dark:text-[#A1A1A6] max-w-2xl mx-auto font-normal leading-relaxed tracking-tight">
          Report municipal disruptions in seconds. Multi-modal vision intelligence, spatial deduplication, and automated municipal dispatch — engineering an unblemished public commons.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
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
              className="px-7 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>Go to Your {user?.role.replace('_', ' ')} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/track"
                className="px-7 py-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-sm border border-black/[0.08] dark:border-white/[0.12] backdrop-blur-md transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-[#86868B]" />
                <span>Track Complaint Status</span>
              </Link>
            </>
          )}
        </div>

        {/* Demo Persona Dock */}
        <div className="pt-6">
          <div className="frosted-sheet p-3.5 sm:p-4 rounded-3xl max-w-xl mx-auto shadow-apple-float">
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#0071E3]" />
                Instant Demo Personas
              </span>
              <span className="text-[10px] text-[#86868B]">Single-Click Authentication</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handlePersonaLogin('CITIZEN')}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#1C1C1E]/80 hover:bg-white dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  Jane Citizen
                </div>
                <div className="text-[10px] text-[#86868B] font-mono">Resident</div>
              </button>
              <button
                onClick={() => handlePersonaLogin('OFFICER')}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#1C1C1E]/80 hover:bg-white dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  Officer Smith
                </div>
                <div className="text-[10px] text-[#86868B] font-mono">Field Crew</div>
              </button>
              <button
                onClick={() => handlePersonaLogin('DEPARTMENT_ADMIN')}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#1C1C1E]/80 hover:bg-white dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  Roads Admin
                </div>
                <div className="text-[10px] text-[#86868B] font-mono">Dept Admin</div>
              </button>
              <button
                onClick={() => handlePersonaLogin('SYSTEM_ADMIN')}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#1C1C1E]/80 hover:bg-white dark:hover:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3]">
                  System Admin
                </div>
                <div className="text-[10px] text-[#86868B] font-mono">Super Admin</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Flagship Incident Showcase Card (The "Apple Product Showcase") */}
      <section className="max-w-5xl mx-auto">
        <div className="relative rounded-[32px] overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#161618] shadow-apple-float">
          {/* Top Glass Control Bar */}
          <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
              <span className="text-xs font-mono font-semibold tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7] uppercase">
                Live Incident Telemetry &bull; Unit 04
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 dark:text-[#4395E7]">
                CFX-1049
              </span>
            </div>
            {/* Interactive Mode Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  activeTab === 'telemetry'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                AI Diagnostics
              </button>
              <button
                onClick={() => setActiveTab('sla')}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  activeTab === 'sla'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                SLA Radar
              </button>
            </div>
          </div>

          {/* Main Visual & Diagnostics Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Left 7 Cols: Photography & Live HUD */}
            <div className="lg:col-span-7 relative bg-slate-900 overflow-hidden flex flex-col justify-end p-6 sm:p-8 min-h-[300px]">
              <img
                src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1400&q=80"
                alt="Asphalt Roadway Hazard"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              {/* Floating Camera & Telemetry HUD */}
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="frosted-pill px-3 py-1 rounded-full text-xs font-mono text-white/90 bg-black/60 border border-white/20 flex items-center gap-1.5 backdrop-blur-md">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>37.7749° N, 122.4194° W</span>
                  </div>
                  <div className="frosted-pill px-3 py-1 rounded-full text-xs font-mono text-white/90 bg-black/60 border border-white/20 flex items-center gap-1.5 backdrop-blur-md">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Optical Sensor: High-Def</span>
                  </div>
                </div>

                <div className="frosted-sheet p-4 rounded-2xl bg-white/10 dark:bg-black/60 border border-white/15 backdrop-blur-xl text-white space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/90 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#4395E7]" />
                      Gemini 1.5 Flash Vision Triage
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">99.8% Confidence</span>
                  </div>
                  <div className="text-sm font-semibold tracking-tight text-white">
                    Deep Asphalt Fissure / Structural Roadway Pothole
                  </div>
                  <div className="text-xs text-white/70">
                    Auto-classified as Critical Severity &bull; Auto-routed to Public Works in 1.4s
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Precision Dispatch Stepper & Telemetry */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-[#161618] space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-mono font-medium text-[#86868B] uppercase tracking-wider mb-1">
                      Incident Summary
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                      Market & 5th St Roadway Repair
                    </h3>
                    <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                      Assigned to Municipal Roads Maintenance Squad Alpha. Heavy repair truck dispatched.
                    </p>
                  </div>

                  {/* Dispatch Telemetry Stepper */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white">
                      Resolution Lifecycle
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <span className="font-semibold text-[#1D1D1F] dark:text-white">
                            Citizen Jane Reported
                          </span>
                          <span className="text-[#86868B] block text-[11px]">10:14:00 AM • Verified Pin</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <span className="font-semibold text-[#1D1D1F] dark:text-white">
                            AI Triage & Deduplication
                          </span>
                          <span className="text-[#86868B] block text-[11px]">
                            10:14:01 AM • pgvector 0 duplicates
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0071E3]/5 dark:bg-[#0071E3]/10 border border-[#0071E3]/20">
                        <Activity className="w-4 h-4 text-[#0071E3] mt-0.5 flex-shrink-0 animate-pulse-subtle" />
                        <div className="text-xs">
                          <span className="font-semibold text-[#0071E3] dark:text-[#4395E7]">
                            Field Crew Dispatched
                          </span>
                          <span className="text-[#86868B] block text-[11px]">
                            Officer Smith • En route (ETA 12m)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'telemetry' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <div className="text-xs font-mono font-medium text-[#86868B] uppercase tracking-wider mb-1">
                      Neural Diagnostics
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                      Semantic & Spatial Radar
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                      <span className="text-[#86868B]">Vector Embedding</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">768-D text-embedding-004</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                      <span className="text-[#86868B]">Cosine Similarity</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">0.942 (Unique)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                      <span className="text-[#86868B]">Spatial Cluster (200m)</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">0 Existing Pins</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#86868B]">Routing Latency</span>
                      <span className="font-semibold text-[#0071E3]">412 ms</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sla' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <div className="text-xs font-mono font-medium text-[#86868B] uppercase tracking-wider mb-1">
                      Service Guarantee
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                      24-Hour Municipal SLA
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#86868B]">Remaining Time</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        18h 24m Remaining
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 w-[76%]" />
                    </div>
                    <p className="text-[11px] text-[#86868B] leading-relaxed">
                      Auto-escalation to Division Director if unresolved in 24 hours. Current trajectory: On Schedule.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Quick Action */}
              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <Link
                  to="/track"
                  className="text-xs font-medium text-[#0071E3] hover:text-[#0077ED] flex items-center gap-1 group"
                >
                  <span>Track this live incident in full view</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <span className="text-[10px] text-[#86868B] font-mono">Status: IN_PROGRESS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid of Core Innovations ("Pro Capabilities") */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
            Engineered for municipal clarity.
          </h2>
          <p className="text-sm sm:text-base text-[#86868B] font-normal leading-relaxed">
            Every layer of CivicFix is designed to eliminate bureaucracy, prevent duplicate tickets, and empower field teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Bento Card 1 */}
          <div className="p-7 rounded-[28px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-apple-card hover:shadow-apple-float transition-all space-y-4 group">
            <div className="w-11 h-11 rounded-2xl bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-white text-base tracking-tight">
              Multi-Modal Vision Triage
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Google Gemini 1.5 Flash analyzes citizen damage photos, calculates urgency scores, and routes directly to the correct department within milliseconds.
            </p>
          </div>

          {/* Bento Card 2 */}
          <div className="p-7 rounded-[28px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-apple-card hover:shadow-apple-float transition-all space-y-4 group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-white text-base tracking-tight">
              768-D Spatial Radar
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              pgvector neural embeddings matched with 200m Haversine spatial clustering instantly catch duplicate submissions before crew roll-outs.
            </p>
          </div>

          {/* Bento Card 3 */}
          <div className="p-7 rounded-[28px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-apple-card hover:shadow-apple-float transition-all space-y-4 group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-white text-base tracking-tight">
              Grounded Civic RAG
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Retrieval-augmented knowledge engine answers queries on municipal bylaws, waste collection schedules, and permits with strict municipal charter citations.
            </p>
          </div>

          {/* Bento Card 4 */}
          <div className="p-7 rounded-[28px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-apple-card hover:shadow-apple-float transition-all space-y-4 group">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-white text-base tracking-tight">
              Verified Proof of Fix
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Field officers must upload high-resolution photographic proof of completion. Citizens verify the outcome with 1–5 star ratings or instant reopen.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Apple Numbers / Metric Counters */}
      <section className="max-w-6xl mx-auto border-y border-black/[0.08] dark:border-white/[0.08] py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
              99.4<span className="text-[#0071E3]">%</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#86868B]">
              Triage Classification Precision
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
              &lt; 24<span className="text-[#0071E3]">h</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#86868B]">
              Average SLA Turnaround
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
              14,800<span className="text-[#0071E3]">+</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#86868B]">
              Incidents Resolved to Date
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
              98.2<span className="text-[#0071E3]">%</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#86868B]">
              Citizen Satisfaction Rating
            </div>
          </div>
        </div>
      </section>

      {/* 5. The 4-Step Civic Lifecycle */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Transparent Issue Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B]">
            From initial report to photo verification, every step is verified and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] relative shadow-apple-card space-y-2">
            <span className="text-3xl font-bold text-black/[0.06] dark:text-white/[0.06] absolute top-4 right-5 font-mono">
              01
            </span>
            <div className="font-semibold text-[#1D1D1F] dark:text-white text-sm">
              1. Report & Triage
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Citizen reports with GPS pin and photo. Gemini AI parses urgency, maps category, and checks nearby duplicates.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] relative shadow-apple-card space-y-2">
            <span className="text-3xl font-bold text-black/[0.06] dark:text-white/[0.06] absolute top-4 right-5 font-mono">
              02
            </span>
            <div className="font-semibold text-[#1D1D1F] dark:text-white text-sm">
              2. Dept Auto-Route
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Routed to the relevant Department Admin, who reviews AI triage recommendations and assigns a field officer.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] relative shadow-apple-card space-y-2">
            <span className="text-3xl font-bold text-black/[0.06] dark:text-white/[0.06] absolute top-4 right-5 font-mono">
              03
            </span>
            <div className="font-semibold text-[#1D1D1F] dark:text-white text-sm">
              3. Field Resolution
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Field Officer executes repairs, records detailed resolution notes, and attaches photographic proof of completion.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] relative shadow-apple-card space-y-2">
            <span className="text-3xl font-bold text-black/[0.06] dark:text-white/[0.06] absolute top-4 right-5 font-mono">
              04
            </span>
            <div className="font-semibold text-[#1D1D1F] dark:text-white text-sm">
              4. Citizen Verification
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Citizen reviews evidence and confirms closure with 1–5 star rating, or reopens if dissatisfied.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
