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
  getSubscribers,
  deleteSubscribers,
  Subscriber,
} from '@/app/actions/subscriber';

export default function SubscribersList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
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
      ['Email', 'Status', 'Joined Date', 'Last Opened'],
      ...subscribers.map(s => [
        s.email,
        s.status,
        s.joinedAt || 'Never',
        s.lastOpenedAt || 'Never',
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
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='unsubscribed'>Unsubscribed</SelectItem>
              <SelectItem value='bounced'>Bounced</SelectItem>
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
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border'>
                <th className='px-6 py-4 text-left'>
                  <Checkbox
                    checked={
                      selectedIds.length === subscribers.length &&
                      subscribers.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>
                  Email
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>
                  Status
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>
                  Joined
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>
                  Last Opened
                </th>
                <th className='px-6 py-4 text-right text-sm font-semibold'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-8 text-center text-sm text-muted-foreground'
                  >
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-8 text-center text-sm text-muted-foreground'
                  >
                    No subscribers found
                  </td>
                </tr>
              ) : (
                subscribers.map(subscriber => (
                  <tr
                    key={subscriber.id}
                    className='border-b border-border hover:bg-muted/50'
                  >
                    <td className='px-6 py-4'>
                      <Checkbox
                        checked={selectedIds.includes(subscriber.id)}
                        onCheckedChange={() => handleSelectOne(subscriber.id)}
                      />
                    </td>
                    <td className='px-6 py-4 text-sm'>{subscriber.email}</td>
                    <td className='px-6 py-4 text-sm'>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === 'active'
                            ? 'bg-accent/20 text-accent'
                            : subscriber.status === 'bounced'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-muted-foreground'>
                      {subscriber.joinedAt
                        ? subscriber.joinedAt.toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className='px-6 py-4 text-sm text-muted-foreground'>
                      {subscriber.lastOpenedAt
                        ? subscriber.lastOpenedAt.toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <AlertDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setDeleteTargetId(subscriber.id)}
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
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirmed}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
