import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2, Phone, User, Search, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface BlacklistedVisitor {
  id: string;
  name: string;
  phone: string;
  reason?: string;
  photo?: string;
  blacklisted_at: string;
  blacklisted_by?: string;
  is_active: boolean;
}

interface BlacklistManagementProps {
  blacklisted: BlacklistedVisitor[];
  onAdd: (visitor: Omit<BlacklistedVisitor, 'id' | 'blacklisted_at' | 'is_active'>) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const BlacklistManagement = ({ blacklisted, onAdd, onRemove, onToggleActive }: BlacklistManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    reason: '',
    blacklisted_by: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    onAdd({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      reason: formData.reason.trim() || undefined,
      blacklisted_by: formData.blacklisted_by.trim() || undefined,
    });

    setFormData({ name: '', phone: '', reason: '', blacklisted_by: '' });
    setIsOpen(false);
    toast.success('Visitor added to blacklist');
  };

  const filteredBlacklisted = blacklisted.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery)
  );

  const activeCount = blacklisted.filter((v) => v.is_active).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Blacklist</h2>
          <Badge variant="destructive" className="ml-2">
            {activeCount} Active
          </Badge>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Plus className="mr-2 h-4 w-4" />
              Add to Blacklist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Add to Blacklist
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Visitor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter visitor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Blacklisting</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the reason..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blacklisted_by">Blacklisted By</Label>
                <Input
                  id="blacklisted_by"
                  value={formData.blacklisted_by}
                  onChange={(e) => setFormData({ ...formData, blacklisted_by: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" className="flex-1">
                  Add to Blacklist
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search blacklisted visitors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredBlacklisted.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Ban className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery ? 'No matching blacklisted visitors' : 'No blacklisted visitors'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBlacklisted.map((visitor) => (
            <Card key={visitor.id} className={`transition-all ${!visitor.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{visitor.name}</p>
                      {!visitor.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{visitor.phone}</span>
                    </div>
                    {visitor.reason && (
                      <p className="mt-1 text-sm text-destructive">{visitor.reason}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Blacklisted: {new Date(visitor.blacklisted_at).toLocaleDateString()}
                      {visitor.blacklisted_by && ` by ${visitor.blacklisted_by}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleActive(visitor.id)}
                  >
                    {visitor.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      onRemove(visitor.id);
                      toast.success('Removed from blacklist');
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
