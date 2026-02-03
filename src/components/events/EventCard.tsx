import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/event';
import { getCategoryColor, getCategoryLabel } from '@/lib/categoryUtils';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard = ({ event, featured = false }: EventCardProps) => {
  const spotsLeft = event.capacity - event.registered;
  const isFilling = spotsLeft < event.capacity * 0.2;

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        'group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        featured && 'md:col-span-2 md:grid md:grid-cols-2'
      )}
    >
      {/* Image */}
      <div className={cn('relative overflow-hidden', featured ? 'h-64 md:h-full' : 'h-48')}>
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge className={cn('absolute left-3 top-3', getCategoryColor(event.category))}>
          {getCategoryLabel(event.category)}
        </Badge>
        {isFilling && (
          <Badge variant="destructive" className="absolute right-3 top-3">
            Filling Fast!
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-5">
        <h3 className={cn(
          'font-serif font-bold text-card-foreground transition-colors group-hover:text-primary',
          featured ? 'text-xl md:text-2xl' : 'text-lg'
        )}>
          {event.title}
        </h3>

        <p className={cn(
          'mt-2 line-clamp-2 text-muted-foreground',
          featured ? 'text-sm md:text-base' : 'text-sm'
        )}>
          {event.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{new Date(event.date).toLocaleDateString('en-MY', { 
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {event.registered}/{event.capacity} registered
            </span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-primary group-hover:bg-primary/10">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
