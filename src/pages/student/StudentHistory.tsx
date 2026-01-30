import { Link } from 'react-router-dom';
import { Calendar, History, QrCode } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockEvents } from '@/data/mockEvents';

export default function StudentHistory() {
  // Mock attended events - in real app would come from attendance records
  const attendedEventIds = ['1', '4', '5'];
  const attendedEvents = mockEvents.filter((e) => attendedEventIds.includes(e.id));

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">My Event History</h1>
          <p className="text-muted-foreground">View your past event attendance</p>
        </div>

        {attendedEvents.length > 0 ? (
          <div className="grid gap-4">
            {attendedEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="default" className="bg-green-600">
                      Attended
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/events/${event.id}/feedback`}>
                        Leave Feedback
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">No Events Yet</h3>
              <p className="mb-4 text-muted-foreground">You haven't attended any events yet</p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/scanner">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
