// components/subscribe-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Mail,
  CheckCircle,
  Settings,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const frequencies = [
  { value: 'DAILY', label: 'Daily', description: 'Get updates every day' },
  { value: 'WEEKLY', label: 'Weekly', description: 'Once per week digest' },
  { value: 'MONTHLY', label: 'Monthly', description: 'Monthly summary' },
  {
    value: 'REALTIME',
    label: 'Real-time',
    description: 'Immediate notifications',
  },
];

const categories = [
  {
    id: 'tech',
    name: 'Technology',
    description: 'Latest tech news and trends',
    icon: '💻',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Business insights and strategies',
    icon: '💼',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Health, wellness, and lifestyle tips',
    icon: '🌟',
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial news and advice',
    icon: '💰',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Marketing tips and case studies',
    icon: '📊',
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI/UX and creative design',
    icon: '🎨',
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Programming and development',
    icon: '⚡',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Tools and tips to work smarter',
    icon: '✅',
  },
];

export default function SubscribeForm() {
  const [step, setStep] = useState<'email' | 'preferences' | 'confirm'>(
    'email',
  );
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('WEEKLY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'tech',
    'business',
  ]);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleCompleteSubscription = async () => {
    setError('');
    if (!email || !name) {
      setError('Name and email are required.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one topic.');
      return;
    }

    const payload = {
      email,
      name,
      frequency,
      categories: selectedCategories,
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        const msg = json?.error || 'Failed to subscribe';
        toast.error('Subscription failed', { description: msg });
        setError(msg);
        setSubmitting(false);
        return;
      }

      // Check if this was an update to existing subscription
      setIsUpdate(json.isUpdate || false);

      if (json.isUpdate) {
        toast.success('Preferences Updated!', {
          description:
            json.message || 'Your subscription preferences have been updated.',
        });
      } else {
        toast.success(
          json.message || 'Please check your email to confirm subscription',
        );
      }

      setStep('confirm');
      setSubmitting(false);
    } catch (err) {
      console.error('[subscribe] error', err);
      toast.error('Subscription failed', {
        description: 'Network or server error',
      });
      setError('Network or server error');
      setSubmitting(false);
    }
  };

  const checkExistingSubscriber = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          checkExisting: true,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        setError(json?.error || 'Failed to check subscription');
        setSubmitting(false);
        return;
      }

      if (json.isExisting) {
        // Existing subscriber - redirect to manage preferences
        toast.info('Existing Subscription Found', {
          description: 'Redirecting you to manage your preferences...',
        });

        setTimeout(() => {
          window.location.href = json.redirectUrl;
        }, 1500);
      } else {
        // New subscriber - continue to preferences
        setStep('preferences');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('[checkExisting] error', err);
      toast.error('Connection failed', {
        description: 'Please try again',
      });
      setError('Network error');
      setSubmitting(false);
    }
  };

  return (
    <div className='h-full bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mb-4'>
            <Mail className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-4xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Customize Your Newsletter
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Get content that matters to you, delivered on your schedule
          </p>
        </div>

        <div className='flex items-center justify-center mb-8'>
          <div className='flex items-center gap-2'>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'email'
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {step === 'email' ? '1' : <CheckCircle className='w-5 h-5' />}
            </div>
            <div
              className={`w-16 h-1 ${
                step !== 'email' ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'preferences'
                  ? 'bg-blue-500 text-white'
                  : step === 'confirm'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step === 'confirm' ? <CheckCircle className='w-5 h-5' /> : '2'}
            </div>
            <div
              className={`w-16 h-1 ${
                step === 'confirm' ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'confirm'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              3
            </div>
          </div>
        </div>

        {step === 'email' && (
          <Card className='p-8'>
            <div className='space-y-6'>
              <div>
                <h2 className='text-2xl font-bold mb-2 flex items-center gap-2'>
                  <Mail className='w-6 h-6 text-blue-500' />
                  Let&apos;s Start with Your Email
                </h2>
                <p className='text-gray-600 dark:text-gray-400'>
                  Already subscribed? Update your preferences by re-entering
                  your email
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>Name</label>
                <Input
                  type='text'
                  placeholder='John Doe'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className='w-full'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Email Address
                </label>
                <Input
                  type='email'
                  placeholder='you@example.com'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='w-full'
                />
              </div>

              {error && (
                <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm'>
                  {error}
                </div>
              )}

              <Button
                onClick={checkExistingSubscriber}
                className='w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                disabled={!email || !name || submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                    Checking...
                  </>
                ) : (
                  'Continue to Preferences'
                )}
              </Button>
            </div>
          </Card>
        )}

        {step === 'preferences' && (
          <div className='space-y-6'>
            <Card className='p-8'>
              <div className='space-y-6'>
                <div>
                  <h2 className='text-2xl font-bold mb-2 flex items-center gap-2'>
                    <Calendar className='w-6 h-6 text-blue-500' />
                    How Often Should We Email You?
                  </h2>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Choose the frequency that works best for you
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {frequencies.map(freq => (
                    <div
                      key={freq.value}
                      onClick={() => setFrequency(freq.value)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        frequency === freq.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            frequency === freq.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {frequency === freq.value && (
                            <div className='w-2 h-2 rounded-full bg-white' />
                          )}
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-semibold mb-1'>{freq.label}</h3>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {freq.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className='p-8'>
              <div className='space-y-6'>
                <div>
                  <h2 className='text-2xl font-bold mb-2 flex items-center gap-2'>
                    <Settings className='w-6 h-6 text-blue-500' />
                    What Topics Interest You?
                  </h2>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Select all topics you&apos;d like to receive updates about
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {categories.map(category => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() =>
                            handleCategoryToggle(category.id)
                          }
                          className='mt-1'
                        />
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-xl'>{category.icon}</span>
                            <h3 className='font-semibold'>{category.name}</h3>
                          </div>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCategories.length === 0 && (
                  <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-800 dark:text-yellow-400 text-sm'>
                    Please select at least one topic to continue
                  </div>
                )}
              </div>
            </Card>

            <div className='flex gap-4'>
              <Button
                onClick={() => setStep('email')}
                variant='outline'
                className='flex-1'
              >
                Back
              </Button>

              <Button
                onClick={() => {
                  startTransition(() => {
                    handleCompleteSubscription();
                  });
                }}
                className='flex-1 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                disabled={selectedCategories.length === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                    Processing...
                  </>
                ) : (
                  'Complete Subscription'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <Card className='p-8'>
            <div className='text-center space-y-6'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full'>
                {isUpdate ? (
                  <RefreshCw className='w-10 h-10 text-white' />
                ) : (
                  <CheckCircle className='w-10 h-10 text-white' />
                )}
              </div>

              <div>
                <h2 className='text-3xl font-bold mb-2'>
                  {isUpdate ? 'Preferences Updated!' : 'Almost There!'}
                </h2>
                <p className='text-gray-600 dark:text-gray-400 text-lg'>
                  {isUpdate ? (
                    <>
                      Your subscription preferences for <strong>{email}</strong>{' '}
                      have been updated successfully!
                    </>
                  ) : (
                    <>
                      We&apos;ve sent a confirmation email to{' '}
                      <strong>{email}</strong>
                    </>
                  )}
                </p>
              </div>

              <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6'>
                <Bell className='w-8 h-8 text-blue-500 mx-auto mb-3' />
                <h3 className='font-semibold mb-2'>Your Preferences Summary</h3>
                <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <p>
                    <strong>Frequency:</strong>{' '}
                    {frequencies.find(f => f.value === frequency)?.label}
                  </p>
                  <p>
                    <strong>Topics:</strong>{' '}
                    {selectedCategories
                      .map(id => categories.find(c => c.id === id)?.name)
                      .join(', ')}
                  </p>
                </div>
              </div>

              {!isUpdate && (
                <div className='space-y-3 text-sm text-gray-600 dark:text-gray-400'>
                  <p>
                    Click the confirmation link in your email to activate your
                    subscription.
                  </p>
                  <p>
                    Can&apos;t find it? Check your spam folder or{' '}
                    <button
                      onClick={() => {
                        setStep('email');
                        toast.info('Please re-enter your details to resend');
                      }}
                      className='text-blue-500 hover:underline'
                    >
                      resend confirmation email
                    </button>
                  </p>
                </div>
              )}

              <Button
                onClick={() => {
                  setStep('email');
                  setEmail('');
                  setName('');
                  setSelectedCategories(['tech', 'business']);
                  setFrequency('WEEKLY');
                  setIsUpdate(false);
                }}
                variant='outline'
                className='w-full'
              >
                {isUpdate
                  ? 'Update Preferences Again'
                  : 'Subscribe with Different Email'}
              </Button>
            </div>
          </Card>
        )}

        <div className='text-center mt-8 text-sm text-gray-600 dark:text-gray-400'>
          <p>
            You can update your preferences anytime from the links in our
            emails.
          </p>
          <p className='mt-2'>
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </div>
  );
}
