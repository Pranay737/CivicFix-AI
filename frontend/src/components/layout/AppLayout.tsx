import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { CivicAssistantWidget } from '../assistant/CivicAssistantWidget';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#070709] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors antialiased">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Outlet />
      </main>

      {/* Apple-Style Directory Footer */}
      <footer className="mt-auto border-t border-black/[0.08] dark:border-white/[0.08] bg-[#F5F5F7]/80 dark:bg-[#070709]/80 backdrop-blur-md pt-12 pb-8 text-xs text-[#86868B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Multi-Column Directory */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
                Municipal Services
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <Link to="/citizen/report" className="hover:text-[#0071E3] transition-colors">
                    Report Incident
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-[#0071E3] transition-colors">
                    Track Complaint Status
                  </Link>
                </li>
                <li>
                  <Link to="/citizen" className="hover:text-[#0071E3] transition-colors">
                    Citizen Activity Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
                Operations & Teams
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <Link to="/officer" className="hover:text-[#0071E3] transition-colors">
                    Field Officer Console
                  </Link>
                </li>
                <li>
                  <Link to="/dept-admin" className="hover:text-[#0071E3] transition-colors">
                    Department Kanban Board
                  </Link>
                </li>
                <li>
                  <Link to="/dept-admin/analytics" className="hover:text-[#0071E3] transition-colors">
                    Resolution Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
                AI & Neural Stack
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <span className="text-[#86868B]">Gemini 1.5 Flash Vision Triage</span>
                </li>
                <li>
                  <span className="text-[#86868B]">pgvector 768-D Spatial Radar</span>
                </li>
                <li>
                  <span className="text-[#86868B]">Grounded RAG Charter Engine</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
                Platform & Standards
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <a
                    href="https://civicfix-ai-nvap.onrender.com/swagger-ui/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0071E3] transition-colors flex items-center gap-1"
                  >
                    <span>OpenAPI 3.0 Specs</span>
                    <span className="text-[9px] font-mono opacity-60">&#8599;</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://civicfix-ai-nvap.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0071E3] transition-colors flex items-center gap-1"
                  >
                    <span>Render Cloud API</span>
                    <span className="text-[9px] font-mono opacity-60">&#8599;</span>
                  </a>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
                    Render Grid Operational
                  </span>
                </li>
                <li>
                  <span className="text-[#86868B]">SLA Compliance: 99.4%</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Hairline Row */}
          <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
              <span className="font-medium text-[#1D1D1F] dark:text-white">CivicFix AI</span>
              <span>&bull;</span>
              <a
                href="https://civicfix-ai-nvap.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0071E3] transition-colors"
              >
                Render Cloud: civicfix-ai-nvap.onrender.com
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <span>Copyright &copy; 2026 CivicFix AI Inc. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* RAG Assistant Widget available across views */}
      <CivicAssistantWidget />
    </div>
  );
};
