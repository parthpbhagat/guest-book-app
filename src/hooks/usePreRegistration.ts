import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PreRegisteredVisitor } from '@/types/visitor';

export const usePreRegistration = () => {
  const [preRegistered, setPreRegistered] = useState<PreRegisteredVisitor[]>([]);

  const mapRow = (r: any): PreRegisteredVisitor => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    hostId: r.host_id || '',
    propertyId: r.property_id || undefined,
    purpose: r.purpose,
    validFrom: r.valid_from || undefined,
    validUntil: r.valid_until || undefined,
    frequency: r.frequency as PreRegisteredVisitor['frequency'],
    isActive: r.is_active,
    photo: r.photo || undefined,
  });

  const fetchPreRegistered = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('pre_registered_visitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pre-registered:', error);
      return;
    }
    setPreRegistered((data || []).map(mapRow));
  }, []);

  useEffect(() => {
    fetchPreRegistered();
  }, [fetchPreRegistered]);

  const addPreRegistration = async (visitor: Omit<PreRegisteredVisitor, 'id' | 'isActive'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('pre_registered_visitors')
      .insert({
        name: visitor.name,
        phone: visitor.phone,
        host_id: visitor.hostId || null,
        property_id: visitor.propertyId || null,
        purpose: visitor.purpose,
        valid_from: visitor.validFrom || null,
        valid_until: visitor.validUntil || null,
        frequency: visitor.frequency || 'always',
        photo: visitor.photo || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding pre-registration:', error);
      return;
    }
    setPreRegistered(prev => [mapRow(data), ...prev]);
    return mapRow(data);
  };

  const updatePreRegistration = async (id: string, updates: Partial<PreRegisteredVisitor>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.hostId !== undefined) dbUpdates.host_id = updates.hostId;
    if (updates.purpose !== undefined) dbUpdates.purpose = updates.purpose;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.validFrom !== undefined) dbUpdates.valid_from = updates.validFrom;
    if (updates.validUntil !== undefined) dbUpdates.valid_until = updates.validUntil;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    await supabase.from('pre_registered_visitors').update(dbUpdates).eq('id', id);
    setPreRegistered(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deletePreRegistration = async (id: string) => {
    await supabase.from('pre_registered_visitors').delete().eq('id', id);
    setPreRegistered(prev => prev.filter(v => v.id !== id));
  };

  const toggleActive = async (id: string) => {
    const item = preRegistered.find(v => v.id === id);
    if (!item) return;
    await supabase.from('pre_registered_visitors').update({ is_active: !item.isActive }).eq('id', id);
    setPreRegistered(prev => prev.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v));
  };

  const checkPreRegistered = (phone: string, hostId: string, propertyId?: string) => {
    const now = new Date();
    return preRegistered.find(v => {
      if (!v.isActive) return false;
      if (v.phone !== phone) return false;
      if (v.hostId !== hostId) return false;
      if (propertyId && v.propertyId && v.propertyId !== propertyId) return false;
      if (v.validFrom && new Date(v.validFrom) > now) return false;
      if (v.validUntil && new Date(v.validUntil) < now) return false;
      return true;
    });
  };

  return {
    preRegistered,
    addPreRegistration,
    updatePreRegistration,
    deletePreRegistration,
    toggleActive,
    checkPreRegistered,
  };
};
