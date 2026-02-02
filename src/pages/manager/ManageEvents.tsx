import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, QrCode, Copy, MoreHorizontal, XCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { eventsAPI } from '@/services/api';
import { getCategoryColor, getCategoryLabel } from '@/data/mockEvents';
import { Event, EventStatus } from '@/types/event';

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (event: Event) => {
    try {
      await eventsAPI.delete(event.id);
      setEvents(events.filter((e) => e.id !== event.id));
      setDeleteEvent(null);
      toast({
        title: 'Event Deleted',
        description: `"${event.title}" has been deleted`,
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (event: Event) => {
    try {
      const duplicated = {
        ...event,
        title: `${event.title} (Copy)`,
        registered_count: 0,
        status: 'upcoming' as EventStatus,
      };
      
      const newEvent = await eventsAPI.create(duplicated);
      setEvents([...events, newEvent]);
      toast({
        title: 'Event Duplicated',
        description: 'A copy of the event has been created',
      });
    } catch (error) {
      console.error('Failed to duplicate event:', error);
      toast({
        title: 'Duplication Failed',
        description: 'Failed to duplicate event',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (eventId: string, status: EventStatus) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      await eventsAPI.update(eventId, { ...event, status });
      setEvents(events.map((e) => (e.id === eventId ? { ...e, status } : e)));
      toast({
        title: 'Status Updated',
        description: `Event status changed to ${status}`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update event status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case 'upcoming':
        return 'default';
      case 'ongoing':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading events...</p>
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
            <h1 className="font-serif text-3xl font-bold text-foreground">Manage Events</h1>
            <p className="text-muted-foreground">Create, edit, and manage your events</p>
          </div>
          <Button asChild>
            <Link to="/manager/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EventStatus | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>Events ({filteredEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Registrations</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-muted/50">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.venue}</p>
                        </div>
                      </td>
                      <td className="text-sm">
                        {new Date(event.date).toLocaleDateString()}
                        <br />
                        <span className="text-muted-foreground">{event.time}</span>
                      </td>
                      <td>
                        <Badge className={getCategoryColor(event.category)}>
                          {getCategoryLabel(event.category)}
                        </Badge>
                      </td>
                      <td>
                        <span className="font-medium">{event.registered_count || 0}</span>
                        <span className="text-muted-foreground">/{event.capacity}</span>
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/events/${event.id}`}>
                                <QrCode className="mr-2 h-4 w-4" />
                                View QR Code
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/manager/events/${event.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Event
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(event)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {event.status === 'upcoming' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'cancelled')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Event
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteEvent(event)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteEvent} onOpenChange={() => setDeleteEvent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteEvent?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteEvent && handleDelete(deleteEvent)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
