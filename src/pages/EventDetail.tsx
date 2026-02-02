import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Download,
  Building,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventsAPI } from '@/services/api';
import { getCategoryColor, getCategoryLabel } from '@/data/mockEvents';
import { cn } from '@/lib/utils';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        const data = await eventsAPI.getById(id);
        setEvent(data);
      } catch (error) {
        console.error('Failed to fetch event:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading event...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center justify-center py-24 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Event Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/events">
            <Button className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const spotsLeft = event.capacity - event.registered_count;
  const percentFilled = (event.registered_count / event.capacity) * 100;
  const qrValue = `ums-emas://checkin/${event.id}`;

  const handleDownloadQR = () => {
    const svg = document.getElementById('event-qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `${event.title.replace(/\s+/g, '-')}-QR.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <MainLayout>
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="container absolute bottom-0 left-0 right-0 pb-6">
          <Link to="/events">
            <Button variant="secondary" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              All Events
            </Button>
          </Link>
        </div>
      </div>

      <section className="py-8 lg:py-12">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Badge className={cn('mb-4', getCategoryColor(event.category))}>
                {getCategoryLabel(event.category)}
              </Badge>

              <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                {event.title}
              </h1>

              <div className="mt-6 flex flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-MY', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{event.time}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <span>{event.organizer}</span>
                </div>
              </div>

              {/* Registration Progress */}
              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium text-card-foreground">Registration</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {spotsLeft} spots left
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.registered_count} of {event.capacity} registered
                </p>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  About This Event
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Sidebar - QR Code */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-center font-serif text-lg font-semibold text-card-foreground">
                  Event QR Code
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Display this QR code for students to scan and check-in
                </p>

                <div className="mt-6 flex justify-center rounded-xl bg-white p-6">
                  <QRCodeSVG
                    id="event-qr-code"
                    value={qrValue}
                    size={200}
                    level="H"
                    includeMargin
                    fgColor="#0d4a4a"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Button variant="default" className="w-full gap-2" onClick={handleDownloadQR}>
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      navigator.share?.({
                        title: event.title,
                        text: `Check out this event: ${event.title}`,
                        url: window.location.href,
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share Event
                  </Button>
                </div>

                <div className="mt-6 rounded-lg bg-secondary/50 p-4">
                  <p className="text-center text-xs text-muted-foreground">
                    Students can scan this QR code using the{' '}
                    <Link to="/scanner" className="font-medium text-primary hover:underline">
                      Check-in Scanner
                    </Link>{' '}
                    to mark their attendance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default EventDetail;