import { Link } from 'react-router-dom';
import { QrCode, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl hero-gradient p-8 sm:p-12 lg:p-16">
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-primary-foreground/10 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
              <QrCode className="h-8 w-8" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
              Ready to Check In?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Use your phone's camera to scan the event QR code and mark your attendance instantly. It's that simple!
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/scanner">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <QrCode className="mr-2 h-5 w-5" />
                  Open QR Scanner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
