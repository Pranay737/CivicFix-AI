import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analyticsApi';
import { DepartmentAnalytics } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  Users,
  Award,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#94a3b8',
  REGISTERED: '#64748b',
  ASSIGNED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
  CLOSED: '#059669',
  REOPENED: '#ef4444',
  REJECTED: '#6b7280',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748b',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
};

export const DeptAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const deptId = user?.departmentId || user?.department?.id;

  const { data: analytics, isLoading } = useQuery<DepartmentAnalytics>({
    queryKey: ['dept-analytics', deptId],
    queryFn: () => analyticsApi.getDepartmentAnalytics(deptId!),
    enabled: !!deptId,
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-16 text-center text-slate-500">
        No department analytics data available.
      </div>
    );
  }

  // Transform statusDistribution for PieChart
  const statusData = Object.entries(analytics.statusDistribution || {})
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.replace('_', ' '),
      value,
      color: STATUS_COLORS[key] || '#3b82f6',
    }));

  // Transform priorityDistribution for BarChart
  const priorityData = Object.entries(analytics.priorityDistribution || {}).map(([key, value]) => ({
    name: key,
    count: value,
    fill: PRIORITY_COLORS[key] || '#3b82f6',
  }));

  // Workload data
  const workloadData = (analytics.officerWorkload || []).map((o) => ({
    name: o.officerName.split(' ')[0],
    fullName: o.officerName,
    Pending: o.pendingCount ?? o.activeAssignments ?? 0,
    Resolved: o.resolvedCount ?? o.completedAssignments ?? 0,
  }));

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {analytics.departmentName} &bull; SLA & Operational Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time metrics, officer workload balancing, and citizen satisfaction ratings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">SLA Compliance Rate</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            {Math.round(analytics.slaComplianceRate)}
            <span className="text-sm font-semibold text-primary-600">%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                analytics.slaComplianceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, analytics.slaComplianceRate)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Avg Resolution Time</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            {analytics.averageResolutionHours.toFixed(1)}
            <span className="text-sm font-semibold text-slate-500">hrs</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Calculated on resolved tickets</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Citizen Satisfaction</span>
          <div className="text-3xl font-black text-amber-500 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>{analytics.averageRating ? analytics.averageRating.toFixed(1) : '5.0'}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {analytics.totalRatings} ratings submitted
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Overdue Breaches</span>
          <div
            className={`text-3xl font-black ${
              analytics.overdueComplaints > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {analytics.overdueComplaints}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {analytics.openComplaints} open work orders
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary-500" />
              Issue Lifecycle Distribution
            </h3>
            <span className="text-xs text-slate-400">{analytics.totalComplaints} total</span>
          </div>

          <div className="h-64">
            {statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No tickets reported yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Urgency & Priority Levels
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Officer Workload Distribution Bar Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600" />
            Field Officer Workload & Completion
          </h3>
          <span className="text-xs text-slate-400">
            {analytics.officerWorkload?.length || 0} active officers
          </span>
        </div>

        <div className="h-72">
          {workloadData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No officers assigned to this department yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
