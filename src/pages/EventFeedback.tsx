import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Send, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

const feedbackSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500),
  isAnonymous: z.boolean(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface Event {
  id: string;
  title: string;
  // Add other event properties as needed
}

export default function EventFeedback() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      isAnonymous: false,
    },
  });

  const rating = form.watch('rating');

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const eventData = await api.events.getById(id);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, toast]);

  const onSubmit = async (data: FeedbackFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    
    try {
      // Submit feedback using API
      await api.feedback.submit(id, data.rating, data.comment);

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });
      navigate(`/events/${id}`);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Event not found</p>
          <Button className="mt-4" onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </MainLayout>
    );
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <MainLayout>
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Rate This Event</CardTitle>
              <CardDescription>{event.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Star Rating */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Rating</FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className="p-1 transition-transform hover:scale-110"
                                  onMouseEnter={() => setHoveredRating(star)}
                                  onMouseLeave={() => setHoveredRating(0)}
                                  onClick={() => field.onChange(star)}
                                >
                                  <Star
                                    className={cn(
                                      'h-10 w-10 transition-colors',
                                      (hoveredRating || field.value) >= star
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    )}
                                  />
                                </button>
                              ))}
                            </div>
                            {(hoveredRating || field.value) > 0 && (
                              <p className="text-sm font-medium text-muted-foreground">
                                {ratingLabels[hoveredRating || field.value]}
                              </p>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Comment */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your experience with this event..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Anonymous Option */}
                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Submit anonymously
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
