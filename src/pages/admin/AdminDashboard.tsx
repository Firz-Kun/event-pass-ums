import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  UserCheck, 
  Settings, 
  BarChart3, 
  Shield, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock 
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { User } from '@/types/user';
import { Event } from '@/types/event';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // 1. State for real data
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, eventsData] = await Promise.all([
          api.users.getAll(),
          api.events.getAll(),
        ]);
        setUsers(usersData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. Calculate stats using REAL data (replaced mockUsers/mockEvents)
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
  
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalManagers = users.filter(u => u.role === 'event_manager').length;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600' },
    { label: 'Pending Approvals', value: pendingUsers, icon: Clock, color: 'text-orange-600' },
    { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-green-600' },
    { label: 'Active Managers', value: totalManagers, icon: UserCheck, color: 'text-purple-600' },
  ];

  const quickActions = [
    { label: 'Manage Users', href: '/admin/users', icon: Users },
    { label: 'View All Events', href: '/admin/events', icon: Calendar },
    { label: 'System Reports', href: '/admin/reports', icon: BarChart3 },
  ];

  // Get last 5 users from real data
  const recentUsers = users.slice(-5).reverse();

  // 4. Loading State
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="justify-start"
                  asChild
                >
                  <Link to={action.href}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest registered accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === 'event_manager' ? 'default' : 'secondary'}>
                        {u.role === 'event_manager' ? 'Manager' : 'Student'}
                      </Badge>
                      <Badge variant={u.status === 'active' ? 'default' : u.status === 'pending' ? 'secondary' : 'destructive'}>
                        {u.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link to="/admin/users">View All Users</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Event Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Upcoming Events</span>
                  <span className="font-bold">{upcomingEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Registrations</span>
                  <span className="font-bold">
                    {/* Updated to use 'events' state */}
                    {events.reduce((sum, e) => sum + (e.registered || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Capacity</span>
                  <span className="font-bold">
                    {/* Updated to use 'events' state */}
                    {events.reduce((sum, e) => sum + (e.capacity || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. Fill Rate</span>
                  <span className="font-bold">
                    {/* Added safety check for division by zero */}
                    {events.length > 0 ? Math.round(
                      (events.reduce((sum, e) => sum + (e.registered || 0), 0) /
                        Math.max(events.reduce((sum, e) => sum + (e.capacity || 0), 0), 1)) *
                        100
                    ) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers > 0 ? (
                  <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">{pendingUsers} users awaiting approval</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link to="/admin/users?status=pending">Review</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All caught up! No pending actions.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}