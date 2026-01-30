import MainLayout from '@/components/layout/MainLayout';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import UpcomingEventsSection from '@/components/home/UpcomingEventsSection';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <UpcomingEventsSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
