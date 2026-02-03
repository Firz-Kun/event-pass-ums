import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Calendar, Grid, List } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import EventCard from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { eventsAPI } from '@/services/api';
import { EventCategory } from '@/types/event';
import { cn } from '@/lib/utils';
import { getCategoryLabel } from '@/lib/categoryUtils';

const categories: EventCategory[] = [
  'academic',
  'sports',
  'cultural',
  'workshop',
  'seminar',
  'competition',
  'social',
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
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
      {/* Header */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="container">
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Campus Events
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover and join upcoming events at Universiti Malaysia Sabah
          </p>

          {/* Search and Filters */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => setSelectedCategory('all')}
            >
              All Events
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryLabel(category)}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                No events found
              </h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {filteredEvents.length} event{filteredEvents.length !== 1 && 's'}
              </p>
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Events;