import { Link } from 'react-router-dom';
import { 
  Calendar, 
  QrCode, 
  History, 
  Bell,
  Star,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { mockEvents } from '@/data/mockEvents';

export default function StudentDashboard() {
  const { user } = useAuth();

  // Demo data - in real app would come from attendance records
  const attendedEvents = 5;
  const upcomingRegistered = 3;
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming').slice(0, 3);

  const stats = [
    { label: 'Events Attended', value: attendedEvents, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Upcoming Registered', value: upcomingRegistered, icon: Clock, color: 'text-orange-600' },
    { label: 'Notifications', value: 2, icon: Bell, color: 'text-blue-600' },
    { label: 'Reviews Given', value: 3, icon: Star, color: 'text-yellow-600' },
  ];

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          {user?.studentId && (
            <p className="text-sm text-muted-foreground">Student ID: {user.studentId}</p>
          )}
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
              <Button variant="default" className="justify-start" asChild>
                <Link to="/scanner">
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse Events
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/student/history">
                  <History className="mr-2 h-4 w-4" />
                  My Event History
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Events happening soon on campus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {event.registered}/{event.capacity}
                      </Badge>
                      <div>
                        <Button size="sm" asChild>
                          <Link to={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link to="/events">View All Events</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Checked in at "AI & Machine Learning Workshop"</span>
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Left a 5-star review for "UMS Innovation Summit"</span>
                <span className="text-muted-foreground">Yesterday</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Registered for "Environmental Awareness Campaign"</span>
                <span className="text-muted-foreground">2 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner CTA */}
        <Card className="mt-6 border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary p-4">
                <QrCode className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ready to Check In?</h3>
                <p className="text-sm text-muted-foreground">
                  Scan the event QR code to mark your attendance
                </p>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link to="/scanner">
                <QrCode className="mr-2 h-5 w-5" />
                Open Scanner
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
