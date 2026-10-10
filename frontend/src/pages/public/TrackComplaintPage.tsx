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
    <div className="max-w-3xl mx-auto py-8 sm:py-14 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium text-[#86868B]">
          <span>Real-time Telemetry</span>
          <span>&bull;</span>
          <span>Public Audit Record</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
          Track Municipal Grievance
        </h1>
        <p className="text-sm text-[#86868B] max-w-lg mx-auto leading-relaxed">
          Enter your unique incident identifier (e.g.{' '}
          <code className="bg-black/[0.05] dark:bg-white/[0.08] px-2 py-0.5 rounded-full font-mono text-[#0071E3] font-semibold text-xs">
            CFX-1001
          </code>
          ) to observe live investigation, dispatch telemetry, and photo verification.
        </p>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2 pt-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#86868B] absolute left-4 top-3.5" />
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. CFX-1001"
              className="w-full pl-11 pr-4 py-3 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#161618] text-sm font-mono text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] shadow-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !trackingNumber.trim()}
            className="px-6 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Search'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-xs text-[#FF3B30] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaint details card */}
      {complaint && (
        <div className="bg-white dark:bg-[#161618] rounded-[28px] shadow-apple-float border border-black/[0.08] dark:border-white/[0.08] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06] animate-in fade-in">
          {/* Top banner */}
          <div className="p-6 sm:p-7 bg-black/[0.02] dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-semibold text-[#0071E3] dark:text-[#4395E7] block mb-1">
                TRACKING #{complaint.trackingNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
                {complaint.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {/* Core metadata */}
          <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#86868B] mt-0.5" />
              <div>
                <span className="font-medium text-[#86868B] block">Responsible Department</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white mt-0.5 block">
                  {complaint.departmentName || complaint.department?.name || 'Pending assignment'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#86868B] mt-0.5" />
              <div>
                <span className="font-medium text-[#86868B] block">Reported Coordinates</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white mt-0.5 block">
                  {complaint.address || 'Geo-coordinates logged'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#86868B] mt-0.5" />
              <div>
                <span className="font-medium text-[#86868B] block">Initial Timestamp</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white mt-0.5 block">
                  {new Date(complaint.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-[#86868B] mt-0.5" />
              <div>
                <span className="font-medium text-[#86868B] block">Assigned Officer</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white mt-0.5 block">
                  {complaint.assignedOfficer
                    ? complaint.assignedOfficer.fullName ||
                      `${complaint.assignedOfficer.firstName || ''} ${complaint.assignedOfficer.lastName || ''}`.trim()
                    : 'Awaiting Crew Assignment'}
                </span>
              </div>
            </div>
          </div>

          {/* Description & AI Summary */}
          <div className="p-6 sm:p-7 space-y-4">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-1.5">
                Citizen Narrative
              </h3>
              <p className="text-sm text-[#1D1D1F] dark:text-slate-300 leading-relaxed font-normal">
                {complaint.description}
              </p>
            </div>

            {complaint.aiSummary && (
              <div className="p-4 rounded-2xl bg-[#0071E3]/5 dark:bg-[#0071E3]/10 border border-[#0071E3]/15 text-xs">
                <span className="font-semibold text-[#0071E3] dark:text-[#4395E7] block mb-1">
                  Gemini 1.5 Multi-Modal Triage Assessment
                </span>
                <p className="text-[#1D1D1F]/80 dark:text-slate-300 leading-relaxed">{complaint.aiSummary}</p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="p-6 sm:p-7">
            <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-4">
              Status Progression Timeline
            </h3>
            <ComplaintTimeline timeline={complaint.timeline || []} />
          </div>
        </div>
      )}
    </div>
  );
};
