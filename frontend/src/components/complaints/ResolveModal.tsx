import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { Complaint } from '../../types';
import { X, CheckCircle2, UploadCloud, Trash2, ShieldAlert } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ResolveModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onResolved,
}) => {
  const [notes, setNotes] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resolveMutation = useMutation({
    mutationFn: () => {
      if (!notes.trim()) throw new Error('Resolution notes are required.');
      return complaintsApi.resolve(complaint.id, notes.trim(), evidenceUrls);
    },
    onSuccess: () => {
      onResolved();
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit resolution');
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidenceUrls.length + files.length > 5) {
      alert('Maximum 5 evidence images allowed.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5 MB limit.`);
        }
        const res = await complaintsApi.uploadImage(file);
        setEvidenceUrls((prev) => [...prev, res.fileUrl]);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Submit Resolution
              </h3>
              <p className="text-xs text-slate-500 font-mono">#{complaint.trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resolveMutation.mutate();
          }}
          className="p-6 space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Issue Under Investigation
            </label>
            <div className="text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              {complaint.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Resolution Notes / Actions Undertaken <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              required
              placeholder="Detail the remedial actions taken (e.g. Asphault hot-mix laid over pothole, compacted and leveled for vehicular safety)."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Resolution Proof & Photographic Evidence (Max 5)
            </label>

            {/* Thumbnail preview */}
            {evidenceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-3">
                {evidenceUrls.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group">
                    <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {evidenceUrls.length < 5 && (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900/40 hover:bg-emerald-50/30 transition-all">
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-1" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {isUploading ? 'Uploading proof image...' : 'Click or drop resolution photo'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG or WEBP (Max 5MB each)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Footer buttons */}
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
              disabled={!notes.trim() || resolveMutation.isPending || isUploading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              {resolveMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
