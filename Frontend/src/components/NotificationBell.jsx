import { useEffect, useRef, useState } from 'react';
import { notificationsAPI } from '../api/appointments';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS = {
  new_booking: '📅',
  cancelled: '❌',
  rescheduled: '🔄',
  reminder: '🔔',
  payment: '💳',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = () => {
    setLoading(true);

    notificationsAPI
      .list()
      .then((res) => {
        setNotifications(res.data.notifications || []);
        setUnread(res.data.unread_count || 0);
      })
      .catch((error) => {
        console.error('Failed to fetch notifications:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      );

      setUnread((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        }))
      );

      setUnread(0);
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      );
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();

    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return `${days}d ago`;
  };
  const handleNotificationClick = async (notification) => {
  // Mark as read
  if (!notification.is_read) {
    await handleMarkRead(notification.id);
  }

  // Doctor receives new booking
  if (
    notification.type === 'new_booking' &&
    notification.appointment_id
  ) {
    navigate(
      `/doctor/schedule?appointment=${notification.appointment_id}`
    );
    setOpen(false);
    return;
  }

  // Patient receives confirmation/cancellation
  if (
    (
      notification.type === 'confirmed' ||
      notification.type === 'cancelled'
    ) &&
    notification.appointment_id
  ) {
    navigate(
      `/appointments?appointment=${notification.appointment_id}`
    );
    setOpen(false);
  }
};

  return (
    <div ref={ref} className="relative">

      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>

        {unread > 0 && (
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">

              <span className="font-serif font-bold text-slate-900 text-sm">
                Notifications
              </span>

              {unread > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}

            </div>

            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-teal-600 font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">

            {loading ? (
              <div className="text-center py-10">
                <div className="text-2xl mb-2 animate-pulse">
                  🔔
                </div>

                <p className="text-xs text-slate-400">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">
                  🔔
                </div>

                <p className="text-xs text-slate-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 transition-colors cursor-pointer
                    ${
                      !n.is_read
                        ? 'bg-teal-50 hover:bg-teal-100'
                        : 'hover:bg-slate-50'
                    }`}
                >

                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base
                      ${
                        !n.is_read
                          ? 'bg-teal-100'
                          : 'bg-slate-100'
                      }`}
                  >
                    {TYPE_ICONS[n.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    <div
                      className={`text-xs font-semibold truncate ${
                        !n.is_read
                          ? 'text-slate-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {n.title}
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </div>

                    <div className="text-xs text-slate-300 mt-1">
                      {timeAgo(n.created_at)}
                    </div>

                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1" />
                  )}

                </div>
              ))
            )}

          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400 text-center">
                Showing last 20 notifications
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}