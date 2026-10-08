import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { complaintsApi } from '../../api/complaintsApi';
import { Complaint } from '../../types';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { AssignModal } from '../../components/complaints/AssignModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Building2,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  MapPin,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const DeptAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);

  const deptId = user?.departmentId || user?.department?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dept-complaints', deptId],
    queryFn: () => complaintsApi.getAll(0, 50, { departmentId: deptId }),
    enabled: !!deptId,
  });

  const complaints: Complaint[] = data?.content || [];

  const filtered = complaints.filter((c: Complaint) => {
    if (selectedStatus === 'ALL') return true;
    if (selectedStatus === 'OVERDUE') return c.isOverdue;
    if (selectedStatus === 'DUPLICATES') return c.isDuplicate;
    return c.status === selectedStatus;
  });

  const total = complaints.length;
  const unassigned = complaints.filter(
    (c: Complaint) => ['SUBMITTED', 'REGISTERED'].includes(c.status) || !c.assignedOfficer
  ).length;
  const overdueCount = complaints.filter((c: Complaint) => c.isOverdue).length;
  const duplicatesCount = complaints.filter((c: Complaint) => c.isDuplicate).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-primary-600" />
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              {user?.departmentName || user?.department?.name || 'Department'} Operations Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Department Triage & Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review incoming AI-triaged issues, dispatch field officers, and monitor SLA timelines.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Department Issues</span>
            <Building2 className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{total}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">Pending Officer Assignment</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200">{unassigned}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold">Breached / Overdue SLA</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-200">{overdueCount}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 shadow-sm">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-2">
            <span className="text-xs font-semibold">Flagged Duplicates (pgvector)</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200">
            {duplicatesCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'ALL', label: 'All Issues' },
          { key: 'REGISTERED', label: 'Registered / Needs Assignment' },
          { key: 'ASSIGNED', label: 'Assigned' },
          { key: 'IN_PROGRESS', label: 'In Progress' },
          { key: 'RESOLVED', label: 'Resolved' },
          { key: 'OVERDUE', label: '⚠️ SLA Overdue' },
          { key: 'DUPLICATES', label: '📑 Duplicates' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Issues Table / List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Queue is clear
          </h3>
          <p className="text-xs text-slate-500">
            No complaints matching filter criteria in this department.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
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

                  {item.isDuplicate && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-300 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Duplicate of #{item.duplicateOfTrackingNumber || item.duplicateOfId}
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => navigate(`/citizen/complaints/${item.id}`)}
                  className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-primary-600 cursor-pointer transition-colors"
                >
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
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    Officer:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.assignedOfficer
                        ? `${item.assignedOfficer.firstName} ${item.assignedOfficer.lastName}`
                        : 'Unassigned'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setAssigningComplaint(item)}
                  className="px-3.5 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/60 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{item.assignedOfficer ? 'Reassign' : 'Assign Officer'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/citizen/complaints/${item.id}`)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="View full audit details"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assigningComplaint && (
        <AssignModal
          complaint={assigningComplaint}
          isOpen={!!assigningComplaint}
          onClose={() => setAssigningComplaint(null)}
          onAssigned={() => refetch()}
        />
      )}
    </div>
  );
};
