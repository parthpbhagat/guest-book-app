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
}

export interface Host {
  id: string;
  name: string;
  phone: string;
  flatNumber: string;
}
