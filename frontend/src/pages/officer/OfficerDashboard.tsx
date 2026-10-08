import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { Complaint } from '../../types';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['officer-assigned'],
    queryFn: () => complaintsApi.getAssignedToMe(0, 50),
  });

  const complaints: Complaint[] = data?.content || [];

  const filtered = complaints.filter((c: Complaint) => {
    if (selectedStatus === 'ALL') return true;
    return c.status === selectedStatus;
  });

  const total = complaints.length;
  const assigned = complaints.filter((c: Complaint) => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter((c: Complaint) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c: Complaint) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Field Officer Worklist
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your assigned field inspections, update progress, and submit verified resolutions.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Assigned</span>
            <ClipboardList className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{total}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">Pending Inspection</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200">{assigned}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 shadow-sm">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-blue-900 dark:text-blue-200">{inProgress}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{resolved}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === status
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {status === 'ALL' ? 'All Assigned' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Worklist List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No complaints in this queue
          </h3>
          <p className="text-xs text-slate-500">
            Great job! You have no pending action items under this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/officer/complaints/${item.id}`)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-primary-400 dark:hover:border-primary-600 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
                    #{item.trackingNumber}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                  <PriorityBadge priority={item.priority} size="sm" />
                  {item.isOverdue && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-300">
                      SLA Overdue
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
                    Due:{' '}
                    {item.slaDueAt ? new Date(item.slaDueAt).toLocaleString() : 'Standard'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold group-hover:bg-primary-700 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Investigate</span>
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
