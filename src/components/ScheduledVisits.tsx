import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, User, Phone, Building, Check, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Host } from '@/types/visitor';

interface ScheduledVisit {
  id: string;
  host_id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_company?: string;
  purpose: string;
  scheduled_date: string;
  scheduled_time?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface ScheduledVisitsProps {
  visits: ScheduledVisit[];
  hosts: Host[];
  onAdd: (visit: Omit<ScheduledVisit, 'id' | 'status'>) => void;
  onUpdateStatus: (id: string, status: ScheduledVisit['status']) => void;
  onDelete: (id: string) => void;
}

export const ScheduledVisits = ({ visits, hosts, onAdd, onUpdateStatus, onDelete }: ScheduledVisitsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    host_id: '',
    visitor_name: '',
    visitor_phone: '',
    visitor_company: '',
    purpose: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.host_id || !formData.visitor_name.trim() || !formData.visitor_phone.trim() || !formData.purpose.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAdd({
      host_id: formData.host_id,
      visitor_name: formData.visitor_name.trim(),
      visitor_phone: formData.visitor_phone.trim(),
      visitor_company: formData.visitor_company.trim() || undefined,
      purpose: formData.purpose.trim(),
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time || undefined,
      notes: formData.notes.trim() || undefined,
    });

    setFormData({
      host_id: '',
      visitor_name: '',
      visitor_phone: '',
      visitor_company: '',
      purpose: '',
      scheduled_date: format(new Date(), 'yyyy-MM-dd'),
      scheduled_time: '',
      notes: '',
    });
    setIsOpen(false);
    toast.success('Visit scheduled successfully');
  };

  const getStatusBadge = (status: ScheduledVisit['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">Cancelled</Badge>;
    }
  };

  const getHostName = (hostId: string) => {
    const host = hosts.find((h) => h.id === hostId);
    return host ? `${host.name} (${host.flatNumber})` : 'Unknown';
  };

  const filteredVisits = visits.filter(
    (v) =>
      v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitor_phone.includes(searchQuery) ||
      v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingCount = visits.filter((v) => v.status === 'pending' || v.status === 'confirmed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Scheduled Visits</h2>
          <Badge className="ml-2">{upcomingCount} Upcoming</Badge>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Visit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule a Visit
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host/Flat Owner *</Label>
                <Select value={formData.host_id} onValueChange={(value) => setFormData({ ...formData, host_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select host" />
                  </SelectTrigger>
                  <SelectContent>
                    {hosts.map((host) => (
                      <SelectItem key={host.id} value={host.id}>
                        {host.name} - {host.flatNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visitor_name">Visitor Name *</Label>
                  <Input
                    id="visitor_name"
                    value={formData.visitor_name}
                    onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                    placeholder="Enter visitor name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor_phone">Phone Number *</Label>
                  <Input
                    id="visitor_phone"
                    type="tel"
                    value={formData.visitor_phone}
                    onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitor_company">Company (Optional)</Label>
                <Input
                  id="visitor_company"
                  value={formData.visitor_company}
                  onChange={(e) => setFormData({ ...formData, visitor_company: e.target.value })}
                  placeholder="Company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Purpose of visit"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Date *</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Time (Optional)</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Schedule Visit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search scheduled visits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery ? 'No matching scheduled visits' : 'No scheduled visits'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVisits.map((visit) => (
            <Card key={visit.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{visit.visitor_name}</span>
                      {getStatusBadge(visit.status)}
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{visit.visitor_phone}</span>
                        {visit.visitor_company && (
                          <>
                            <span className="mx-1">•</span>
                            <Building className="h-3 w-3" />
                            <span>{visit.visitor_company}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(visit.scheduled_date), 'PPP')}</span>
                        {visit.scheduled_time && (
                          <>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{visit.scheduled_time}</span>
                          </>
                        )}
                      </div>
                      <p>
                        <span className="font-medium">Host:</span> {getHostName(visit.host_id)}
                      </p>
                      <p>
                        <span className="font-medium">Purpose:</span> {visit.purpose}
                      </p>
                      {visit.notes && (
                        <p className="mt-1 italic">"{visit.notes}"</p>
                      )}
                    </div>
                  </div>

                  {(visit.status === 'pending' || visit.status === 'confirmed') && (
                    <div className="flex flex-col gap-1">
                      {visit.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-primary"
                          onClick={() => onUpdateStatus(visit.id, 'confirmed')}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Confirm
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success"
                        onClick={() => onUpdateStatus(visit.id, 'completed')}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => onUpdateStatus(visit.id, 'cancelled')}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
