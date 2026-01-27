import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface DateFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
}

export const DateFilter = ({ onFilterChange }: DateFilterProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onFilterChange(date || null, endDate || null);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFilterChange(startDate || null, date || null);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange(null, null);
  };

  const hasFilters = startDate || endDate;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <CalendarIcon className="h-4 w-4" />
            {startDate ? format(startDate, 'dd MMM') : 'From'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleStartDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">to</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <CalendarIcon className="h-4 w-4" />
            {endDate ? format(endDate, 'dd MMM') : 'To'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={handleEndDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-muted-foreground">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
};
