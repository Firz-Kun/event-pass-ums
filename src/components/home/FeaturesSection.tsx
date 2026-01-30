import { QrCode, Calendar, Users, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: QrCode,
    title: 'QR Check-in',
    description: 'Quick and contactless attendance tracking. Just scan the event QR code with your phone.',
  },
  {
    icon: Calendar,
    title: 'Event Discovery',
    description: 'Browse upcoming campus events, workshops, seminars, and cultural activities all in one place.',
  },
  {
    icon: Users,
    title: 'Real-time Tracking',
    description: 'Event organizers can monitor attendance in real-time with detailed analytics.',
  },
  {
    icon: Bell,
    title: 'Stay Updated',
    description: 'Get notified about event updates, cancellations, and new activities that match your interests.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need for
            <span className="block text-primary">Campus Events</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From discovery to attendance tracking, we've got you covered with modern tools for the digital campus experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/events">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
