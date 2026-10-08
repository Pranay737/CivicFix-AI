import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { complaintsApi } from '../../api/complaintsApi';
import { User, Complaint } from '../../types';
import { X, UserCheck, ShieldAlert, Check } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AssignModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onAssigned,
}) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch officers in this department
  const { data: officers = [], isLoading: isLoadingOfficers } = useQuery<User[]>({
    queryKey: ['dept-officers', complaint.department?.id],
    queryFn: () => adminApi.getOfficers(complaint.department?.id),
    enabled: isOpen && !!complaint.department?.id,
  });

  const assignMutation = useMutation({
    mutationFn: () => {
      if (!selectedOfficerId) throw new Error('Please select an officer');
      return complaintsApi.assign(
        complaint.id,
        Number(selectedOfficerId),
        notes.trim() || 'Assigned by Department Administrator'
      );
    },
    onSuccess: () => {
      onAssigned();
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to assign complaint');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-primary-100 dark:bg-primary-950 text-primary-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Assign Field Officer
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

        {/* Content */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            assignMutation.mutate();
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
              Issue Title
            </label>
            <div className="text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              {complaint.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Officer in {complaint.department?.name || 'Department'}
            </label>
            {isLoadingOfficers ? (
              <div className="py-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : officers.length === 0 ? (
              <div className="text-xs text-amber-600 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                No active officers found in this department. Please ensure an officer is assigned to {complaint.department?.name}.
              </div>
            ) : (
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">-- Choose an Officer --</option>
                {officers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.firstName} {officer.lastName} ({officer.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assignment Instructions / Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Please inspect site immediately, high traffic junction."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={!selectedOfficerId || assignMutation.isPending}
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-md shadow-primary-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              {assignMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
