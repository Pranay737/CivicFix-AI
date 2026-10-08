import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notificationsApi';
import { Bell, CheckCheck, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(0, 20),
    enabled: isOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  if (!isOpen) return null;

  const notifications = data?.content || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Notifications</h2>
            </div>
            <div className="flex items-center space-x-2">
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-primary-50 dark:hover:bg-primary-950/40"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Bell className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-500">You're all caught up with civic updates.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.read) markReadMutation.mutate(item.id);
                    if (item.linkUrl) {
                      onClose();
                      navigate(item.linkUrl);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-sm transition-all cursor-pointer relative ${
                    item.read
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 opacity-80'
                      : 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800 shadow-sm'
                  } hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600`}
                >
                  {!item.read && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                  )}
                  <div className="font-semibold text-slate-900 dark:text-white pr-4">
                    {item.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 text-xs leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-400">
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    {item.linkUrl && (
                      <span className="flex items-center gap-0.5 text-primary-600 dark:text-primary-400 font-medium">
                        View <ExternalLink className="w-3 h-3 ml-0.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
