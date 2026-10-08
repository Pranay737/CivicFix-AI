import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { SlaPolicy } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Settings, Clock, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SlaSettingsPage: React.FC = () => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hoursInput, setHoursInput] = useState<number>(24);
  const [successMsg, setSuccessMsg] = useState('');

  const { data: policies = [], isLoading, refetch } = useQuery<SlaPolicy[]>({
    queryKey: ['sla-policies'],
    queryFn: () => adminApi.getSlaPolicies(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, hours }: { id: number; hours: number }) =>
      adminApi.updateSlaPolicy(id, hours),
    onSuccess: () => {
      setSuccessMsg('SLA target policy updated successfully.');
      setEditingId(null);
      refetch();
    },
  });

  const handleStartEdit = (policy: SlaPolicy) => {
    setEditingId(policy.id);
    setHoursInput(policy.resolutionHours);
    setSuccessMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          SLA Resolution Policy Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Define maximum resolution windows (in hours) based on issue category and urgency priority.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Policies Table */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority Level</th>
                  <th className="py-3.5 px-6">Resolution Window (Hours)</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {p.categoryName || p.category?.name || 'Default / All Categories'}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={p.priority} />
                    </td>
                    <td className="py-4 px-6">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={720}
                            value={hoursInput}
                            onChange={(e) => setHoursInput(Number(e.target.value))}
                            className="w-24 px-3 py-1.5 rounded-lg border border-primary-500 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                          />
                          <span className="text-slate-400 text-xs font-medium">hours</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                          <span>{p.resolutionHours} hours</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            ({(p.resolutionHours / 24).toFixed(1)} days)
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingId === p.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              updateMutation.mutate({ id: p.id, hours: hoursInput })
                            }
                            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold"
                        >
                          Modify SLA
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
