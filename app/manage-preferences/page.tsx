/* eslint-disable @typescript-eslint/no-explicit-any */
// app/manage-preferences/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Settings,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getSubscriberPreferences,
  updateSubscriberPreferences,
} from '@/app/actions/preferences';

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
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
  { id: 'finance', name: 'Finance', icon: '💰' },
  { id: 'marketing', name: 'Marketing', icon: '📊' },
  { id: 'design', name: 'Design', icon: '🎨' },
  { id: 'development', name: 'Development', icon: '⚡' },
  { id: 'productivity', name: 'Productivity', icon: '✅' },
];

function ManagePreferencesContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [frequency, setFrequency] = useState('WEEKLY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [subscriberName, setSubscriberName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (email) {
      loadPreferences();
    } else {
      setError('Invalid or missing email parameter');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const loadPreferences = async () => {
    if (!email) return;

    try {
      const result = await getSubscriberPreferences(email);
      if (result.success && result.preferences) {
        setFrequency(result.preferences.frequency);
        setSelectedCategories(result.preferences.categories);
        setSubscriberName(result.preferences.name || '');
      } else {
        setError(result.error || 'Failed to load preferences');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleSave = async () => {
    if (!email || !token) {
      toast.error('Invalid parameters');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setSaving(true);
    try {
      const result = await updateSubscriberPreferences(email, token, {
        frequency: frequency as any,
        categories: selectedCategories,
      });

      if (result.success) {
        toast.success('Preferences updated!', {
          description: 'Your changes have been saved successfully.',
        });
      } else {
        toast.error('Error', {
          description: result.error || 'Failed to update preferences',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>
            Loading your preferences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full p-8 text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-bold mb-2'>Error</h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
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
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mb-4'>
            <Settings className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-4xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Manage Your Preferences
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Hi {subscriberName}! Update how and what you want to receive from
            us.
          </p>
        </div>

        {/* Email Frequency */}
        <Card className='p-8 mb-6'>
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold mb-2 flex items-center gap-2'>
                <Calendar className='w-6 h-6 text-blue-500' />
                Email Frequency
              </h2>
              <p className='text-gray-600 dark:text-gray-400'>
                How often would you like to hear from us?
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
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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

        {/* Content Categories */}
        <Card className='p-8 mb-6'>
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold mb-2 flex items-center gap-2'>
                <Mail className='w-6 h-6 text-blue-500' />
                Content Categories
              </h2>
              <p className='text-gray-600 dark:text-gray-400'>
                Select the topics you&apos;re interested in
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
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <span className='text-xl'>{category.icon}</span>
                    <h3 className='font-semibold'>{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>

            {selectedCategories.length === 0 && (
              <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-800 dark:text-yellow-400 text-sm'>
                Please select at least one category
              </div>
            )}
          </div>
        </Card>

        {/* Save Button */}
        <div className='flex flex-col gap-4'>
          <Button
            onClick={handleSave}
            disabled={selectedCategories.length === 0 || saving}
            className='w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-6'
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <CheckCircle className='w-5 h-5 mr-2' />
                Save Preferences
              </>
            )}
          </Button>

          <Button
            onClick={() =>
              (window.location.href = `/unsubscribe?email=${email}&token=${token}`)
            }
            variant='outline'
            className='w-full'
          >
            Unsubscribe Instead
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ManagePreferencesPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
          </div>
        </div>
      }
    >
      <ManagePreferencesContent />
    </Suspense>
  );
}
