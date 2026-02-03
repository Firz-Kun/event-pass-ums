import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { notificationsAPI } from '@/services/api';
import { Notification, NotificationType } from '@/types/notification';

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'event_reminder':
      return '⏰';
    case 'event_cancelled':
      return '❌';
    case 'new_event':
      return '🎉';
    case 'announcement':
      return '📢';
    case 'feedback_received':
      return '⭐';
    case 'account_status':
      return '👤';
    default:
      return '📌';
  }
};

const getTypeBadge = (type: NotificationType) => {
  const labels: Record<NotificationType, string> = {
    event_reminder: 'Reminder',
    event_cancelled: 'Cancelled',
    new_event: 'New Event',
    announcement: 'Announcement',
    feedback_received: 'Feedback',
    account_status: 'Account',
  };
  return labels[type] || type;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationsAPI.getAll();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      await Promise.all(unreadIds.map(id => notificationsAPI.markAsRead(id)));
      
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast({
        title: 'All Marked as Read',
        description: 'All notifications have been marked as read',
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: 'Notifications Cleared',
      description: 'All notifications have been removed',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Button variant="outline" onClick={clearAll} disabled={notifications.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NotificationList
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="unread">
            <NotificationList
              notifications={unreadNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  formatDate,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
}) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No notifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={notification.isRead ? 'opacity-75' : 'border-primary/50 bg-primary/5'}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <span className="text-2xl">{getTypeIcon(notification.type)}</span>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="font-medium">{notification.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getTypeBadge(notification.type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                {!notification.isRead && (
                  <Button variant="ghost" size="icon" onClick={() => onMarkAsRead(notification.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onDelete(notification.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
