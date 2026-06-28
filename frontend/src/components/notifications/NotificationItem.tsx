import {
  Handshake, Check, Truck, QrCode, CheckCircle2,
  XCircle, Bell, Package,
} from 'lucide-react';
import { AppNotification, NotificationType } from '@/lib/notificationService';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ─── Type config ──────────────────────────────────────────────────────────────

interface TypeConfig {
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  DONATION_MATCHED:    { icon: Handshake,    iconClass: 'text-amber-500',   bgClass: 'bg-amber-50' },
  DONATION_ACCEPTED:   { icon: Check,        iconClass: 'text-primary',     bgClass: 'bg-primary/10' },
  PICKUP_STARTED:      { icon: Package,      iconClass: 'text-blue-500',    bgClass: 'bg-blue-50' },
  QR_VERIFIED:         { icon: QrCode,       iconClass: 'text-violet-500',  bgClass: 'bg-violet-50' },
  DELIVERY_COMPLETED:  { icon: CheckCircle2, iconClass: 'text-green-600',   bgClass: 'bg-green-50' },
  DONATION_CANCELLED:  { icon: XCircle,      iconClass: 'text-destructive', bgClass: 'bg-destructive/10' },
  SYSTEM_UPDATE:       { icon: Bell,         iconClass: 'text-muted-foreground', bgClass: 'bg-muted' },
};

// ─── Timestamp ────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: AppNotification;
  onRead: (id: string) => void;
  onClose: () => void;
}

const NotificationItem = ({ notification, onRead, onClose }: NotificationItemProps) => {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM_UPDATE;
  const Icon = cfg.icon;

  const handleClick = () => {
    onRead(notification.id);
    if (notification.href) {
      navigate(notification.href);
      onClose();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors',
        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        !notification.read && 'bg-primary/5'
      )}
      aria-label={notification.title}
    >
      {/* Icon */}
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bgClass)}>
        <Icon className={cn('w-4 h-4', cfg.iconClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm leading-snug truncate', !notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80')}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" aria-label="Unread" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {notification.description}
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-1.5">
          {relativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
};

export default NotificationItem;
