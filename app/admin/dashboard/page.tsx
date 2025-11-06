// app/admin/dashboard/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, Mail, Settings, LogOut } from 'lucide-react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import SubscribersList from '@/components/subscribers-list';
import NewsletterComposer from '@/components/newsletter-composer';
import { getDashboardStats } from '@/app/actions/dashboard';

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const result = await getDashboardStats();
        if (result.success) {
          setDashboardData(result);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const stats = dashboardData?.weeklyStats || [];
  const subscriberCount = dashboardData?.subscriberCount || 0;
  const openRate = dashboardData?.openRate || 0;
  const clickRate = dashboardData?.clickRate || 0;

  return (
    <main className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border bg-card'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold'>Admin Dashboard</h1>
              <p className='text-sm text-muted-foreground'>
                Manage your newsletter service
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant='outline'
              className='flex items-center gap-2 bg-transparent'
            >
              <LogOut className='h-4 w-4' />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className='border-b border-border bg-card'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex gap-8'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`border-b-2 px-0 py-4 text-sm font-medium transition ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`border-b-2 px-0 py-4 text-sm font-medium transition ${
                activeTab === 'subscribers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab('compose')}
              className={`border-b-2 px-0 py-4 text-sm font-medium transition ${
                activeTab === 'compose'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Compose
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {activeTab === 'overview' && (
          <div className='space-y-8'>
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-4'>
              <Card className='bg-card p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Total Subscribers
                    </p>
                    <p className='text-3xl font-bold'>{subscriberCount}</p>
                  </div>
                  <Users className='h-8 w-8 text-accent' />
                </div>
              </Card>
              <Card className='bg-card p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Open Rate</p>
                    <p className='text-3xl font-bold'>{openRate}%</p>
                  </div>
                  <Mail className='h-8 w-8 text-accent' />
                </div>
              </Card>
              <Card className='bg-card p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Click Rate</p>
                    <p className='text-3xl font-bold'>{clickRate}%</p>
                  </div>
                  <Mail className='h-8 w-8 text-accent' />
                </div>
              </Card>
              <Card className='bg-card p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Unsubscribes
                    </p>
                    <p className='text-3xl font-bold'>2%</p>
                  </div>
                  <Settings className='h-8 w-8 text-accent' />
                </div>
              </Card>
            </div>

            {/* Chart */}
            <Card className='bg-card p-6'>
              <h2 className='mb-6 text-lg font-bold'>Performance Metrics</h2>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={stats}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--color-border)'
                  />
                  <XAxis
                    dataKey='name'
                    stroke='var(--color-muted-foreground)'
                  />
                  <YAxis stroke='var(--color-muted-foreground)' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-foreground)',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey='subscribers'
                    fill='var(--color-primary)'
                    name='Subscribers'
                  />
                  <Bar
                    dataKey='opens'
                    fill='var(--color-accent)'
                    name='Opens'
                  />
                  <Bar
                    dataKey='clicks'
                    fill='var(--color-secondary)'
                    name='Clicks'
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === 'subscribers' && <SubscribersList />}
        {activeTab === 'compose' && <NewsletterComposer />}
      </div>
    </main>
  );
}
