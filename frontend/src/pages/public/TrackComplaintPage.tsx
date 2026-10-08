import React, { useState } from 'react';
import { complaintsApi } from '../../api/complaintsApi';
import { Complaint } from '../../types';
import { Search, ShieldAlert, Clock, MapPin, Building2, User, FileText } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const TrackComplaintPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = trackingNumber.trim().replace(/^#/, '');
    if (!cleanNum) return;

    setIsLoading(true);
    setErrorMsg('');
    setComplaint(null);

    try {
      const data = await complaintsApi.track(cleanNum);
      setComplaint(data);
    } catch (err: any) {
      setErrorMsg(
        err.response?.status === 404
          ? `No civic issue found with tracking code #${cleanNum}.`
          : 'Unable to retrieve complaint. Please check the code and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Public Issue Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Enter your unique complaint tracking number (e.g.{' '}
          <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-primary-600 font-bold">
            CFX-1001
          </code>
          ) to view real-time investigation and repair progress.
        </p>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. CFX-1001"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !trackingNumber.trim()}
            className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Search'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaint details card */}
      {complaint && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60 animate-in fade-in">
          {/* Top banner */}
          <div className="p-6 bg-slate-50/70 dark:bg-slate-800/70 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 block mb-1">
                TRACKING #{complaint.trackingNumber}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {complaint.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {/* Core metadata */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 block">Department</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {complaint.departmentName || complaint.department?.name || 'Pending assignment'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 block">Reported Location</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {complaint.address || 'Geo-coordinates logged'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 block">Date Reported</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {new Date(complaint.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 block">Assigned Officer</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {complaint.assignedOfficer
                    ? complaint.assignedOfficer.fullName ||
                      `${complaint.assignedOfficer.firstName || ''} ${complaint.assignedOfficer.lastName || ''}`.trim()
                    : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Description & AI Summary */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Citizen Issue Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {complaint.aiSummary && (
              <div className="p-3.5 rounded-2xl bg-primary-50/60 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/60 text-xs">
                <span className="font-bold text-primary-700 dark:text-primary-300 block mb-1">
                  AI Triage Analysis
                </span>
                <p className="text-slate-600 dark:text-slate-300">{complaint.aiSummary}</p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Status Progression Timeline
            </h3>
            <ComplaintTimeline timeline={complaint.timeline || []} />
          </div>
        </div>
      )}
    </div>
  );
};
