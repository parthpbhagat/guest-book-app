import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { NotificationSounds } from './NotificationSounds';

interface NotificationSettingsProps {
  isSupported: boolean;
  permission: NotificationPermission;
  onRequestPermission: () => Promise<boolean>;
}

export const NotificationSettings = ({
  isSupported,
  permission,
  onRequestPermission,
}: NotificationSettingsProps) => {
  const [selectedSound, setSelectedSound] = useState(() => 
    localStorage.getItem('notification-sound') || 'classic-bell'
  );

  const handleSoundChange = (soundId: string) => {
    setSelectedSound(soundId);
    localStorage.setItem('notification-sound', soundId);
  };

  return (
    <div className="space-y-4">
      {!isSupported ? (
        <Card className="border-0 bg-muted">
          <CardContent className="flex items-center gap-3 p-4">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Notifications Not Supported</p>
              <p className="text-sm text-muted-foreground">
                Your browser doesn't support push notifications
              </p>
            </div>
          </CardContent>
        </Card>
      ) : permission === 'granted' ? (
        <Card className="border-0 bg-success/10">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">Notifications Enabled</p>
              <p className="text-sm text-muted-foreground">
                You'll receive alerts when visitors arrive
              </p>
            </div>
          </CardContent>
        </Card>
      ) : permission === 'denied' ? (
        <Card className="border-0 bg-destructive/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Notifications Blocked</p>
              <p className="text-sm text-muted-foreground">
                Enable notifications in your browser settings
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get alerts when visitors arrive
                </p>
              </div>
            </div>
            <Button onClick={onRequestPermission} size="sm">
              Enable
            </Button>
          </CardContent>
        </Card>
      )}

      <NotificationSounds
        selectedSound={selectedSound}
        onSelectSound={handleSoundChange}
      />
    </div>
  );
};
