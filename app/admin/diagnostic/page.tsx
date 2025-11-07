/* eslint-disable @typescript-eslint/no-explicit-any */
// Create this file: app/admin/diagnostic/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DiagnosticPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailConfig, setEmailConfig] = useState<any>({});

  const checkSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostic/subscribers');
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Failed to check subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostic/email-config');
      const data = await response.json();
      setEmailConfig(data);
    } catch (error) {
      console.error('Failed to check email config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscribers();
    checkEmailConfig();
  }, []);

  return (
    <main className='min-h-screen bg-background p-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <h1 className='text-3xl font-bold'>Diagnostic Dashboard</h1>

        <Card className='bg-card p-6'>
          <h2 className='text-xl font-bold mb-4'>Email Configuration</h2>
          <div className='space-y-2 text-sm'>
            <p>
              <strong>EMAIL_SERVICE:</strong> {emailConfig.service || 'Not set'}
            </p>
            <p>
              <strong>EMAIL_USER:</strong> {emailConfig.user || 'Not set'}
            </p>
            <p>
              <strong>EMAIL_FROM:</strong> {emailConfig.from || 'Not set'}
            </p>
            <p>
              <strong>SMTP_HOST:</strong> {emailConfig.host || 'Not set'}
            </p>
            <p>
              <strong>Config Status:</strong>{' '}
              {emailConfig.configured ? '✅ Configured' : '❌ Not configured'}
            </p>
          </div>
        </Card>

        <Card className='bg-card p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold'>Subscribers Status</h2>
            <Button onClick={checkSubscribers} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-4 gap-4'>
              <div className='bg-muted p-4 rounded'>
                <p className='text-sm text-muted-foreground'>CONFIRMED</p>
                <p className='text-2xl font-bold'>
                  {subscribers.filter(s => s.status === 'CONFIRMED').length}
                </p>
              </div>
              <div className='bg-muted p-4 rounded'>
                <p className='text-sm text-muted-foreground'>PENDING</p>
                <p className='text-2xl font-bold'>
                  {subscribers.filter(s => s.status === 'PENDING').length}
                </p>
              </div>
              <div className='bg-muted p-4 rounded'>
                <p className='text-sm text-muted-foreground'>UNSUBSCRIBED</p>
                <p className='text-2xl font-bold'>
                  {subscribers.filter(s => s.status === 'UNSUBSCRIBED').length}
                </p>
              </div>
              <div className='bg-muted p-4 rounded'>
                <p className='text-sm text-muted-foreground'>BOUNCED</p>
                <p className='text-2xl font-bold'>
                  {subscribers.filter(s => s.status === 'BOUNCED').length}
                </p>
              </div>
            </div>

            <div className='border rounded'>
              <table className='w-full'>
                <thead className='border-b'>
                  <tr>
                    <th className='text-left p-3'>Email</th>
                    <th className='text-left p-3'>Status</th>
                    <th className='text-left p-3'>Confirmed At</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(sub => (
                    <tr key={sub.id} className='border-b'>
                      <td className='p-3'>{sub.email}</td>
                      <td className='p-3'>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            sub.status === 'CONFIRMED'
                              ? 'bg-green-500/20 text-green-500'
                              : sub.status === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className='p-3 text-sm text-muted-foreground'>
                        {sub.confirmedAt
                          ? new Date(sub.confirmedAt).toLocaleString()
                          : 'Not confirmed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
