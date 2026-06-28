import { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBadge from './NotificationBadge';
import NotificationPopover from './NotificationPopover';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  return (
    <div className="relative">
      <Button
        ref={bellRef}
        variant="ghost"
        size="icon"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative text-muted-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-5 h-5" />
        <NotificationBadge count={unreadCount} />
      </Button>

      <NotificationPopover
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        anchorRef={bellRef as React.RefObject<HTMLElement>}
      />
    </div>
  );
};

export default NotificationBell;
