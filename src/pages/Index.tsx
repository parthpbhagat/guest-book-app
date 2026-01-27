import { useState } from 'react';
import { VisitorForm } from '@/components/VisitorForm';
import { VisitorLog } from '@/components/VisitorLog';
import { PendingApprovals } from '@/components/PendingApprovals';
import { HostManagement } from '@/components/HostManagement';
import { useVisitors } from '@/hooks/useVisitors';
import { useHosts } from '@/hooks/useHosts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, UserPlus, Building2, Bell, Home } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { visitors, addVisitor, approveVisitor, rejectVisitor, checkOutVisitor, deleteVisitor, searchVisitors, filterByDate, getPendingVisitors } = useVisitors();
  const { hosts, addHost, updateHost, deleteHost } = useHosts();
  const [activeTab, setActiveTab] = useState('approvals');

  const pendingCount = getPendingVisitors().length;

  const handleAddVisitor = (visitor: {
    name: string;
    phone: string;
    purpose: string;
    host: string;
    company?: string;
    photo?: string;
  }) => {
    addVisitor(visitor);
    toast.success(`Check-in request sent! Waiting for owner approval.`);
    setActiveTab('approvals');
  };

  const handleApprove = (id: string, approvedBy: string) => {
    approveVisitor(id, approvedBy);
    toast.success('Visitor approved and checked in!');
  };

  const handleReject = (id: string, rejectedBy: string) => {
    rejectVisitor(id, rejectedBy);
    toast.error('Visitor entry rejected');
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approvals" className="relative flex items-center gap-1 text-xs">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 p-0 text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="checkin" className="flex items-center gap-1 text-xs">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Check In</span>
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-1 text-xs">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger value="owners" className="flex items-center gap-1 text-xs">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Owners</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-6">
            <PendingApprovals
              visitors={visitors}
              hosts={hosts}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </TabsContent>

          <TabsContent value="checkin" className="mt-6">
            <VisitorForm onSubmit={handleAddVisitor} hosts={hosts} />
          </TabsContent>

          <TabsContent value="log" className="mt-6">
            <VisitorLog
              visitors={visitors}
              hosts={hosts}
              onCheckOut={handleCheckOut}
              onDelete={handleDelete}
              onSearch={searchVisitors}
              onFilterByDate={filterByDate}
            />
          </TabsContent>

          <TabsContent value="owners" className="mt-6">
            <HostManagement
              hosts={hosts}
              onAdd={addHost}
              onUpdate={updateHost}
              onDelete={deleteHost}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
