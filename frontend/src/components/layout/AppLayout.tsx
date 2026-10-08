import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { CivicAssistantWidget } from '../assistant/CivicAssistantWidget';
import { ShieldCheck, Heart } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-primary-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              CivicFix AI Platform
            </span>
            <span>&bull;</span>
            <span>AI-Driven Municipal Issue Resolution</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/track" className="hover:text-primary-600 transition-colors">
              Track Complaint
            </Link>
            <a
              href="/api/v1/swagger-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              Swagger OpenAPI
            </a>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Smart Cities
            </span>
          </div>
        </div>
      </footer>

      {/* RAG Assistant Widget available across views */}
      <CivicAssistantWidget />
    </div>
  );
};
