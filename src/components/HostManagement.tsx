import { useState } from 'react';
import { Host } from '@/types/visitor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, Phone, User, Plus, Trash2, Edit2 } from 'lucide-react';

interface HostManagementProps {
  hosts: Host[];
  onAdd: (host: Omit<Host, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Host>) => void;
  onDelete: (id: string) => void;
}

export const HostManagement = ({ hosts, onAdd, onUpdate, onDelete }: HostManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', flatNumber: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.flatNumber) return;

    if (editingHost) {
      onUpdate(editingHost.id, formData);
    } else {
      onAdd(formData);
    }
    setFormData({ name: '', phone: '', flatNumber: '' });
    setEditingHost(null);
    setIsOpen(false);
  };

  const startEdit = (host: Host) => {
    setEditingHost(host);
    setFormData({ name: host.name, phone: host.phone, flatNumber: host.flatNumber });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingHost(null);
      setFormData({ name: '', phone: '', flatNumber: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Flat Owners</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Owner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHost ? 'Edit Owner' : 'Add New Owner'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Flat Number *</Label>
                <Input
                  placeholder="e.g., A-101"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Owner Name *</Label>
                <Input
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  placeholder="Enter phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingHost ? 'Update Owner' : 'Add Owner'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {hosts.map((host) => (
          <Card key={host.id} className="border-0 shadow-card">
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{host.flatNumber}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {host.name}
                    <span className="mx-1">•</span>
                    <Phone className="h-3 w-3" />
                    {host.phone}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(host)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(host.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
