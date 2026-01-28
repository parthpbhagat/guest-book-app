import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== 'granted') {
        console.log('Notifications not available or not permitted');
        return null;
      }

      try {
        const notification = new Notification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error('Error sending notification:', error);
        return null;
      }
    },
    [isSupported, permission]
  );

  const notifyVisitorArrival = useCallback(
    (visitorName: string, flatNumber: string, purpose: string) => {
      return sendNotification('🔔 New Visitor', {
        body: `${visitorName} is here to visit ${flatNumber}\nPurpose: ${purpose}`,
        tag: 'visitor-arrival',
        requireInteraction: true,
      });
    },
    [sendNotification]
  );

  const notifyApproval = useCallback(
    (visitorName: string, approved: boolean) => {
      return sendNotification(
        approved ? '✅ Visitor Approved' : '❌ Visitor Rejected',
        {
          body: `${visitorName} has been ${approved ? 'approved' : 'rejected'}`,
          tag: 'visitor-status',
        }
      );
    },
    [sendNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    notifyVisitorArrival,
    notifyApproval,
  };
};
