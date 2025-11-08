'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getSubscribers,
  deleteSubscribers,
  Subscriber,
} from '@/app/actions/subscriber';

// Category name mapping
const categoryNames: Record<string, string> = {
  tech: 'Technology',
  business: 'Business',
  lifestyle: 'Lifestyle',
  finance: 'Finance',
  marketing: 'Marketing',
  design: 'Design',
  development: 'Development',
  productivity: 'Productivity',
};

// Frequency label mapping
const frequencyLabels: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  REALTIME: 'Real-time',
};

export default function SubscribersList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Fetch subscribers from the server (with pagination)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getSubscribers({
        search,
        status: statusFilter,
        page,
        perPage,
      });

      if (result.success && result.subscribers) {
        setSubscribers(result.subscribers);
        setTotalPages(result.totalPages ?? 1);
        setTotalCount(result.total ?? 0);
      } else {
        setSubscribers([]);
        setTotalPages(1);
        setTotalCount(0);
      }
      setLoading(false);
    };
    fetchData();
  }, [search, statusFilter, page, perPage]);

  const handleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map(s => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id],
    );
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    const result = await deleteSubscribers([deleteTargetId]);
    if (result.success) {
      setSubscribers(prev => prev.filter(s => s.id !== deleteTargetId));
      setSelectedIds(prev => prev.filter(id => id !== deleteTargetId));
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await deleteSubscribers(selectedIds);
    if (result.success) {
      setSubscribers(prev => prev.filter(sub => !selectedIds.includes(sub.id)));
      setSelectedIds([]);
    }
  };

  const handleExport = () => {
    const csv = [
      [
        'Email',
        'Name',
        'Status',
        'Frequency',
        'Categories',
        'Joined Date',
        'Last Opened',
      ],
      ...subscribers.map(s => [
        s.email,
        s.name || '',
        s.status,
        s.preferences?.frequency
          ? frequencyLabels[s.preferences.frequency] || s.preferences.frequency
          : 'Not set',
        s.preferences?.categories
          ? s.preferences.categories
              .map(cat => categoryNames[cat] || cat)
              .join('; ')
          : 'Not set',
        s.joinedAt ? new Date(s.joinedAt).toLocaleDateString() : 'Never',
        s.lastOpenedAt
          ? new Date(s.lastOpenedAt).toLocaleDateString()
          : 'Never',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-page-${page}.csv`;
    a.click();
  };

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by email...'
            value={search}
            onChange={e => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className='pl-10 bg-card'
          />
        </div>

        <div className='flex gap-2'>
          <Select
            value={statusFilter}
            onValueChange={val => {
              setPage(1);
              setStatusFilter(val);
            }}
          >
            <SelectTrigger className='w-[180px] bg-card'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
              <SelectItem value='PENDING'>Pending</SelectItem>
              <SelectItem value='UNSUBSCRIBED'>Unsubscribed</SelectItem>
              <SelectItem value='BOUNCED'>Bounced</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            className='flex items-center gap-2 bg-transparent'
            onClick={handleExport}
          >
            <Download className='h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <Card className='bg-accent/10 border-accent/20 p-4 flex items-center justify-between'>
          <p className='text-sm font-medium'>
            {selectedIds.length} subscriber
            {selectedIds.length !== 1 ? 's' : ''} selected
          </p>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setSelectedIds([])}
              className='bg-transparent'
            >
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size='sm'
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selectedIds.length} subscriber(s)?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className='bg-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>
                  <Checkbox
                    checked={
                      selectedIds.length === subscribers.length &&
                      subscribers.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className='font-semibold'>Email</TableHead>
                <TableHead className='font-semibold'>Name</TableHead>
                <TableHead className='font-semibold'>Status</TableHead>
                <TableHead className='font-semibold'>Frequency</TableHead>
                <TableHead className='font-semibold'>Topics</TableHead>
                <TableHead className='font-semibold'>Joined</TableHead>
                <TableHead className='text-right font-semibold'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    <div className='flex items-center justify-center text-sm text-muted-foreground'>
                      Loading subscribers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    <div className='flex items-center justify-center text-sm text-muted-foreground'>
                      No subscribers found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map(subscriber => (
                  <TableRow
                    key={subscriber.id}
                    className='hover:bg-muted/50 data-[state=selected]:bg-muted'
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(subscriber.id)}
                        onCheckedChange={() => handleSelectOne(subscriber.id)}
                      />
                    </TableCell>
                    <TableCell className='font-medium'>
                      {subscriber.email}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {subscriber.name || '-'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === 'CONFIRMED'
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : subscriber.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                            : subscriber.status === 'BOUNCED'
                            ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                            : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {subscriber.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {subscriber.preferences?.frequency ? (
                        <div className='flex items-center gap-1.5 text-sm'>
                          <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
                          <span className='font-medium'>
                            {frequencyLabels[
                              subscriber.preferences.frequency
                            ] || subscriber.preferences.frequency}
                          </span>
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground italic'>
                          Not set
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscriber.preferences?.categories &&
                      subscriber.preferences.categories.length > 0 ? (
                        <div className='flex flex-wrap gap-1 max-w-[200px]'>
                          {subscriber.preferences.categories
                            .slice(0, 3)
                            .map((cat, idx) => (
                              <span
                                key={idx}
                                className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400'
                              >
                                <Tag className='h-2.5 w-2.5' />
                                {categoryNames[cat] || cat}
                              </span>
                            ))}
                          {subscriber.preferences.categories.length > 3 && (
                            <span
                              className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-700 dark:text-gray-400'
                              title={subscriber.preferences.categories
                                .slice(3)
                                .map(cat => categoryNames[cat] || cat)
                                .join(', ')}
                            >
                              +{subscriber.preferences.categories.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground italic'>
                          Not set
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {subscriber.joinedAt
                        ? new Date(subscriber.joinedAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className='text-right'>
                      <AlertDialog
                        open={
                          deleteDialogOpen && deleteTargetId === subscriber.id
                        }
                        onOpenChange={open => {
                          setDeleteDialogOpen(open);
                          if (!open) setDeleteTargetId(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setDeleteTargetId(subscriber.id);
                              setDeleteDialogOpen(true);
                            }}
                            className='text-destructive hover:bg-destructive/10'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete subscriber?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete{' '}
                              <strong>{subscriber.email}</strong> and all
                              related data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirmed}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <div>
            Page {page} of {totalPages} ({totalCount} total)
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className='h-4 w-4' />
              Prev
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
