import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Notification } from '../types';
import { Bell, Check, CheckCheck, Trash2, Gift, ArrowRightLeft, MessageSquare, Heart, Award, AlertCircle } from 'lucide-react';

const typeIcons: Record<string, any> = {
  listing_inquiry: MessageSquare, listing_viewed: Bell, listing_favorited: Heart,
  exchange_proposal: ArrowRightLeft, exchange_accepted: Check, exchange_rejected: AlertCircle,
  donation_request: Gift, donation_approved: Check, donation_rejected: AlertCircle,
  new_message: MessageSquare, badge_earned: Award, milestone: Award,
  platform_update: Bell, account_login: Bell, profile_updated: Bell, verification_changed: Bell,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {} finally { setLoading(false); }
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title text-dark-100 mb-1">Notifications</h1>
          <p className="text-dark-400">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-primary-400 flex items-center gap-1 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Bell className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-300">No notifications</h3>
          <p className="text-dark-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <div key={notif._id}
                className={`glass-card p-4 flex items-start gap-3 transition-all ${!notif.read ? 'border-primary-500/20 bg-primary-500/5' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.read ? 'bg-primary-500/20' : 'bg-dark-700'}`}>
                  <Icon className={`w-5 h-5 ${!notif.read ? 'text-primary-400' : 'text-dark-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!notif.read ? 'text-dark-100' : 'text-dark-300'}`}>{notif.title}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-dark-500 mt-1">{formatTime(notif.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.read && (
                    <button onClick={() => markRead(notif._id)} className="p-1.5 text-dark-500 hover:text-primary-400 rounded-lg hover:bg-dark-700/50" title="Mark as read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(notif._id)} className="p-1.5 text-dark-500 hover:text-red-400 rounded-lg hover:bg-dark-700/50" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
