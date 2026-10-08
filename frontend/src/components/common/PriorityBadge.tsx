import React from 'react';
import { Priority } from '../../types';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showIcon = true,
  size = 'md',
}) => {
  const config = {
    CRITICAL: {
      bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900',
      icon: <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600 dark:text-red-400 animate-bounce" />,
      label: 'Critical',
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-orange-500" />,
      label: 'High',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />,
      label: 'Medium',
    },
    LOW: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: <Info className="w-3.5 h-3.5 mr-1 text-slate-500" />,
      label: 'Low',
    },
  }[priority] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <Info className="w-3.5 h-3.5 mr-1" />,
    label: priority,
  };

  const sizeClass = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border ${config.bg} ${sizeClass}`}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
