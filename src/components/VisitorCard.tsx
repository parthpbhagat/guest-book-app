import { Visitor } from '@/types/visitor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Trash2, User, Phone, Building, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';

interface VisitorCardProps {
  visitor: Visitor;
  onCheckOut: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VisitorCard = ({ visitor, onCheckOut, onDelete }: VisitorCardProps) => {
  const isCheckedIn = visitor.status === 'checked-in';

  return (
    <Card className={`border-0 shadow-card transition-all duration-200 ${isCheckedIn ? 'border-l-4 border-l-success' : 'opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{visitor.name}</h3>
                <Badge variant={isCheckedIn ? 'default' : 'secondary'} className={isCheckedIn ? 'bg-success text-success-foreground' : ''}>
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
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
            <span>Host: {visitor.host}</span>
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
