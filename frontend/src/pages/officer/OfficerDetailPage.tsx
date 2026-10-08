import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { ResolveModal } from '../../components/complaints/ResolveModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Play,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Image as ImageIcon,
} from 'lucide-react';

export const OfficerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: complaint, isLoading, refetch } = useQuery({
    queryKey: ['officer-complaint', id],
    queryFn: () => complaintsApi.getById(Number(id)),
    enabled: !!id,
  });

  // Start progress mutation
  const startProgressMutation = useMutation({
    mutationFn: () =>
      complaintsApi.updateStatus(
        Number(id),
        'IN_PROGRESS',
        'Officer initiated on-site field investigation.'
      ),
    onSuccess: () => refetch(),
    onError: (err: any) =>
      setActionError(err.response?.data?.message || 'Failed to update status'),
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Complaint Not Found</h2>
        <button
          onClick={() => navigate('/officer')}
          className="text-primary-600 hover:underline text-sm font-semibold"
        >
          &larr; Back to My Assigned Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/officer')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Worklist</span>
      </button>

      {/* Action Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
              TASK #{complaint.trackingNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {complaint.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {actionError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Operational Action Bar for Officers */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {complaint.status === 'ASSIGNED' && (
              <span>Field work is pending. Click below to begin investigation.</span>
            )}
            {complaint.status === 'IN_PROGRESS' && (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                Investigation actively in progress. Complete work and submit proof.
              </span>
            )}
            {complaint.status === 'REOPENED' && (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Citizen reopened this issue. Additional resolution is required.
              </span>
            )}
            {['RESOLVED', 'CLOSED'].includes(complaint.status) && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Resolution submitted and filed.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {complaint.status === 'ASSIGNED' && (
              <button
                onClick={() => startProgressMutation.mutate()}
                disabled={startProgressMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {startProgressMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Start Field Investigation</span>
              </button>
            )}

            {['IN_PROGRESS', 'REOPENED'].includes(complaint.status) && (
              <button
                onClick={() => setIsResolveModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Resolution & Proof</span>
              </button>
            )}
          </div>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Citizen Reporter</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {complaint.citizenName ||
                (complaint.citizen
                  ? `${complaint.citizen.firstName} ${complaint.citizen.lastName}`
                  : 'Anonymous')}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Location</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {complaint.address || 'GPS Coordinates'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">SLA Target Due</span>
            <span
              className={`font-semibold ${
                complaint.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {complaint.slaDueAt ? new Date(complaint.slaDueAt).toLocaleString() : 'Standard'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Assigned Time</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {new Date(complaint.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reported Issue Details
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* AI Triage Card */}
          {complaint.aiSummary && (
            <div className="bg-primary-50/60 dark:bg-primary-950/30 rounded-3xl p-6 border border-primary-200 dark:border-primary-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-bold text-primary-900 dark:text-primary-200 uppercase tracking-wide">
                  AI Triage Summary
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {complaint.aiSummary}
              </p>
            </div>
          )}

          {/* Citizen Photos */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                Citizen Uploaded Photos ({complaint.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group"
                  >
                    <img
                      src={img.imageUrl}
                      alt="Citizen issue photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Submitted Resolution */}
          {complaint.resolution && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Submitted Field Resolution Details</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  OFFICER NOTES
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  {complaint.resolution.notes}
                </p>
              </div>

              {(() => {
                const evidenceList = complaint.resolution.evidenceImages
                  ? complaint.resolution.evidenceImages.map((e: any) => (typeof e === 'string' ? e : e.imageUrl))
                  : complaint.resolution.evidenceImagesJson
                  ? JSON.parse(complaint.resolution.evidenceImagesJson || '[]')
                  : [];
                if (evidenceList.length === 0) return null;
                return (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                      EVIDENCE PHOTOS
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {evidenceList.map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-video rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 block group"
                        >
                          <img
                            src={url}
                            alt="Resolution Evidence"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right 1 Col: Audit timeline */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              Audit Timeline
            </h3>

            <ComplaintTimeline timeline={complaint.timeline || []} />
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <ResolveModal
        complaint={complaint}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onResolved={() => refetch()}
      />
    </div>
  );
};
