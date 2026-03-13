import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Host } from '@/types/visitor';

export const useHosts = () => {
  const [hosts, setHosts] = useState<Host[]>([]);

  const fetchHosts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('hosts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching hosts:', error);
      return;
    }

    setHosts((data || []).map(h => ({
      id: h.id,
      name: h.name,
      phone: h.phone,
      flatNumber: h.flat_number,
      propertyId: h.property_id || undefined,
    })));
  }, []);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  const addHost = async (host: Omit<Host, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('hosts')
      .insert({
        name: host.name,
        phone: host.phone,
        flat_number: host.flatNumber,
        property_id: host.propertyId || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding host:', error);
      return;
    }

    const newHost: Host = { id: data.id, name: data.name, phone: data.phone, flatNumber: data.flat_number, propertyId: data.property_id || undefined };
    setHosts(prev => [...prev, newHost]);
    return newHost;
  };

  const updateHost = async (id: string, updates: Partial<Host>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.flatNumber !== undefined) dbUpdates.flat_number = updates.flatNumber;
    if (updates.propertyId !== undefined) dbUpdates.property_id = updates.propertyId;

    const { error } = await supabase.from('hosts').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating host:', error);
      return;
    }
    setHosts(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHost = async (id: string) => {
    const { error } = await supabase.from('hosts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting host:', error);
      return;
    }
    setHosts(prev => prev.filter(h => h.id !== id));
  };

  return { hosts, addHost, updateHost, deleteHost };
};
