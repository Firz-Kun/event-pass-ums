import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, QrCode, MoreHorizontal, Eye, XCircle, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { eventsAPI } from '@/services/api';
import { getCategoryColor, getCategoryLabel } from '@/lib/categoryUtils';
import { Event, EventStatus, EventCategory } from '@/types/event';

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all');
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
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
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
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

  const handleEditSave = async () => {
    if (!editEvent) return;
    
    try {
      await eventsAPI.update(editEvent.id, editEvent);
      setEvents(events.map((e) => (e.id === editEvent.id ? editEvent : e)));
      setEditEvent(null);
      toast({
        title: 'Event Updated',
        description: 'Event has been successfully updated',
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update event',
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

  const categories: EventCategory[] = ['academic', 'sports', 'cultural', 'workshop', 'seminar', 'competition', 'social'];

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">All Events</h1>
            <p className="text-muted-foreground">View and manage all system events</p>
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
                  placeholder="Search by title, venue, or organizer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as EventCategory | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{events.filter(e => e.status === 'upcoming').length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{events.filter(e => e.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{events.filter(e => e.status === 'cancelled').length}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

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
                    <th className="pb-3 font-medium">Organizer</th>
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
                      <td className="text-sm">{event.organizer}</td>
                      <td>
                        <span className="font-medium">{event.registered || 0}</span>
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
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditEvent(event)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/events/${event.id}`}>
                                <QrCode className="mr-2 h-4 w-4" />
                                View QR Code
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {event.status === 'upcoming' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'ongoing')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Ongoing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'cancelled')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Event
                                </DropdownMenuItem>
                              </>
                            )}
                            {event.status === 'ongoing' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
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
              
              {filteredEvents.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No events found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteEvent} onOpenChange={() => setDeleteEvent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteEvent?.title}"? This action cannot be undone and will remove all associated registrations and attendance records.
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

        {/* Edit Event Dialog */}
        <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the event details below
              </DialogDescription>
            </DialogHeader>
            {editEvent && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editEvent.title}
                    onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editEvent.description}
                    onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editEvent.date}
                      onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={editEvent.time}
                      onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={editEvent.venue}
                      onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={editEvent.capacity}
                      onChange={(e) => setEditEvent({ ...editEvent, capacity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={editEvent.category} 
                      onValueChange={(v) => setEditEvent({ ...editEvent, category: v as EventCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={editEvent.status} 
                      onValueChange={(v) => setEditEvent({ ...editEvent, status: v as EventStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    value={editEvent.organizer}
                    onChange={(e) => setEditEvent({ ...editEvent, organizer: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditEvent(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
