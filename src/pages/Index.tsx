import { useState } from 'react';
import { VisitorForm } from '@/components/VisitorForm';
import { VisitorLog } from '@/components/VisitorLog';
import { useVisitors } from '@/hooks/useVisitors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, UserPlus, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { visitors, addVisitor, checkOutVisitor, deleteVisitor, searchVisitors } = useVisitors();
  const [activeTab, setActiveTab] = useState('checkin');

  const handleAddVisitor = (visitor: {
    name: string;
    phone: string;
    purpose: string;
    host: string;
    company?: string;
  }) => {
    addVisitor(visitor);
    toast.success(`${visitor.name} checked in successfully!`);
    setActiveTab('log');
  };

  const handleCheckOut = (id: string) => {
    checkOutVisitor(id);
    toast.success('Visitor checked out successfully!');
  };

  const handleDelete = (id: string) => {
    deleteVisitor(id);
    toast.success('Visitor record deleted');
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-button">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Visitor Book</h1>
            <p className="text-xs text-muted-foreground">Entry Management System</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Check In
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Visitor Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkin" className="mt-6">
            <VisitorForm onSubmit={handleAddVisitor} />
          </TabsContent>

          <TabsContent value="log" className="mt-6">
            <VisitorLog
              visitors={visitors}
              onCheckOut={handleCheckOut}
              onDelete={handleDelete}
              onSearch={searchVisitors}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
