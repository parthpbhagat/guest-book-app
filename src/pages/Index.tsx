import { useState, useEffect } from 'react';
import { VisitorForm } from '@/components/VisitorForm';
import { VisitorLog } from '@/components/VisitorLog';
import { PendingApprovals } from '@/components/PendingApprovals';
import { HostManagement } from '@/components/HostManagement';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PropertySelector } from '@/components/PropertySelector';
import { QRScanner } from '@/components/QRScanner';
import { PreRegistrationManagement } from '@/components/PreRegistrationManagement';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useVisitors } from '@/hooks/useVisitors';
import { useHosts } from '@/hooks/useHosts';
import { useProperties } from '@/hooks/useProperties';
import { usePreRegistration } from '@/hooks/usePreRegistration';
import { useNotifications } from '@/hooks/useNotifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, UserPlus, Building2, Bell, Home, BarChart3, QrCode, UserCheck, Settings } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { visitors, addVisitor, approveVisitor, rejectVisitor, checkOutVisitor, deleteVisitor, searchVisitors, filterByDate, getPendingVisitors } = useVisitors();
  const { hosts, addHost, updateHost, deleteHost } = useHosts();
  const { properties, activeProperty, activePropertyId, addProperty, updateProperty, deleteProperty, setActiveProperty } = useProperties();
  const { preRegistered, addPreRegistration, updatePreRegistration, deletePreRegistration, toggleActive, checkPreRegistered } = usePreRegistration();
  const { isSupported, permission, requestPermission, notifyVisitorArrival, notifyApproval } = useNotifications();
  const [activeTab, setActiveTab] = useState('approvals');

  const pendingCount = getPendingVisitors().length;

  // Filter data by active property
  const filteredHosts = activePropertyId 
    ? hosts.filter(h => !h.propertyId || h.propertyId === activePropertyId)
    : hosts;
  
  const filteredVisitors = activePropertyId
    ? visitors.filter(v => !v.propertyId || v.propertyId === activePropertyId)
    : visitors;

  const filteredPreRegistered = activePropertyId
    ? preRegistered.filter(p => !p.propertyId || p.propertyId === activePropertyId)
    : preRegistered;

  const handleAddVisitor = (visitor: {
    name: string;
    phone: string;
    purpose: string;
    host: string;
    company?: string;
    photo?: string;
  }) => {
    // Check if visitor is pre-registered
    const preReg = checkPreRegistered(visitor.phone, visitor.host, activePropertyId || undefined);
    
    const visitorWithProperty = {
      ...visitor,
      propertyId: activePropertyId || undefined,
    };

    if (preReg) {
      // Auto-approve pre-registered visitors
      const newVisitor = addVisitor(visitorWithProperty);
      const host = hosts.find(h => h.id === visitor.host);
      approveVisitor(newVisitor.id, 'Auto-Approved (Pre-Registered)');
      toast.success(`${visitor.name} auto-approved! (Pre-registered visitor)`);
      if (host) {
        notifyVisitorArrival(visitor.name, host.flatNumber, visitor.purpose);
      }
    } else {
      addVisitor(visitorWithProperty);
      const host = hosts.find(h => h.id === visitor.host);
      toast.success(`Check-in request sent! Waiting for owner approval.`);
      if (host) {
        notifyVisitorArrival(visitor.name, host.flatNumber, visitor.purpose);
      }
      setActiveTab('approvals');
    }
  };

  const handleApprove = (id: string, approvedBy: string) => {
    approveVisitor(id, approvedBy);
    const visitor = visitors.find(v => v.id === id);
    toast.success('Visitor approved and checked in!');
    if (visitor) {
      notifyApproval(visitor.name, true);
    }
  };

  const handleReject = (id: string, rejectedBy: string) => {
    rejectVisitor(id, rejectedBy);
    const visitor = visitors.find(v => v.id === id);
    toast.error('Visitor entry rejected');
    if (visitor) {
      notifyApproval(visitor.name, false);
    }
  };

  const handleCheckOut = (id: string) => {
    checkOutVisitor(id);
    toast.success('Visitor checked out successfully!');
  };

  const handleDelete = (id: string) => {
    deleteVisitor(id);
    toast.success('Visitor record deleted');
  };

  const handleAddHost = (host: { name: string; phone: string; flatNumber: string }) => {
    addHost({
      ...host,
      propertyId: activePropertyId || undefined,
    });
  };

  const handleAddPreReg = (visitor: Omit<typeof preRegistered[0], 'id' | 'isActive'>) => {
    addPreRegistration({
      ...visitor,
      propertyId: activePropertyId || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg flex-col gap-3 px-4 py-3 sm:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-button">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Visitor Book</h1>
                <p className="text-xs text-muted-foreground">Entry Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PropertySelector
              properties={properties}
              activeProperty={activeProperty}
              onSelect={setActiveProperty}
              onAdd={addProperty}
              onUpdate={updateProperty}
              onDelete={deleteProperty}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-lg px-4 py-6 sm:max-w-2xl lg:max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8">
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
            <TabsTrigger value="scan" className="flex items-center gap-1 text-xs">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-1 text-xs">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger value="prereg" className="flex items-center gap-1 text-xs">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Pre-Reg</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="owners" className="flex items-center gap-1 text-xs">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Owners</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-xs">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-6">
            <PendingApprovals
              visitors={filteredVisitors}
              hosts={filteredHosts}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </TabsContent>

          <TabsContent value="checkin" className="mt-6">
            <VisitorForm onSubmit={handleAddVisitor} hosts={filteredHosts} />
          </TabsContent>

          <TabsContent value="scan" className="mt-6">
            <QRScanner
              visitors={filteredVisitors}
              hosts={filteredHosts}
              onCheckOut={handleCheckOut}
            />
          </TabsContent>

          <TabsContent value="log" className="mt-6">
            <VisitorLog
              visitors={filteredVisitors}
              hosts={filteredHosts}
              onCheckOut={handleCheckOut}
              onDelete={handleDelete}
              onSearch={searchVisitors}
              onFilterByDate={filterByDate}
            />
          </TabsContent>

          <TabsContent value="prereg" className="mt-6">
            <PreRegistrationManagement
              preRegistered={filteredPreRegistered}
              hosts={filteredHosts}
              onAdd={handleAddPreReg}
              onUpdate={updatePreRegistration}
              onDelete={deletePreRegistration}
              onToggleActive={toggleActive}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard visitors={filteredVisitors} hosts={filteredHosts} />
          </TabsContent>

          <TabsContent value="owners" className="mt-6">
            <HostManagement
              hosts={filteredHosts}
              onAdd={handleAddHost}
              onUpdate={updateHost}
              onDelete={deleteHost}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Settings className="h-5 w-5 text-primary" />
                Settings
              </h2>
              <NotificationSettings
                isSupported={isSupported}
                permission={permission}
                onRequestPermission={requestPermission}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
