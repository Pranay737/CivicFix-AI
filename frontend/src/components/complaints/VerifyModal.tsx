import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { Complaint } from '../../types';
import { X, CheckCircle, RotateCcw, Star, ShieldAlert } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface VerifyModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onVerified,
}) => {
  const [decision, setDecision] = useState<'ACCEPT' | 'REOPEN'>('ACCEPT');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const verifyMutation = useMutation({
    mutationFn: () => {
      const isAccepted = decision === 'ACCEPT';
      return complaintsApi.verify(
        complaint.id,
        isAccepted,
        comment.trim() || (isAccepted ? 'Citizen confirmed resolution.' : 'Citizen reopened issue.'),
        isAccepted ? rating : undefined
      );
    },
    onSuccess: () => {
      onVerified();
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Verification update failed');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Verify Civic Resolution
            </h3>
            <p className="text-xs text-slate-500 font-mono">#{complaint.trackingNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyMutation.mutate();
          }}
          className="p-6 space-y-5"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Decision selection pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Was the civic issue resolved to your satisfaction?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('ACCEPT')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  decision === 'ACCEPT'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${decision === 'ACCEPT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Accept & Close</div>
                  <div className="text-[10px] text-slate-500">Issue was fixed</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REOPEN')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  decision === 'REOPEN'
                    ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${decision === 'REOPEN' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Reopen Issue</div>
                  <div className="text-[10px] text-slate-500">Still needs work</div>
                </div>
              </button>
            </div>
          </div>

          {/* Rating Section (only if accepting) */}
          {decision === 'ACCEPT' && (
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2 text-center animate-in fade-in">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Rate the resolution quality (1 to 5 Stars)
              </label>
              <div className="flex justify-center items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                {rating === 5 && '🌟 Excellent work!'}
                {rating === 4 && '👍 Great resolution!'}
                {rating === 3 && '👌 Satisfactory fix.'}
                {rating === 2 && '😕 Below expectations.'}
                {rating === 1 && '⚠️ Poor resolution.'}
              </p>
            </div>
          )}

          {/* Comment text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {decision === 'ACCEPT' ? 'Feedback Notes (Optional)' : 'Reason for Reopening *'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={decision === 'REOPEN'}
              rows={3}
              placeholder={
                decision === 'ACCEPT'
                  ? 'Thank you for repairing the light promptly!'
                  : 'The debris was pushed aside onto the footpath instead of being removed.'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifyMutation.isPending || (decision === 'REOPEN' && !comment.trim())}
              className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 ${
                decision === 'ACCEPT'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {verifyMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : decision === 'ACCEPT' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Close Issue</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Reopen Issue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
