import { BellOff } from 'lucide-react';

const NotificationEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
      <BellOff className="w-7 h-7 text-muted-foreground opacity-60" />
    </div>
    <p className="text-sm font-medium text-foreground">No notifications yet</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
      You'll be notified about donations, pickups, and deliveries here.
    </p>
  </div>
);

export default NotificationEmptyState;
