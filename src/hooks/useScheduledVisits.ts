import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScheduledVisit {
  id: string;
  propertyId?: string;
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

export const useScheduledVisits = () => {
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);

  const mapRow = (r: any): ScheduledVisit => ({
    id: r.id,
    propertyId: r.property_id || undefined,
    host_id: r.host_id || '',
    visitor_name: r.visitor_name,
    visitor_phone: r.visitor_phone,
    visitor_company: r.visitor_company || undefined,
    purpose: r.purpose,
    scheduled_date: r.scheduled_date,
    scheduled_time: r.scheduled_time || undefined,
    notes: r.notes || undefined,
    status: r.status as ScheduledVisit['status'],
  });

  const fetchVisits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scheduled_visits')
      .select('*')
      .order('scheduled_date', { ascending: false });

    if (error) {
      console.error('Error fetching scheduled visits:', error);
      return;
    }
    setVisits((data || []).map(mapRow));
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const addVisit = async (visit: Omit<ScheduledVisit, 'id' | 'status'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scheduled_visits')
      .insert({
        host_id: visit.host_id || null,
        visitor_name: visit.visitor_name,
        visitor_phone: visit.visitor_phone,
        visitor_company: visit.visitor_company || null,
        purpose: visit.purpose,
        scheduled_date: visit.scheduled_date,
        scheduled_time: visit.scheduled_time || null,
        notes: visit.notes || null,
        property_id: visit.propertyId || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding scheduled visit:', error);
      return;
    }
    setVisits(prev => [mapRow(data), ...prev]);
    return mapRow(data);
  };

  const updateStatus = async (id: string, status: ScheduledVisit['status']) => {
    await supabase.from('scheduled_visits').update({ status }).eq('id', id);
    setVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  const deleteVisit = async (id: string) => {
    await supabase.from('scheduled_visits').delete().eq('id', id);
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  const getUpcomingVisits = (propertyId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    return visits.filter(v =>
      v.scheduled_date >= today &&
      (v.status === 'pending' || v.status === 'confirmed') &&
      (!propertyId || !v.propertyId || v.propertyId === propertyId)
    );
  };

  const checkScheduledVisitor = (phone: string, hostId: string, propertyId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    return visits.find(v =>
      v.visitor_phone === phone &&
      v.host_id === hostId &&
      v.scheduled_date === today &&
      (v.status === 'pending' || v.status === 'confirmed') &&
      (!propertyId || !v.propertyId || v.propertyId === propertyId)
    );
  };

  return {
    visits,
    addVisit,
    updateStatus,
    deleteVisit,
    getUpcomingVisits,
    checkScheduledVisitor,
  };
};
