import { useMemo } from 'react';
import { Visitor, Host } from '@/types/visitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, UserCheck, Clock, TrendingUp, Building, Calendar, BarChart3 } from 'lucide-react';
import { format, parseISO, startOfDay, subDays, isWithinInterval } from 'date-fns';

interface AnalyticsDashboardProps {
  visitors: Visitor[];
  hosts: Host[];
}

const COLORS = ['hsl(217, 91%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 70%, 50%)'];

export const AnalyticsDashboard = ({ visitors, hosts }: AnalyticsDashboardProps) => {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    const todayVisitors = visitors.filter(
      (v) => startOfDay(parseISO(v.checkInTime)).getTime() === today.getTime()
    );

    const weekVisitors = visitors.filter((v) =>
      isWithinInterval(parseISO(v.checkInTime), { start: last7Days, end: new Date() })
    );

    const monthVisitors = visitors.filter((v) =>
      isWithinInterval(parseISO(v.checkInTime), { start: last30Days, end: new Date() })
    );

    const currentlyCheckedIn = visitors.filter((v) => v.status === 'checked-in').length;
    const pendingApprovals = visitors.filter((v) => v.status === 'pending').length;
    const approvalRate = visitors.length > 0
      ? Math.round(((visitors.filter((v) => v.status === 'checked-in' || v.status === 'checked-out').length) / visitors.length) * 100)
      : 0;

    return {
      today: todayVisitors.length,
      week: weekVisitors.length,
      month: monthVisitors.length,
      total: visitors.length,
      currentlyCheckedIn,
      pendingApprovals,
      approvalRate,
    };
  }, [visitors]);

  const dailyData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayVisitors = visitors.filter(
        (v) => startOfDay(parseISO(v.checkInTime)).getTime() === startOfDay(date).getTime()
      );
      return {
        day: format(date, 'EEE'),
        visitors: dayVisitors.length,
        approved: dayVisitors.filter((v) => v.status === 'checked-in' || v.status === 'checked-out').length,
      };
    });
    return last7Days;
  }, [visitors]);

  const hourlyData = useMemo(() => {
    const hourCounts: { [key: number]: number } = {};
    visitors.forEach((v) => {
      const hour = parseISO(v.checkInTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: i.toString().padStart(2, '0') + ':00',
      count: hourCounts[i] || 0,
    })).filter((_, i) => i >= 6 && i <= 22);
  }, [visitors]);

  const topHosts = useMemo(() => {
    const hostCounts: { [key: string]: number } = {};
    visitors.forEach((v) => {
      hostCounts[v.host] = (hostCounts[v.host] || 0) + 1;
    });

    return Object.entries(hostCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hostId, count]) => {
        const host = hosts.find((h) => h.id === hostId);
        return {
          name: host ? `${host.flatNumber}` : 'Unknown',
          fullName: host?.name || 'Unknown',
          value: count,
        };
      });
  }, [visitors, hosts]);

  const purposeData = useMemo(() => {
    const purposeCounts: { [key: string]: number } = {};
    visitors.forEach((v) => {
      const purpose = v.purpose.toLowerCase().includes('delivery')
        ? 'Delivery'
        : v.purpose.toLowerCase().includes('guest')
        ? 'Guest'
        : v.purpose.toLowerCase().includes('maintenance')
        ? 'Maintenance'
        : v.purpose.toLowerCase().includes('service')
        ? 'Service'
        : 'Other';
      purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
    });

    return Object.entries(purposeCounts).map(([name, value]) => ({ name, value }));
  }, [visitors]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-success/10 p-2">
                <UserCheck className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentlyCheckedIn}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-accent p-2">
                <TrendingUp className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approvalRate}%</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="visitors" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Peak Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Visited Flats & Purpose Distribution */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4" />
              Most Visited Flats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topHosts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topHosts.map((host, index) => (
                  <div key={host.name} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{host.name}</p>
                      <p className="text-xs text-muted-foreground">{host.fullName}</p>
                    </div>
                    <span className="text-sm font-semibold">{host.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Visit Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purposeData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={purposeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {purposeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {purposeData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="border-0 bg-primary/5 shadow-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.week}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.month}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground">All Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
