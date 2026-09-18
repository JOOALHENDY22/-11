import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ShieldCheck, MessageSquare, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { rxStore } from '../../store/rxStore';
import { Notification, UserRole } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface NotificationDropdownProps {
  currentRole: UserRole;
  onSelectPrescription?: (rxCode: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  currentRole,
  onSelectPrescription
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(rxStore.getNotifications(currentRole));
  const [unreadCount, setUnreadCount] = useState<number>(rxStore.getUnreadNotificationCount(currentRole));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setNotifications(rxStore.getNotifications(currentRole));
      setUnreadCount(rxStore.getUnreadNotificationCount(currentRole));
    };
    const unsubscribe = rxStore.subscribe(update);
    update();
    return () => unsubscribe();
  }, [currentRole]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    rxStore.markAllNotificationsAsRead(currentRole);
  };

  const handleItemClick = (notif: Notification) => {
    rxStore.markNotificationAsRead(notif.id);
    if (notif.rxCode && onSelectPrescription) {
      onSelectPrescription(notif.rxCode);
      setIsOpen(false);
    }
  };

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'rx_created':
        return <FileText className="w-4 h-4 text-medical-600" />;
      case 'rx_accessed':
      case 'rx_verified':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'clarification_requested':
      case 'clarification_resolved':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'rx_dispensed':
        return <CheckCircle2 className="w-4 h-4 text-mint-600" />;
      case 'safety_alert':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500/20"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-medical-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-3 z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-navy-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-medical-50 text-medical-700 font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-medical-600 hover:text-medical-800 font-medium flex items-center gap-1 hover:underline"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No notifications for this role yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                    !notif.isRead ? 'bg-medical-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!notif.isRead ? 'text-navy-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-medical-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(notif.createdAt)}
                      </span>
                      {notif.rxCode && (
                        <span className="text-[10px] font-mono font-semibold text-medical-700 bg-medical-100/60 px-1.5 py-0.5 rounded">
                          {notif.rxCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Role: <span className="font-semibold capitalize text-navy-900">{currentRole}</span> notifications live stream
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
