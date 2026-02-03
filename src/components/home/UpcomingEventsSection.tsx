import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/events/EventCard';
// REMOVED: import { mockEvents } from '@/lib/categoryUtils';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
// Note: If you have an Event type definition, import it here. 
// Example: import { Event } from '@/types/event';

const UpcomingEventsSection = () => {
  const [events, setEvents] = useState<any[]>([]); // Use <Event[]> if you have the type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.events.getAll();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get first 5 events for homepage preview
  const featuredEvents = events.slice(0, 5);

  if (loading) {
    return (
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="container text-center">
          <p className="text-muted-foreground">Loading upcoming events...</p>
        </div>
      </section>
    );
  }

  // Handle case where no events exist yet
  if (events.length === 0) {
    return null; // Or return a "No events found" message section
  }

  return (
    <section className="bg-muted/30 py-20 lg:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Don't miss out on these exciting campus activities
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" className="gap-2">
              View All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Featured event (Check if it exists first) */}
          {featuredEvents[0] && (
            <EventCard event={featuredEvents[0]} featured />
          )}
          
          {/* Regular event cards (Next 3 events) */}
          {featuredEvents.slice(1, 4).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsSection;