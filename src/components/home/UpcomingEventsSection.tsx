import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/events/EventCard';
import { mockEvents } from '@/data/mockEvents';

const UpcomingEventsSection = () => {
  // Get first 5 events for homepage preview
  const featuredEvents = mockEvents.slice(0, 5);

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
          {/* Featured event takes 2 columns on larger screens */}
          <EventCard event={featuredEvents[0]} featured />
          
          {/* Regular event cards */}
          {featuredEvents.slice(1, 4).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
