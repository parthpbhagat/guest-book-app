import { useState } from 'react';
import { Visitor } from '@/types/visitor';
import { VisitorCard } from './VisitorCard';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';

interface VisitorLogProps {
  visitors: Visitor[];
  onCheckOut: (id: string) => void;
  onDelete: (id: string) => void;
  onSearch: (query: string) => Visitor[];
}

export const VisitorLog = ({ visitors, onCheckOut, onDelete, onSearch }: VisitorLogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const displayedVisitors = searchQuery ? onSearch(searchQuery) : visitors;

  const todayVisitors = displayedVisitors.filter(
    (v) => new Date(v.checkInTime).toDateString() === new Date().toDateString()
  );
  const checkedInCount = visitors.filter((v) => v.status === 'checked-in').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Today's Visitors</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-success/20 px-2 py-1 text-success">
            {checkedInCount} Active
          </span>
          <span className="text-muted-foreground">{todayVisitors.length} Total</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or host..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {displayedVisitors.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery ? 'No visitors found' : 'No visitors yet today'}
            </p>
          </div>
        ) : (
          displayedVisitors.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              onCheckOut={onCheckOut}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
