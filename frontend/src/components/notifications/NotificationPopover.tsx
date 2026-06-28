import { useState, useEffect, useRef } from 'react';
import { AppNotification } from '@/lib/notificationService';
import NotificationList from './NotificationList';
import { NotificationSkeletonList } from './NotificationSkeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TABS = ['All', 'Unread'] as const;
type Tab = typeof TABS[number];

interface NotificationPopoverProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading?: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const NotificationPopover = ({
  open,
  onClose,
  notifications,
  unreadCount,
  isLoading = false,
  onMarkRead,
  onMarkAllRead,
  anchorRef,
}: NotificationPopoverProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      )
        return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  const visible = activeTab === 'Unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className={cn(
        'absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)]',
        'flex flex-col bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden',
        'max-h-[min(560px,calc(100dvh-80px))]',
        'origin-top-right transition-all duration-200',
        open
          ? 'opacity-100 scale-100 pointer-events-auto'
          : 'opacity-0 scale-95 pointer-events-none'
      )}
    >
      {/* Sticky header + tabs */}
      <div className="shrink-0 bg-card">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex gap-1 px-4 pb-2 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                activeTab === tab
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
        {isLoading ? (
          <NotificationSkeletonList count={3} />
        ) : (
          <NotificationList notifications={visible} onRead={onMarkRead} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default NotificationPopover;
