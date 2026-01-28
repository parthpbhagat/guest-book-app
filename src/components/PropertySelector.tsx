import { useState } from 'react';
import { Property } from '@/types/visitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, ChevronDown, Plus, Trash2, Edit2, MapPin } from 'lucide-react';

interface PropertySelectorProps {
  properties: Property[];
  activeProperty: Property | null;
  onSelect: (id: string) => void;
  onAdd: (property: Omit<Property, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Property>) => void;
  onDelete: (id: string) => void;
}

const propertyTypeLabels = {
  apartment: 'Apartment Complex',
  society: 'Housing Society',
  office: 'Office Building',
  campus: 'Campus',
};

const propertyTypeIcons = {
  apartment: '🏢',
  society: '🏘️',
  office: '🏛️',
  campus: '🎓',
};

export const PropertySelector = ({
  properties,
  activeProperty,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
}: PropertySelectorProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Omit<Property, 'id'>>({
    name: '',
    address: '',
    type: 'society',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    if (editingProperty) {
      onUpdate(editingProperty.id, formData);
      setEditingProperty(null);
    } else {
      onAdd(formData);
    }
    setFormData({ name: '', address: '', type: 'society' });
    setIsAddOpen(false);
  };

  const startEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({ name: property.name, address: property.address, type: property.type });
    setIsAddOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingProperty(null);
      setFormData({ name: '', address: '', type: 'society' });
    }
  };

  if (properties.length === 0) {
    return (
      <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Your First Property</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Property['type']) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(propertyTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {propertyTypeIcons[key as Property['type']]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property Name *</Label>
              <Input
                placeholder="e.g., Green Valley Apartments"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Add Property
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="max-w-[120px] truncate sm:max-w-[200px]">
              {activeProperty?.name || 'Select Property'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-popover">
          <DropdownMenuLabel>Your Properties</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {properties.map((property) => (
            <DropdownMenuItem
              key={property.id}
              className={`flex cursor-pointer items-center justify-between ${
                activeProperty?.id === property.id ? 'bg-accent' : ''
              }`}
              onClick={() => onSelect(property.id)}
            >
              <div className="flex items-center gap-2">
                <span>{propertyTypeIcons[property.type]}</span>
                <div>
                  <p className="font-medium">{property.name}</p>
                  <p className="text-xs text-muted-foreground">{property.address}</p>
                </div>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => startEdit(property)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onDelete(property.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsAddOpen(true)} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Property['type']) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(propertyTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {propertyTypeIcons[key as Property['type']]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property Name *</Label>
              <Input
                placeholder="e.g., Green Valley Apartments"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {editingProperty ? 'Update Property' : 'Add Property'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
