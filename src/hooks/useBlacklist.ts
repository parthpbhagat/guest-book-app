import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BlacklistedVisitor {
  id: string;
  name: string;
  phone: string;
  reason?: string;
  photo?: string;
  blacklisted_at: string;
  blacklisted_by?: string;
  is_active: boolean;
  propertyId?: string;
}

export const useBlacklist = () => {
  const [blacklisted, setBlacklisted] = useState<BlacklistedVisitor[]>([]);

  const fetchBlacklist = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('blacklisted_visitors')
      .select('*')
      .order('blacklisted_at', { ascending: false });

    if (error) {
      console.error('Error fetching blacklist:', error);
      return;
    }

    setBlacklisted((data || []).map(b => ({
      id: b.id,
      name: b.name,
      phone: b.phone,
      reason: b.reason || undefined,
      photo: b.photo || undefined,
      blacklisted_at: b.blacklisted_at,
      blacklisted_by: b.blacklisted_by || undefined,
      is_active: b.is_active,
      propertyId: b.property_id || undefined,
    })));
  }, []);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const addToBlacklist = async (visitor: Omit<BlacklistedVisitor, 'id' | 'blacklisted_at' | 'is_active'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('blacklisted_visitors')
      .insert({
        name: visitor.name,
        phone: visitor.phone,
        reason: visitor.reason || null,
        blacklisted_by: visitor.blacklisted_by || null,
        property_id: visitor.propertyId || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to blacklist:', error);
      return;
    }

    const newEntry: BlacklistedVisitor = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      reason: data.reason || undefined,
      blacklisted_at: data.blacklisted_at,
      blacklisted_by: data.blacklisted_by || undefined,
      is_active: data.is_active,
      propertyId: data.property_id || undefined,
    };
    setBlacklisted(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const removeFromBlacklist = async (id: string) => {
    await supabase.from('blacklisted_visitors').delete().eq('id', id);
    setBlacklisted(prev => prev.filter(v => v.id !== id));
  };

  const toggleActive = async (id: string) => {
    const item = blacklisted.find(v => v.id === id);
    if (!item) return;

    await supabase.from('blacklisted_visitors').update({ is_active: !item.is_active }).eq('id', id);
    setBlacklisted(prev => prev.map(v => v.id === id ? { ...v, is_active: !v.is_active } : v));
  };

  const isBlacklisted = (phone: string, propertyId?: string): BlacklistedVisitor | undefined => {
    return blacklisted.find(v =>
      v.phone === phone && v.is_active &&
      (!propertyId || !v.propertyId || v.propertyId === propertyId)
    );
  };

  return {
    blacklisted,
    addToBlacklist,
    removeFromBlacklist,
    toggleActive,
    isBlacklisted,
  };
};
