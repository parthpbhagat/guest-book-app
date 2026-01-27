import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Phone, Building, MessageSquare, Clock } from 'lucide-react';
import { PhotoCapture } from './PhotoCapture';
import { Host } from '@/types/visitor';

interface VisitorFormProps {
  onSubmit: (visitor: {
    name: string;
    phone: string;
    purpose: string;
    host: string;
    company?: string;
    photo?: string;
  }) => void;
  hosts: Host[];
}

export const VisitorForm = ({ onSubmit, hosts }: VisitorFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: '',
    host: '',
    company: '',
    photo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.purpose || !formData.host) {
      return;
    }
    onSubmit(formData);
    setFormData({ name: '', phone: '', purpose: '', host: '', company: '', photo: '' });
  };

  const selectedHost = hosts.find((h) => h.id === formData.host);

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <UserPlus className="h-5 w-5 text-primary" />
          New Visitor Check-In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Capture */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Visitor Photo</Label>
            <PhotoCapture
              onCapture={(photo) => setFormData({ ...formData, photo })}
              currentPhoto={formData.photo}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter visitor name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Company (Optional)
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company"
                placeholder="Enter company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="host" className="text-sm font-medium">
              Visiting Flat/Owner *
            </Label>
            <Select value={formData.host} onValueChange={(value) => setFormData({ ...formData, host: value })}>
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
            {selectedHost && (
              <p className="text-xs text-muted-foreground">
                <Phone className="mr-1 inline h-3 w-3" />
                {selectedHost.phone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">
              Purpose of Visit *
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="purpose"
                placeholder="Enter purpose of visit"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
            <Clock className="mr-2 inline h-4 w-4" />
            Visitor will be notified to wait for owner approval
          </div>

          <Button type="submit" className="w-full" size="lg">
            <UserPlus className="mr-2 h-5 w-5" />
            Request Check-In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
