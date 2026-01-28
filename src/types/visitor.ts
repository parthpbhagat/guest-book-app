export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  host: string;
  company?: string;
  photo?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
  approvedAt?: string;
  approvedBy?: string;
  propertyId?: string;
}

export interface Host {
  id: string;
  name: string;
  phone: string;
  flatNumber: string;
  propertyId?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'society' | 'office' | 'campus';
}

export interface PreRegisteredVisitor {
  id: string;
  name: string;
  phone: string;
  hostId: string;
  propertyId?: string;
  purpose: string;
  validFrom?: string;
  validUntil?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'always';
  isActive: boolean;
  photo?: string;
}
