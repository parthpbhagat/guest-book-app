import { useState } from 'react';
import { PreRegisteredVisitor, Host } from '@/types/visitor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCheck, Plus, Trash2, Edit2, Phone, User, Calendar, Repeat } from 'lucide-react';
import { PhotoCapture } from './PhotoCapture';
import { format } from 'date-fns';

interface PreRegistrationManagementProps {
  preRegistered: PreRegisteredVisitor[];
  hosts: Host[];
  onAdd: (visitor: Omit<PreRegisteredVisitor, 'id' | 'isActive'>) => void;
  onUpdate: (id: string, updates: Partial<PreRegisteredVisitor>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const frequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  always: 'Always',
};

export const PreRegistrationManagement = ({
  preRegistered,
  hosts,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
}: PreRegistrationManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<PreRegisteredVisitor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hostId: '',
    purpose: '',
    frequency: 'always' as PreRegisteredVisitor['frequency'],
    validFrom: '',
    validUntil: '',
    photo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.hostId || !formData.purpose) return;

    const data = {
      ...formData,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
    };

    if (editing) {
      onUpdate(editing.id, data);
    } else {
      onAdd(data);
    }

    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      hostId: '',
      purpose: '',
      frequency: 'always',
      validFrom: '',
      validUntil: '',
      photo: '',
    });
    setEditing(null);
  };

  const startEdit = (visitor: PreRegisteredVisitor) => {
    setEditing(visitor);
    setFormData({
      name: visitor.name,
      phone: visitor.phone,
      hostId: visitor.hostId,
      purpose: visitor.purpose,
      frequency: visitor.frequency,
      validFrom: visitor.validFrom || '',
      validUntil: visitor.validUntil || '',
      photo: visitor.photo || '',
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const getHostInfo = (hostId: string) => {
    return hosts.find((h) => h.id === hostId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Pre-Registered Visitors</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Visitor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Pre-Registration' : 'Pre-Register Visitor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Photo (Optional)</Label>
                <PhotoCapture
                  onCapture={(photo) => setFormData({ ...formData, photo })}
                  currentPhoto={formData.photo}
                />
              </div>
              <div className="space-y-2">
                <Label>Visitor Name *</Label>
                <Input
                  placeholder="e.g., Ramesh (Maid)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Assigned Flat/Owner *</Label>
                <Select value={formData.hostId} onValueChange={(value) => setFormData({ ...formData, hostId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flat owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {hosts.map((host) => (
                      <SelectItem key={host.id} value={host.id}>
                        {host.flatNumber} - {host.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Purpose/Role *</Label>
                <Input
                  placeholder="e.g., House Maid, Driver, Cook"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Visit Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: PreRegisteredVisitor['frequency']) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="always">Always Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editing ? 'Update Registration' : 'Pre-Register Visitor'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-muted-foreground">
        Pre-registered visitors (maids, drivers, etc.) are automatically approved upon check-in.
      </p>

      {preRegistered.length === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="py-12 text-center">
            <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No pre-registered visitors</p>
            <p className="text-sm text-muted-foreground">Add recurring visitors like maids, drivers, etc.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {preRegistered.map((visitor) => {
            const host = getHostInfo(visitor.hostId);
            return (
              <Card key={visitor.id} className={`border-0 shadow-card ${!visitor.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {visitor.photo ? (
                        <img
                          src={visitor.photo}
                          alt={visitor.name}
                          className="h-12 w-12 rounded-full border-2 border-success object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                          <User className="h-6 w-6 text-success" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{visitor.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {visitor.purpose}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {visitor.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Flat: {host?.flatNumber || 'N/A'}</span>
                          <span className="mx-1">•</span>
                          <Repeat className="h-3 w-3" />
                          {frequencyLabels[visitor.frequency]}
                        </div>
                        {(visitor.validFrom || visitor.validUntil) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {visitor.validFrom && format(new Date(visitor.validFrom), 'dd MMM')}
                            {visitor.validFrom && visitor.validUntil && ' - '}
                            {visitor.validUntil && format(new Date(visitor.validUntil), 'dd MMM yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch checked={visitor.isActive} onCheckedChange={() => onToggleActive(visitor.id)} />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(visitor)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onDelete(visitor.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
