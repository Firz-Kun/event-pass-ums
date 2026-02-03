import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Users, 
  BarChart3, 
  QrCode,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  registered: number;
  capacity: number;
  category?: string;
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const events = await api.events.getAll();
        setMyEvents(events);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  // Calculate stats from real data
  const upcomingEvents = myEvents.filter(e => e.status === 'upcoming').slice(0, 3);
  const totalRegistrations = myEvents.reduce((sum, e) => sum + (e.registered || 0), 0);
  const totalCapacity = myEvents.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const avgFillRate = totalCapacity > 0 
    ? Math.round((totalRegistrations / totalCapacity) * 100) 
    : 0;

  const stats = [
    { label: 'My Events', value: myEvents.length, icon: Calendar, color: 'text-blue-600' },
    { label: 'Total Registrations', value: totalRegistrations, icon: Users, color: 'text-green-600' },
    { label: 'Upcoming', value: upcomingEvents.length, icon: Clock, color: 'text-orange-600' },
    { label: 'Avg. Fill Rate', value: `${avgFillRate}%`, icon: TrendingUp, color: 'text-purple-600' },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
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
            <h1 className="font-serif text-3xl font-bold text-foreground">Event Manager Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button asChild>
            <Link to="/manager/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
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
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/manager/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/manager/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Events
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/manager/attendance">
                  <QrCode className="mr-2 h-4 w-4" />
                  View Attendance
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/manager/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Your next scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                        <p className="text-sm text-muted-foreground">{event.venue}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {event.registered || 0}/{event.capacity || 0} registered
                        </Badge>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/events/${event.id}`}>
                              <QrCode className="mr-1 h-3 w-3" />
                              QR
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/manager/events/${event.id}/edit`}>Edit</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No upcoming events</p>
                  <Button className="mt-4" asChild>
                    <Link to="/manager/events/new">Create Your First Event</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.slice(0, 3).map((event, index) => (
                  <div key={event.id} className="flex items-center gap-4 text-sm">
                    <div className={`h-2 w-2 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      'bg-purple-500'
                    }`} />
                    <span>{event.registered || 0} registrations for "{event.title}"</span>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
