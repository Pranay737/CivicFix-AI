import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';
import { adminApi } from '../../api/adminApi';
import { SystemAnalytics } from '../../types';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ShieldAlert,
  Users,
  Building2,
  BookOpen,
  Settings,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  History,
} from 'lucide-react';

export const SysAdminDashboard: React.FC = () => {
  const { data: analytics, isLoading } = useQuery<SystemAnalytics>({
    queryKey: ['system-analytics'],
    queryFn: () => analyticsApi.getSystemAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              System Administrator Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            CivicFix AI Enterprise Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            System health, department performance, knowledge vectors, and administrative audit logs.
          </p>
        </div>

        {/* Quick Nav Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/sys-admin/users"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-primary-500" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/sys-admin/kb"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Knowledge Base (RAG)</span>
          </Link>
          <Link
            to="/sys-admin/sla"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-amber-500" />
            <span>SLA Policies</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Civic Issues</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.totalComplaints || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {analytics?.openComplaints || 0} open &bull; {analytics?.resolvedComplaints || 0} resolved
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Global SLA Compliance
          </span>
          <div className="text-3xl font-black text-emerald-600 flex items-baseline gap-1">
            {Math.round(analytics?.overallSlaComplianceRate || 100)}
            <span className="text-sm font-semibold">%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {analytics?.totalOverdue || 0} overdue breaches
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Registered Citizens</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.totalCitizens || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {analytics?.totalOfficers || 0} field officers
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Active Departments</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.totalDepartments || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Full jurisdiction coverage</span>
        </div>
      </div>

      {/* Department SLA & Workload Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary-500" />
          Department Breakdown & SLA Performance
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Department</th>
                <th className="pb-3">Complaints</th>
                <th className="pb-3">SLA Compliance</th>
                <th className="pb-3">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {analytics?.departmentMetrics.map((dept) => (
                <tr key={dept.departmentId} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="py-3.5 pl-2 font-bold text-slate-900 dark:text-white">
                    {dept.departmentName}
                  </td>
                  <td className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {dept.complaintCount}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
                        dept.slaCompliance >= 85
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {Math.round(dept.slaCompliance)}%
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-amber-500">
                    {dept.avgRating ? `★ ${dept.avgRating.toFixed(1)}` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-primary-500" />
            Security & Administration Audit Trail
          </h3>
          <span className="text-xs text-slate-400">Real-time log events</span>
        </div>

        <div className="space-y-2">
          {analytics?.recentAuditLogs?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No audit logs recorded.</div>
          ) : (
            analytics?.recentAuditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {log.entityType} #{log.entityId || '-'}
                  </span>
                  <span className="text-slate-500 text-[11px]">{log.details}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                  <span>{log.userEmail}</span>
                  <span>&bull;</span>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
