import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { VerifyModal } from '../../components/complaints/VerifyModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Star,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const { data: complaint, isLoading, refetch } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintsApi.getById(Number(id)),
    enabled: !!id,
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
        <Link to="/citizen" className="text-primary-600 hover:underline text-sm font-semibold">
          &larr; Back to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Top back nav */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
              TRACKING #{complaint.trackingNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {complaint.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
            {complaint.isOverdue && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Overdue SLA
              </span>
            )}
          </div>
        </div>

        {/* Action Prompt for Citizen if status is RESOLVED */}
        {complaint.status === 'RESOLVED' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Officer Marked Issue As Resolved
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Please inspect the resolution details below and either accept or reopen this issue.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 whitespace-nowrap"
            >
              Verify Resolution Now &rarr;
            </button>
          </div>
        )}

        {/* Metadata info tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Department</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {complaint.department?.name || 'Pending assignment'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Category</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {complaint.category?.name || 'General Issue'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Assigned Officer</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {complaint.assignedOfficer
                ? `${complaint.assignedOfficer.firstName} ${complaint.assignedOfficer.lastName}`
                : 'Not assigned yet'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Date Filed</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {new Date(complaint.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, AI, Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Citizen Description
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>

            {complaint.address && (
              <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>{complaint.address}</span>
              </div>
            )}
          </div>

          {/* AI Intelligence Card */}
          {(complaint.aiSummary || complaint.isDuplicate) && (
            <div className="bg-gradient-to-br from-primary-50/70 to-indigo-50/50 dark:from-primary-950/30 dark:to-indigo-950/20 rounded-3xl p-6 border border-primary-200/80 dark:border-primary-800/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-bold text-primary-900 dark:text-primary-200 uppercase tracking-wider">
                    Gemini AI Triage Insights
                  </span>
                </div>
                {complaint.aiConfidence && (
                  <span className="text-[11px] font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-primary-300 text-primary-700 dark:text-primary-300">
                    {Math.round(complaint.aiConfidence * 100)}% Confidence
                  </span>
                )}
              </div>

              {complaint.aiSummary && (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {complaint.aiSummary}
                </p>
              )}

              {complaint.isDuplicate && (
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-300 dark:border-amber-800 text-xs flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Layers className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>
                    Potential duplicate of complaint{' '}
                    <span className="font-mono font-bold">
                      #{complaint.duplicateOfTrackingNumber || complaint.duplicateOfId}
                    </span>{' '}
                    ({Math.round((complaint.similarityScore || 0) * 100)}% vector similarity).
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Citizen Uploaded Photos */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                Submitted Photos ({complaint.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <img
                      src={img.imageUrl}
                      alt="Complaint attachment"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Evidence (If available) */}
          {complaint.resolution && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Field Resolution Work Completed</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  OFFICER RESOLUTION NOTES
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
                      RESOLUTION PROOF PHOTOS
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

          {/* Feedback & Rating (if exists) */}
          {complaint.feedback && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Citizen Rating & Verification
              </h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= complaint.feedback!.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                  {complaint.feedback.rating} / 5 Stars
                </span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Status Progression Audit Timeline */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              Activity Audit Timeline
            </h3>

            <ComplaintTimeline timeline={complaint.timeline || []} />
          </div>
        </div>
      </div>

      {/* Verify / Close Modal */}
      <VerifyModal
        complaint={complaint}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerified={() => refetch()}
      />
    </div>
  );
};
