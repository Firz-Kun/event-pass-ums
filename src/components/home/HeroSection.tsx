import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, QrCode, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden hero-gradient py-24 lg:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-accent/5 blur-2xl animate-float" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Universiti Malaysia Sabah Official Platform</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Campus Events,{' '}
            <span className="text-gradient">Simplified</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
            Discover, attend, and track campus events with seamless QR-based check-in. 
            Your one-stop platform for all UMS events and activities.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/events">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-5 w-5" />
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/scanner">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                <QrCode className="mr-2 h-5 w-5" />
                Scan to Check-in
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-primary-foreground/10 pt-10">
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">500+</div>
              <div className="mt-1 text-sm text-primary-foreground/70">Events Yearly</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">20k+</div>
              <div className="mt-1 text-sm text-primary-foreground/70">Active Students</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">50+</div>
              <div className="mt-1 text-sm text-primary-foreground/70">Campus Venues</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
