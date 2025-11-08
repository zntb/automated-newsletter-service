'use client';

import { Mail, CheckCircle, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import SubscribeForm from '@/components/subscribe-form';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function HomeContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    const error = searchParams.get('error');

    if (confirmed === 'true') {
      toast.success('🎉 Your subscription is confirmed!', {
        description:
          "Welcome aboard! You'll start receiving our newsletter soon.",
        duration: 5000,
      });
      window.history.replaceState({}, '', '/');
    } else if (error) {
      let errorMessage = 'An error occurred. Please try again.';
      if (error === 'missing-token')
        errorMessage =
          'Invalid confirmation link. Please try subscribing again.';
      else if (error === 'confirmation-failed')
        errorMessage =
          'Failed to confirm subscription. The link may have expired.';

      toast.error('Subscription Error', {
        description: errorMessage,
        duration: 5000,
      });
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  return (
    <main className='min-h-screen bg-background text-foreground flex flex-col'>
      <Header />
      <section className='relative overflow-hidden px-4 py-20 md:py-32 flex-1'>
        <div className='mx-auto max-w-4xl'>
          <div className='text-center'>
            <div className='mb-6 inline-block rounded-full bg-primary/10 px-4 py-2'>
              <span className='text-sm font-semibold text-primary'>
                Stay Updated
              </span>
            </div>

            <h1 className='mb-6 text-4xl font-bold leading-tight md:text-6xl text-balance'>
              Get Weekly Insights
              <span className='block text-transparent bg-clip-text bg-linear-to-r from-primary to-accent'>
                Delivered to Your Inbox
              </span>
            </h1>

            <p className='mb-12 text-lg text-muted-foreground md:text-xl text-balance'>
              Subscribe to our newsletter for curated content, industry updates,
              and exclusive insights delivered every week.
            </p>

            <div className='mb-16 flex flex-col gap-8'>
              <SubscribeForm />
            </div>

            <div
              id='features'
              className='grid gap-8 md:grid-cols-3 scroll-mt-20'
            >
              <div className='flex flex-col items-center gap-3 text-center'>
                <Mail className='h-8 w-8 text-accent' />
                <h3 className='font-semibold'>Weekly Updates</h3>
                <p className='text-sm text-muted-foreground'>
                  Curated content delivered every Sunday
                </p>
              </div>
              <div className='flex flex-col items-center gap-3 text-center'>
                <CheckCircle className='h-8 w-8 text-accent' />
                <h3 className='font-semibold'>No Spam</h3>
                <p className='text-sm text-muted-foreground'>
                  Unsubscribe anytime with one click
                </p>
              </div>
              <div className='flex flex-col items-center gap-3 text-center'>
                <Zap className='h-8 w-8 text-accent' />
                <h3 className='font-semibold'>Quality Content</h3>
                <p className='text-sm text-muted-foreground'>
                  Handpicked insights for professionals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
