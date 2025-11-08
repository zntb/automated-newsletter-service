// app/unsubscribe/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MailX, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { unsubscribeWithReason } from '@/app/actions/preferences';

const unsubscribeReasons = [
  { id: 'too_frequent', label: 'Emails are too frequent' },
  { id: 'not_relevant', label: 'Content is not relevant to me' },
  { id: 'too_many', label: 'I receive too many emails in general' },
  { id: 'never_signed', label: 'I never signed up for this' },
  { id: 'privacy', label: 'Privacy concerns' },
  { id: 'other', label: 'Other reason' },
];

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [step, setStep] = useState<'confirm' | 'feedback' | 'complete'>(
    'confirm',
  );
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId],
    );
  };

  const handleUnsubscribe = async () => {
    if (!email || !token) {
      toast.error('Invalid unsubscribe link');
      return;
    }

    setLoading(true);
    try {
      const reasonText =
        selectedReasons
          .map(id => {
            const reason = unsubscribeReasons.find(r => r.id === id);
            return reason?.label || id;
          })
          .join(', ') + (otherReason ? ` - ${otherReason}` : '');

      const result = await unsubscribeWithReason(email, token, reasonText);

      if (result.success) {
        setStep('complete');
      } else {
        toast.error('Error', {
          description: result.error || 'Failed to unsubscribe',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to unsubscribe');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className='min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full p-8 text-center'>
          <MailX className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-bold mb-2'>Invalid Link</h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            This unsubscribe link is invalid or has expired.
          </p>
          <Button
            onClick={() => (window.location.href = '/')}
            variant='outline'
          >
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Step 1: Confirm */}
        {step === 'confirm' && (
          <Card className='p-8'>
            <div className='text-center space-y-6'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-red-400 to-orange-600 rounded-full'>
                <MailX className='w-8 h-8 text-white' />
              </div>

              <div>
                <h1 className='text-3xl font-bold mb-2'>
                  We&apos;re Sorry to See You Go
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  Are you sure you want to unsubscribe from{' '}
                  <strong>{email}</strong>?
                </p>
              </div>

              <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6'>
                <h3 className='font-semibold mb-3'>Before you go, consider:</h3>
                <ul className='text-left space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-0.5'>•</span>
                    <span>
                      You can adjust email frequency instead of unsubscribing
                      completely
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-0.5'>•</span>
                    <span>
                      Choose only the topics you&apos;re interested in
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-0.5'>•</span>
                    <span>
                      Manage your preferences to get content that matters to you
                    </span>
                  </li>
                </ul>
              </div>

              <div className='flex flex-col gap-3'>
                <Button
                  onClick={() =>
                    (window.location.href = `/manage-preferences?email=${email}&token=${token}`)
                  }
                  className='w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Manage Preferences Instead
                </Button>
                <Button
                  onClick={() => setStep('feedback')}
                  variant='outline'
                  className='w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                >
                  Continue to Unsubscribe
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Feedback */}
        {step === 'feedback' && (
          <Card className='p-8'>
            <div className='space-y-6'>
              <div>
                <h2 className='text-2xl font-bold mb-2'>Help Us Improve</h2>
                <p className='text-gray-600 dark:text-gray-400'>
                  We&apos;d love to know why you&apos;re leaving (optional)
                </p>
              </div>

              <div className='space-y-3'>
                {unsubscribeReasons.map(reason => (
                  <div
                    key={reason.id}
                    onClick={() => handleReasonToggle(reason.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedReasons.includes(reason.id)
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Checkbox
                        checked={selectedReasons.includes(reason.id)}
                        onCheckedChange={() => handleReasonToggle(reason.id)}
                      />
                      <label className='cursor-pointer flex-1'>
                        {reason.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {selectedReasons.includes('other') && (
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Please tell us more (optional)
                  </label>
                  <textarea
                    value={otherReason}
                    onChange={e => setOtherReason(e.target.value)}
                    placeholder='Your feedback helps us improve...'
                    className='w-full h-24 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500'
                  />
                </div>
              )}

              <div className='flex flex-col gap-3'>
                <Button
                  onClick={handleUnsubscribe}
                  disabled={loading}
                  className='w-full bg-red-600 hover:bg-red-700 text-white'
                >
                  {loading ? 'Processing...' : 'Complete Unsubscribe'}
                </Button>
                <Button
                  onClick={() => setStep('confirm')}
                  variant='outline'
                  className='w-full'
                >
                  Go Back
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <Card className='p-8'>
            <div className='text-center space-y-6'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full'>
                <CheckCircle className='w-10 h-10 text-white' />
              </div>

              <div>
                <h2 className='text-3xl font-bold mb-2'>
                  You&apos;ve Been Unsubscribed
                </h2>
                <p className='text-gray-600 dark:text-gray-400 text-lg'>
                  We&apos;ve removed <strong>{email}</strong> from our mailing
                  list.
                </p>
              </div>

              <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6'>
                <Mail className='w-8 h-8 text-blue-500 mx-auto mb-3' />
                <h3 className='font-semibold mb-2'>📧 Check Your Email</h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  We've sent a confirmation email to <strong>{email}</strong>{' '}
                  with details about your unsubscribe request.
                </p>
              </div>

              <div className='bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
                <h3 className='font-semibold mb-2'>What happens next?</h3>
                <ul className='text-left space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-500 mt-0.5'>✓</span>
                    <span>
                      You&apos;ll stop receiving newsletters within 48 hours
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-500 mt-0.5'>✓</span>
                    <span>
                      We&apos;ve saved your feedback to improve our service
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-500 mt-0.5'>✓</span>
                    <span>You can resubscribe anytime from our homepage</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-500 mt-0.5'>✓</span>
                    <span>Check your email for a confirmation message</span>
                  </li>
                </ul>
              </div>

              {selectedReasons.length > 0 && (
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  <p className='font-semibold mb-2'>
                    Thank you for your feedback:
                  </p>
                  <p className='italic'>
                    {selectedReasons
                      .map(
                        id => unsubscribeReasons.find(r => r.id === id)?.label,
                      )
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}

              <Button
                onClick={() => (window.location.href = '/')}
                variant='outline'
                className='w-full'
              >
                Return to Homepage
              </Button>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className='text-center mt-8 text-sm text-gray-600 dark:text-gray-400'>
          <p>
            Changed your mind? You can always resubscribe from our homepage.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
          </div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
