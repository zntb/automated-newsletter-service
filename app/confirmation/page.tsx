// app/confirmation/page.tsx
'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Mail,
  AlertCircle,
  Loader2,
  Home,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

function ConfirmationContent() {
  const searchParams = useSearchParams();

  // Compute initial state from URL parameters
  const confirmed = searchParams.get('confirmed');
  const error = searchParams.get('error');
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';

  // Determine status based on URL parameters
  const getStatus = (): 'success' | 'error' => {
    if (confirmed === 'true') return 'success';
    return 'error';
  };

  const getErrorMessage = (): string => {
    if (!error) return 'Invalid confirmation request.';

    if (error === 'missing-token') {
      return 'Invalid confirmation link. Please try subscribing again.';
    } else if (error === 'confirmation-failed') {
      return 'Failed to confirm subscription. The link may have expired.';
    }

    return decodeURIComponent(error);
  };

  const status = getStatus();
  const subscriberEmail = email;
  const subscriberName = name;
  const errorMessage = getErrorMessage();

  // Show toast notifications once on mount
  useEffect(() => {
    if (status === 'success') {
      toast.success('🎉 Subscription Confirmed!', {
        description: subscriberName
          ? `Welcome aboard, ${subscriberName}! You'll start receiving our newsletter soon.`
          : "Welcome aboard! You'll start receiving our newsletter soon.",
        duration: 5000,
      });
    } else {
      toast.error('Confirmation Failed', {
        description: errorMessage,
        duration: 6000,
      });
    }
  }, [status, subscriberName, errorMessage]);

  if (status === 'error') {
    return (
      <div className='min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full p-8'>
          <div className='text-center space-y-6'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-red-400 to-orange-600 rounded-full'>
              <AlertCircle className='w-8 h-8 text-white' />
            </div>

            <div>
              <h1 className='text-3xl font-bold mb-2'>Confirmation Failed</h1>
              <p className='text-gray-600 dark:text-gray-400'>{errorMessage}</p>
            </div>

            <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
              <h3 className='font-semibold mb-2 text-amber-900 dark:text-amber-100'>
                What you can do:
              </h3>
              <ul className='text-left space-y-2 text-sm text-amber-800 dark:text-amber-200'>
                <li className='flex items-start gap-2'>
                  <span className='text-amber-500 mt-0.5'>•</span>
                  <span>Try subscribing again with a valid email address</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-amber-500 mt-0.5'>•</span>
                  <span>Check your spam folder for the confirmation email</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-amber-500 mt-0.5'>•</span>
                  <span>Contact our support team if the problem persists</span>
                </li>
              </ul>
            </div>

            <div className='flex flex-col gap-3'>
              <Button
                onClick={() => (window.location.href = '/')}
                className='w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              >
                <Home className='w-4 h-4 mr-2' />
                Return to Homepage
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant='outline'
                className='w-full'
              >
                Try Subscribing Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className='min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Success Card */}
        <Card className='p-8 mb-6'>
          <div className='text-center space-y-6'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-400 to-emerald-600 rounded-full animate-bounce'>
              <CheckCircle className='w-10 h-10 text-white' />
            </div>

            <div>
              <h1 className='text-4xl font-bold mb-2 bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                You're All Set! 🎉
              </h1>
              <p className='text-gray-600 dark:text-gray-400 text-lg'>
                {subscriberName ? `Welcome, ${subscriberName}! ` : 'Welcome! '}
                Your subscription has been confirmed.
              </p>
              {subscriberEmail && (
                <p className='text-sm text-gray-500 dark:text-gray-500 mt-2'>
                  Confirmation sent to: <strong>{subscriberEmail}</strong>
                </p>
              )}
            </div>

            <div className='bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6'>
              <Mail className='w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3' />
              <h3 className='font-semibold mb-3 text-green-900 dark:text-green-100'>
                What happens next?
              </h3>
              <ul className='text-left space-y-3 text-sm text-green-800 dark:text-green-200'>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-0.5'>✓</span>
                  <span>
                    <strong>Welcome Email:</strong> Check your inbox for a
                    welcome message with getting started tips
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-0.5'>✓</span>
                  <span>
                    <strong>First Newsletter:</strong> You'll receive your first
                    curated newsletter based on your preferences
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-0.5'>✓</span>
                  <span>
                    <strong>Stay Updated:</strong> Get weekly insights delivered
                    directly to your inbox
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-0.5'>✓</span>
                  <span>
                    <strong>Manage Anytime:</strong> Update your preferences or
                    unsubscribe easily from any email
                  </span>
                </li>
              </ul>
            </div>

            <div className='flex flex-col gap-3'>
              <Button
                onClick={() => (window.location.href = '/')}
                className='w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6'
              >
                <Home className='w-5 h-5 mr-2' />
                Return to Homepage
              </Button>
              <Button
                onClick={() => {
                  // This would need a manage preferences link with token
                  window.location.href = '/';
                }}
                variant='outline'
                className='w-full'
              >
                <Settings className='w-4 h-4 mr-2' />
                Manage My Preferences
              </Button>
            </div>
          </div>
        </Card>

        {/* Additional Info Card */}
        <Card className='p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
          <h3 className='font-semibold mb-3 flex items-center gap-2'>
            <Mail className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            Tips for a Great Experience
          </h3>
          <ul className='space-y-2 text-sm text-blue-900 dark:text-blue-100'>
            <li className='flex items-start gap-2'>
              <span className='text-blue-500 mt-0.5'>💡</span>
              <span>
                Add our email address to your contacts to ensure you never miss
                an update
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-500 mt-0.5'>💡</span>
              <span>
                Check your spam/promotions folder if you don't see our emails in
                your inbox
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-500 mt-0.5'>💡</span>
              <span>
                You can update your email preferences anytime by clicking
                "Manage Preferences" in any newsletter
              </span>
            </li>
          </ul>
        </Card>

        {/* Footer */}
        <div className='text-center mt-8 text-sm text-gray-600 dark:text-gray-400'>
          <p>Questions? Feel free to reach out to our support team.</p>
          <p className='mt-2'>
            We're committed to protecting your privacy and providing valuable
            content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
          <div className='text-center'>
            <Loader2 className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4' />
            <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
