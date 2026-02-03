import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download,
  FileText
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '@/services/api';
import { Event } from '@/types/event';
import { User } from '@/types/user';

// Mock attendance data for charts
const attendanceByMonth = [
  { month: 'Jan', attendance: 120, events: 5 },
  { month: 'Feb', attendance: 180, events: 7 },
  { month: 'Mar', attendance: 240, events: 9 },
  { month: 'Apr', attendance: 280, events: 11 },
  { month: 'May', attendance: 320, events: 12 },
  { month: 'Jun', attendance: 260, events: 8 },
];

const eventsByCategory = [
  { name: 'Academic', value: 25, color: 'hsl(var(--chart-1))' },
  { name: 'Sports', value: 18, color: 'hsl(var(--chart-2))' },
  { name: 'Cultural', value: 22, color: 'hsl(var(--chart-3))' },
  { name: 'Workshop', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Seminar', value: 12, color: 'hsl(var(--chart-5))' },
  { name: 'Social', value: 8, color: 'hsl(220 70% 50%)' },
];

const userEngagement = [
  { week: 'Week 1', logins: 450, registrations: 120, checkIns: 85 },
  { week: 'Week 2', logins: 520, registrations: 145, checkIns: 110 },
  { week: 'Week 3', logins: 480, registrations: 130, checkIns: 95 },
  { week: 'Week 4', logins: 580, registrations: 160, checkIns: 125 },
];

const eventPerformance = [
  { name: 'AI Workshop', registered: 150, attended: 120, capacity: 200 },
  { name: 'Sports Day', registered: 280, attended: 245, capacity: 300 },
  { name: 'Cultural Fest', registered: 400, attended: 380, capacity: 500 },
  { name: 'Career Seminar', registered: 180, attended: 160, capacity: 200 },
  { name: 'Music Night', registered: 220, attended: 200, capacity: 250 },
];

export default function Reports() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, usersData] = await Promise.all([
          api.events.getAll(),
          api.users.getAll(),
        ]);
        setEvents(eventsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate real stats from data
  const totalEvents = events.length;
  const totalUsers = users.length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAttendance = events.reduce((sum, e) => sum + (e.registered || 0), 0);
  const avgAttendanceRate = totalEvents > 0 
    ? Math.round((totalAttendance / Math.max(events.reduce((sum, e) => sum + (e.capacity || 0), 0), 1)) * 100)
    : 0;

  const exportReport = (format: 'csv' | 'pdf') => {
    // Generate CSV data
    if (format === 'csv') {
      const headers = ['Metric', 'Value'];
      const data = [
        ['Total Events', totalEvents.toString()],
        ['Total Users', totalUsers.toString()],
        ['Total Students', totalStudents.toString()],
        ['Total Registrations', totalAttendance.toString()],
        ['Avg Attendance Rate', `${avgAttendanceRate}%`],
      ];

      const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">System Reports</h1>
            <p className="text-muted-foreground">Analytics and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-950">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-950">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-950">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{totalAttendance}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-950">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Fill Rate</p>
                <p className="text-2xl font-bold">{avgAttendanceRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance">Attendance Trends</TabsTrigger>
            <TabsTrigger value="events">Event Performance</TabsTrigger>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Attendance Trend
                  </CardTitle>
                  <CardDescription>Total attendance and events per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={attendanceByMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="attendance" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)" 
                          name="Attendance"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Events by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Events by Category
                  </CardTitle>
                  <CardDescription>Distribution of events across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={eventsByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {eventsByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {/* Event Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Event Performance Comparison
                </CardTitle>
                <CardDescription>Registration vs attendance for recent events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="capacity" fill="hsl(var(--muted))" name="Capacity" />
                      <Bar dataKey="registered" fill="hsl(var(--primary) / 0.6)" name="Registered" />
                      <Bar dataKey="attended" fill="hsl(var(--primary))" name="Attended" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Events</CardTitle>
                <CardDescription>Events with highest attendance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Event</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Registered</th>
                        <th className="pb-3 font-medium">Capacity</th>
                        <th className="pb-3 font-medium">Fill Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {events.slice(0, 5).map((event) => (
                        <tr key={event.id} className="hover:bg-muted/50">
                          <td className="py-3 font-medium">{event.title}</td>
                          <td className="capitalize">{event.category}</td>
                          <td>{event.registered || 0}</td>
                          <td>{event.capacity}</td>
                          <td>
                            <span className="font-medium">
                              {Math.round(((event.registered || 0) / event.capacity) * 100)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {/* User Engagement Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Weekly User Engagement
                </CardTitle>
                <CardDescription>Logins, registrations, and check-ins per week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userEngagement}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="logins" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2}
                        name="Logins"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="registrations" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        name="Registrations"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="checkIns" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        name="Check-ins"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Statistics */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-bold">{users.filter(u => u.role === 'student').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Event Managers</span>
                      <span className="font-bold">{users.filter(u => u.role === 'event_manager').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Admins</span>
                      <span className="font-bold">{users.filter(u => u.role === 'admin').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active</span>
                      <span className="font-bold text-green-600">{users.filter(u => u.status === 'active').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-bold text-orange-600">{users.filter(u => u.status === 'pending').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Suspended</span>
                      <span className="font-bold text-red-600">{users.filter(u => u.status === 'suspended').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg. Events/User</span>
                      <span className="font-bold">
                        {totalStudents > 0 ? (totalAttendance / totalStudents).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Rate</span>
                      <span className="font-bold">
                        {totalUsers > 0 ? Math.round((users.filter(u => u.status === 'active').length / totalUsers) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Check-in Rate</span>
                      <span className="font-bold">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
