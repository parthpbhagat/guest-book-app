import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Visitor } from '@/types/visitor';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const mapRow = (v: any): Visitor => ({
    id: v.id,
    name: v.name,
    phone: v.phone,
    purpose: v.purpose,
    host: v.host_id || '',
    company: v.company || undefined,
    photo: v.photo || undefined,
    checkInTime: v.check_in_time,
    checkOutTime: v.check_out_time || undefined,
    status: v.status as Visitor['status'],
    approvedAt: v.approved_at || undefined,
    approvedBy: v.approved_by || undefined,
    propertyId: v.property_id || undefined,
  });

  const fetchVisitors = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Error fetching visitors:', error);
      return;
    }
    setVisitors((data || []).map(mapRow));
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const addVisitor = (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => {
    // We need sync return for existing code, so we do optimistic + async
    const tempId = crypto.randomUUID();
    const newVisitor: Visitor = {
      ...visitor,
      id: tempId,
      checkInTime: new Date().toISOString(),
      status: 'pending',
    };
    setVisitors(prev => [newVisitor, ...prev]);

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('visitors')
        .insert({
          name: visitor.name,
          phone: visitor.phone,
          purpose: visitor.purpose,
          host_id: visitor.host || null,
          company: visitor.company || null,
          photo: visitor.photo || null,
          property_id: visitor.propertyId || null,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding visitor:', error);
        return;
      }
      // Replace temp with real
      setVisitors(prev => prev.map(v => v.id === tempId ? mapRow(data) : v));
    })();

    return newVisitor;
  };

  const approveVisitor = async (id: string, approvedBy: string) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'checked-in' as const, approvedAt: new Date().toISOString(), approvedBy } : v));

    await supabase.from('visitors').update({
      status: 'checked-in',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    }).eq('id', id);
  };

  const rejectVisitor = async (id: string, rejectedBy: string) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected' as const, approvedAt: new Date().toISOString(), approvedBy: rejectedBy } : v));

    await supabase.from('visitors').update({
      status: 'rejected',
      approved_at: new Date().toISOString(),
      approved_by: rejectedBy,
    }).eq('id', id);
  };

  const checkOutVisitor = async (id: string) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'checked-out' as const, checkOutTime: new Date().toISOString() } : v));

    await supabase.from('visitors').update({
      status: 'checked-out',
      check_out_time: new Date().toISOString(),
    }).eq('id', id);
  };

  const deleteVisitor = async (id: string) => {
    setVisitors(prev => prev.filter(v => v.id !== id));
    await supabase.from('visitors').delete().eq('id', id);
  };

  const searchVisitors = (query: string) => {
    if (!query.trim()) return visitors;
    const lower = query.toLowerCase();
    return visitors.filter(v =>
      v.name.toLowerCase().includes(lower) ||
      v.phone.includes(query) ||
      v.host.toLowerCase().includes(lower) ||
      v.company?.toLowerCase().includes(lower)
    );
  };

  const filterByDate = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate && !endDate) return visitors;
    return visitors.filter(v => {
      const checkIn = new Date(v.checkInTime);
      if (startDate && endDate) return checkIn >= startDate && checkIn <= endDate;
      if (startDate) return checkIn >= startDate;
      if (endDate) return checkIn <= endDate;
      return true;
    });
  };

  const getPendingVisitors = () => visitors.filter(v => v.status === 'pending');

  return {
    visitors,
    addVisitor,
    approveVisitor,
    rejectVisitor,
    checkOutVisitor,
    deleteVisitor,
    searchVisitors,
    filterByDate,
    getPendingVisitors,
  };
};
