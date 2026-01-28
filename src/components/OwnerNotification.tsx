import { Host, Visitor } from '@/types/visitor';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface OwnerNotificationProps {
  visitor: Visitor;
  host?: Host;
}

export const OwnerNotification = ({ visitor, host }: OwnerNotificationProps) => {
  if (!host) return null;

  const message = `🔔 *Visitor Entry Request*

👤 *Visitor:* ${visitor.name}
📱 *Phone:* ${visitor.phone}
${visitor.company ? `🏢 *Company:* ${visitor.company}\n` : ''}📝 *Purpose:* ${visitor.purpose}
⏰ *Time:* ${format(new Date(visitor.checkInTime), 'dd MMM yyyy, HH:mm')}

🏠 *Visiting:* Flat ${host.flatNumber}

Please approve or reject this entry request from the Visitor Book app.`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${host.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
  const smsUrl = `sms:${host.phone}?body=${encodedMessage}`;

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 gap-1 border-success text-success hover:bg-success/10"
        onClick={() => window.open(whatsappUrl, '_blank')}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 gap-1"
        onClick={() => window.open(smsUrl, '_blank')}
      >
        <Phone className="h-4 w-4" />
        <span className="hidden sm:inline">SMS</span>
      </Button>
    </div>
  );
};
