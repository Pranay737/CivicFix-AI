import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { complaintsApi } from '../../api/complaintsApi';
import { ComplaintsOverviewMap } from '../../components/map/ComplaintsOverviewMap';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MapPin, Filter } from 'lucide-react';

export const DeptMapPage: React.FC = () => {
  const { user } = useAuth();
  const deptId = user?.departmentId || user?.department?.id;
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['dept-map-complaints', deptId],
    queryFn: () => complaintsApi.getAll(0, 100, { departmentId: deptId }),
    enabled: !!deptId,
  });

  const complaints = data?.content || [];

  const filtered = complaints.filter((c: any) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header with quick filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-primary-600" />
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              {user?.departmentName || user?.department?.name || 'Department'} Geographic Map
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Live Issue Hotspots & Locations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive OpenStreetMap plotting all open and investigated civic work orders.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Statuses ({complaints.length})</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REGISTERED">Registered</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
          <ComplaintsOverviewMap complaints={filtered} className="h-[620px]" />
        </div>
      )}
    </div>
  );
};
