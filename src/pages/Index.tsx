import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { BlacklistManagement } from '@/components/BlacklistManagement';
import { ScheduledVisits } from '@/components/ScheduledVisits';
import { useVisitors } from '@/hooks/useVisitors';
import { useHosts } from '@/hooks/useHosts';
import { useProperties } from '@/hooks/useProperties';
import { usePreRegistration } from '@/hooks/usePreRegistration';
import { useNotifications } from '@/hooks/useNotifications';
import { useBlacklist } from '@/hooks/useBlacklist';
import { useScheduledVisits } from '@/hooks/useScheduledVisits';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClipboardList, UserPlus, Building2, Bell, Home, BarChart3, QrCode, UserCheck, Settings, Ban, Calendar, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { visitors, addVisitor, approveVisitor, rejectVisitor, checkOutVisitor, deleteVisitor, searchVisitors, filterByDate, getPendingVisitors } = useVisitors();
  const { hosts, addHost, updateHost, deleteHost } = useHosts();
  const { properties, activeProperty, activePropertyId, addProperty, updateProperty, deleteProperty, setActiveProperty } = useProperties();
  const { preRegistered, addPreRegistration, updatePreRegistration, deletePreRegistration, toggleActive, checkPreRegistered } = usePreRegistration();
  const { isSupported, permission, requestPermission, notifyVisitorArrival, notifyApproval } = useNotifications();
  const { blacklisted, addToBlacklist, removeFromBlacklist, toggleActive: toggleBlacklistActive, isBlacklisted } = useBlacklist();
  const { visits, addVisit, updateStatus, deleteVisit } = useScheduledVisits();
  const [activeTab, setActiveTab] = useState('approvals');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/20" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

  const filteredBlacklisted = activePropertyId
    ? blacklisted.filter(b => !b.propertyId || b.propertyId === activePropertyId)
    : blacklisted;

  const filteredVisits = activePropertyId
    ? visits.filter(v => !v.propertyId || v.propertyId === activePropertyId)
    : visits;

  const handleAddVisitor = (visitor: {
    name: string;
    phone: string;
    purpose: string;
    host: string;
    company?: string;
    photo?: string;
  }) => {
    // Check if visitor is blacklisted
    const blacklistEntry = isBlacklisted(visitor.phone, activePropertyId || undefined);
    if (blacklistEntry) {
      toast.error(`Entry denied! ${visitor.name} is blacklisted.`, {
        description: blacklistEntry.reason || 'This visitor has been blocked from entry.',
      });
      return;
    }

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

  const handleAddBlacklist = (visitor: { name: string; phone: string; reason?: string; blacklisted_by?: string }) => {
    addToBlacklist({
      ...visitor,
      propertyId: activePropertyId || undefined,
    });
  };

  const handleAddScheduledVisit = (visit: { host_id: string; visitor_name: string; visitor_phone: string; visitor_company?: string; purpose: string; scheduled_date: string; scheduled_time?: string; notes?: string }) => {
    addVisit({
      ...visit,
      propertyId: activePropertyId || undefined,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const userInitials = user.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background safe-bottom relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex flex-col gap-3 px-4 py-3 max-w-lg sm:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Visitor Book</h1>
                <p className="text-xs text-muted-foreground">Entry Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <TabsList className="grid w-full grid-cols-5 sm:grid-cols-10 gap-1">
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
            <TabsTrigger value="scheduled" className="flex items-center gap-1 text-xs">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Scheduled</span>
            </TabsTrigger>
            <TabsTrigger value="prereg" className="flex items-center gap-1 text-xs">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Pre-Reg</span>
            </TabsTrigger>
            <TabsTrigger value="blacklist" className="flex items-center gap-1 text-xs">
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Blacklist</span>
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

          <TabsContent value="scheduled" className="mt-6">
            <ScheduledVisits
              visits={filteredVisits}
              hosts={filteredHosts}
              onAdd={handleAddScheduledVisit}
              onUpdateStatus={updateStatus}
              onDelete={deleteVisit}
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

          <TabsContent value="blacklist" className="mt-6">
            <BlacklistManagement
              blacklisted={filteredBlacklisted}
              onAdd={handleAddBlacklist}
              onRemove={removeFromBlacklist}
              onToggleActive={toggleBlacklistActive}
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
