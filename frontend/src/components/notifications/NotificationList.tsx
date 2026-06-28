import { AppNotification } from '@/lib/notificationService';
import NotificationItem from './NotificationItem';
import NotificationEmptyState from './NotificationEmptyState';

interface NotificationListProps {
  notifications: AppNotification[];
  onRead: (id: string) => void;
  onClose: () => void;
}

const NotificationList = ({ notifications, onRead, onClose }: NotificationListProps) => {
  if (notifications.length === 0) return <NotificationEmptyState />;

  return (
    <div className="divide-y divide-border">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onRead={onRead} onClose={onClose} />
      ))}
    </div>
  );
};

export default NotificationList;
