import { Visitor, Host } from '@/types/visitor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Trash2, User, Phone, Building, Clock, Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface VisitorCardProps {
  visitor: Visitor;
  hosts: Host[];
  onCheckOut: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'border-warning bg-warning/10 text-warning', icon: AlertCircle },
  approved: { label: 'Approved', color: 'border-success bg-success/10 text-success', icon: CheckCircle },
  'checked-in': { label: 'Checked In', color: 'border-success bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'border-destructive bg-destructive/10 text-destructive', icon: XCircle },
  'checked-out': { label: 'Checked Out', color: 'border-muted-foreground bg-muted text-muted-foreground', icon: LogOut },
};

export const VisitorCard = ({ visitor, hosts, onCheckOut, onDelete }: VisitorCardProps) => {
  const isCheckedIn = visitor.status === 'checked-in';
  const status = statusConfig[visitor.status];
  const StatusIcon = status.icon;
  const host = hosts.find((h) => h.id === visitor.host);

  return (
    <Card className={`border-0 shadow-card transition-all duration-200 ${isCheckedIn ? 'border-l-4 border-l-success' : visitor.status === 'pending' ? 'border-l-4 border-l-warning' : 'opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {visitor.photo ? (
              <img
                src={visitor.photo}
                alt={visitor.name}
                className="h-12 w-12 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{visitor.name}</h3>
                <Badge variant="outline" className={status.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              {visitor.company && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building className="h-3 w-3" />
                  {visitor.company}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{visitor.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{host ? `${host.flatNumber}` : visitor.host}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>In: {format(new Date(visitor.checkInTime), 'HH:mm')}</span>
          </div>
          {visitor.checkOutTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Out: {format(new Date(visitor.checkOutTime), 'HH:mm')}</span>
            </div>
          )}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium">Purpose:</span> {visitor.purpose}
        </p>

        {visitor.approvedBy && (
          <p className="mt-1 text-xs text-muted-foreground">
            {visitor.status === 'rejected' ? 'Rejected' : 'Approved'} by: {visitor.approvedBy}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          {isCheckedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckOut(visitor.id)}
              className="flex-1 border-success text-success hover:bg-success/10"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Check Out
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(visitor.id)}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
