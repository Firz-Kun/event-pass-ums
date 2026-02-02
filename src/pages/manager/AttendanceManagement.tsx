import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Filter, CheckCircle, Clock } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { eventsAPI, attendanceAPI } from '@/services/api';
import { Attendance } from '@/types/event';

export default function AttendanceManagement() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events for the dropdown
        const eventsData = await eventsAPI.getAll();
        setEvents(eventsData);

        // Note: You'll need to implement an endpoint to get all attendance records
        // For now, this will fetch attendance for each event individually
        const attendancePromises = eventsData.map(event => 
          attendanceAPI.getRecords(event.id).catch(() => [])
        );
        const attendanceArrays = await Promise.all(attendancePromises);
        const allAttendance = attendanceArrays.flat();
        setAttendance(allAttendance);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const matchesSearch =
        record.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEvent = selectedEvent === 'all' || record.eventId === selectedEvent;
      return matchesSearch && matchesEvent;
    });
  }, [attendance, searchQuery, selectedEvent]);

  const getEventName = (eventId: string) => {
    return events.find((e) => e.id === eventId)?.title || 'Unknown Event';
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Event', 'Check-in Time'];
    const rows = filteredAttendance.map((record) => [
      record.studentId,
      record.studentName,
      getEventName(record.eventId),
      new Date(record.checkedInAt).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export Complete',
      description: 'Attendance report has been downloaded',
    });
  };

  // Stats
  const uniqueStudents = new Set(filteredAttendance.map((a) => a.studentId)).size;
  const uniqueEvents = new Set(filteredAttendance.map((a) => a.eventId)).size;

  if (loading) {
    return (
      <MainLayout>
        <div className="container flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading attendance...</p>
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
            <h1 className="font-serif text-3xl font-bold text-foreground">Attendance Management</h1>
            <p className="text-muted-foreground">Track and export event attendance records</p>
          </div>
          <Button onClick={exportToCSV} disabled={filteredAttendance.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                <p className="text-2xl font-bold">{filteredAttendance.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900">
                <Filter className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Students</p>
                <p className="text-2xl font-bold">{uniqueStudents}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Events Tracked</p>
                <p className="text-2xl font-bold">{uniqueEvents}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>Showing {filteredAttendance.length} records</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium">Student</th>
                      <th className="pb-3 font-medium">Event</th>
                      <th className="pb-3 font-medium">Check-in Time</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{record.studentName}</p>
                            <p className="text-sm text-muted-foreground">{record.studentId}</p>
                          </div>
                        </td>
                        <td className="text-sm">{getEventName(record.eventId)}</td>
                        <td className="text-sm">
                          {new Date(record.checkedInAt).toLocaleString()}
                        </td>
                        <td>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Checked In
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
