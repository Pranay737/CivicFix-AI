import React from 'react';
import { ComplaintStatusHistory } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, User as UserIcon, MessageSquare } from 'lucide-react';

interface ComplaintTimelineProps {
  timeline: ComplaintStatusHistory[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <div className="text-xs text-slate-400 py-2">No activity recorded yet.</div>;
  }

  // Sort ascending by createdAt
  const sorted = [...timeline].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {sorted.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Node dot */}
          <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-primary-600 shadow-sm" />

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 transition-all hover:border-primary-300 dark:hover:border-primary-700">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status || item.newStatus!} size="sm" />
                {(item.performedBy || item.changedByName) && (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    {item.performedBy
                      ? `${item.performedBy.firstName} ${item.performedBy.lastName}`
                      : item.changedByName}
                    {item.performedBy?.role && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({item.performedBy.role})
                      </span>
                    )}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>

            {item.comment && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                "{item.comment}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
