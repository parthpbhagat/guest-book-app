import { Visitor, Host } from '@/types/visitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Phone, Building, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface PendingApprovalsProps {
  visitors: Visitor[];
  hosts: Host[];
  onApprove: (id: string, approvedBy: string) => void;
  onReject: (id: string, rejectedBy: string) => void;
}

export const PendingApprovals = ({ visitors, hosts, onApprove, onReject }: PendingApprovalsProps) => {
  const pendingVisitors = visitors.filter((v) => v.status === 'pending');

  const getHostInfo = (hostId: string) => {
    return hosts.find((h) => h.id === hostId);
  };

  if (pendingVisitors.length === 0) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No pending approvals</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-warning" />
        <h2 className="text-lg font-semibold">Pending Approvals</h2>
        <Badge variant="destructive" className="ml-auto">
          {pendingVisitors.length} Waiting
        </Badge>
      </div>

      {pendingVisitors.map((visitor) => {
        const host = getHostInfo(visitor.host);
        return (
          <Card key={visitor.id} className="border-0 border-l-4 border-l-warning shadow-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {visitor.photo ? (
                  <img
                    src={visitor.photo}
                    alt={visitor.name}
                    className="h-14 w-14 rounded-full border-2 border-warning object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/20">
                    <User className="h-7 w-7 text-warning" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{visitor.name}</h3>
                    <Badge variant="outline" className="border-warning text-warning">
                      Pending
                    </Badge>
                  </div>
                  {visitor.company && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {visitor.company}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {visitor.phone}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-muted p-2 text-sm">
                <p>
                  <span className="font-medium">Visiting:</span>{' '}
                  {host ? `${host.flatNumber} - ${host.name}` : 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">Purpose:</span> {visitor.purpose}
                </p>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(visitor.checkInTime), 'dd MMM, HH:mm')}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-success hover:bg-success/90"
                  onClick={() => onApprove(visitor.id, host?.name || 'Owner')}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve Entry
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onReject(visitor.id, host?.name || 'Owner')}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
