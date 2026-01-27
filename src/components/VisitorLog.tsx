import { useState } from 'react';
import { Visitor, Host } from '@/types/visitor';
import { VisitorCard } from './VisitorCard';
import { DateFilter } from './DateFilter';
import { ExportReports } from './ExportReports';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';

interface VisitorLogProps {
  visitors: Visitor[];
  hosts: Host[];
  onCheckOut: (id: string) => void;
  onDelete: (id: string) => void;
  onSearch: (query: string) => Visitor[];
  onFilterByDate: (startDate: Date | null, endDate: Date | null) => Visitor[];
}

export const VisitorLog = ({ visitors, hosts, onCheckOut, onDelete, onSearch, onFilterByDate }: VisitorLogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  let displayedVisitors = visitors;

  if (searchQuery) {
    displayedVisitors = onSearch(searchQuery);
  }

  if (dateRange.start || dateRange.end) {
    displayedVisitors = onFilterByDate(dateRange.start, dateRange.end);
    if (searchQuery) {
      displayedVisitors = displayedVisitors.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery) ||
        v.host.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }

  const todayVisitors = displayedVisitors.filter(
    (v) => new Date(v.checkInTime).toDateString() === new Date().toDateString()
  );
  const checkedInCount = visitors.filter((v) => v.status === 'checked-in').length;
  const pendingCount = visitors.filter((v) => v.status === 'pending').length;

  const handleDateFilter = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Visitor Log</h2>
        </div>
        <ExportReports visitors={displayedVisitors} hosts={hosts} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-success/20 px-2 py-1 text-success">
          {checkedInCount} Active
        </span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-warning/20 px-2 py-1 text-warning">
            {pendingCount} Pending
          </span>
        )}
        <span className="text-muted-foreground">{todayVisitors.length} Today</span>
      </div>

      <DateFilter onFilterChange={handleDateFilter} />

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
              {searchQuery || dateRange.start || dateRange.end ? 'No visitors found' : 'No visitors yet'}
            </p>
          </div>
        ) : (
          displayedVisitors.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              hosts={hosts}
              onCheckOut={onCheckOut}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
