import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { Complaint, ComplaintStatus } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: () => complaintsApi.getMyComplaints(0, 50),
  });

  const complaints = data?.content || [];

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (selectedStatus === 'ALL') return true;
    return c.status === selectedStatus;
  });

  // Calculate summary statistics
  const total = complaints.length;
  const inProgress = complaints.filter((c) =>
    ['REGISTERED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(c.status)
  ).length;
  const resolved = complaints.filter((c) =>
    ['RESOLVED', 'CLOSED'].includes(c.status)
  ).length;
  const needsAction = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Citizen Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track and monitor all your submitted civic reports and resolutions.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Reported</span>
            <FolderOpen className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{total}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{inProgress}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{resolved}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">Awaiting Verification</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200">{needsAction}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {['ALL', 'SUBMITTED', 'REGISTERED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === status
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {status === 'ALL' ? 'All Reports' : status.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Issues List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No complaints found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any civic issues matching this filter. Report a new issue to get started!
          </p>
          <Link
            to="/citizen/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold shadow-sm hover:bg-primary-700"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Issue
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/citizen/complaints/${item.id}`)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-primary-400 dark:hover:border-primary-600 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
                    #{item.trackingNumber}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                  <PriorityBadge priority={item.priority} size="sm" />
                  {item.department && (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                      {item.department.name}
                    </span>
                  )}
                  {item.status === 'RESOLVED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full animate-pulse">
                      Action Required: Verify
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  {item.address && (
                    <span className="flex items-center gap-1 truncate max-w-xs">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {item.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold group-hover:bg-primary-600 group-hover:text-white transition-all flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
