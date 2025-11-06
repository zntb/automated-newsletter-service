'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Send, Save, Eye, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Draft {
  id: string;
  subject: string;
  content: string;
  savedAt: string;
}

const templates = [
  {
    id: 'weekly',
    name: 'Weekly Digest',
    subject: 'Weekly Digest - [Date]',
    content:
      "## This Week's Highlights\n\n- Item 1\n- Item 2\n- Item 3\n\nThank you for reading!",
  },
  {
    id: 'announcement',
    name: 'Announcement',
    subject: 'Important Announcement',
    content:
      "# Important Update\n\nWe're excited to announce...\n\nLearn more at [link]",
  },
  {
    id: 'feature',
    name: 'Feature Showcase',
    subject: 'Check Out Our New Feature',
    content:
      "# New Feature Released\n\n**What's new?**\n\nDetails about the new feature...\n\nTry it now!",
  },
];

export default function NewsletterComposer() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTime, setSendTime] = useState('');
  const [audience, setAudience] = useState('all');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');

  const handleSend = async () => {
    if (!subject || !content) return;

    setSending(true);
    try {
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          subject,
          content,
          audience,
          subscribers: ['demo@example.com'], // In production, fetch from database
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Newsletter sent!', {
          description: `Successfully sent to ${data.successful} subscribers`,
        });
        setSubject('');
        setContent('');
        setSendTime('');
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to send newsletter',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: `Failed to send newsletter - ${error}`,
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = () => {
    const newDraft: Draft = {
      id: Date.now().toString(),
      subject,
      content,
      savedAt: new Date().toLocaleString(),
    };
    setDrafts([...drafts, newDraft]);
    toast.success('Draft saved', {
      description: 'Your newsletter draft has been saved successfully',
    });
  };

  const handleLoadDraft = (draft: Draft) => {
    setSubject(draft.subject);
    setContent(draft.content);
    setDrafts(drafts.filter(d => d.id !== draft.id));
    setActiveTab('compose');
    toast.success('Draft loaded', {
      description: 'Your draft is ready to edit',
    });
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
  };

  const handleApplyTemplate = (template: (typeof templates)[0]) => {
    setSubject(template.subject);
    setContent(template.content);
    setActiveTab('compose');
    toast.success('Template applied', {
      description: 'You can now customize the template content',
    });
  };

  const handleSchedule = () => {
    if (!sendTime) {
      toast.error('Error', {
        description: 'Please select a time to schedule',
      });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubject('');
      setContent('');
      setSendTime('');
      toast.success('Newsletter scheduled', {
        icon: <Clock />,
        description: `Newsletter will be sent on ${new Date(
          sendTime,
        ).toLocaleString()}`,
      });
    }, 1500);
  };

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <div className='border-b border-border'>
          <div className='flex gap-8'>
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
            <button
              onClick={() => setActiveTab('templates')}
              className={`border-b-2 px-0 py-4 text-sm font-medium transition ${
                activeTab === 'templates'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`border-b-2 px-0 py-4 text-sm font-medium transition ${
                activeTab === 'drafts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Drafts ({drafts.length})
            </button>
          </div>
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className='pt-6'>
            <div className='grid gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2 space-y-6'>
                <Card className='bg-card p-6'>
                  <h2 className='mb-6 text-lg font-bold'>Newsletter Details</h2>

                  <div className='space-y-4'>
                    <div>
                      <label className='mb-2 block text-sm font-medium'>
                        Subject Line
                      </label>
                      <Input
                        placeholder="What's the main topic?"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className='bg-background'
                      />
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium'>
                        Content
                      </label>
                      <textarea
                        placeholder='Write your newsletter content here... You can use markdown formatting.'
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className='h-64 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <div className='space-y-6'>
                <Card className='bg-card p-6'>
                  <h3 className='mb-4 font-bold flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    Send Options
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <label className='mb-2 block text-sm font-medium'>
                        Send Type
                      </label>
                      <select className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm'>
                        <option value='now'>Send Now</option>
                        <option value='scheduled'>Schedule</option>
                      </select>
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium'>
                        Schedule Time
                      </label>
                      <Input
                        type='datetime-local'
                        value={sendTime}
                        onChange={e => setSendTime(e.target.value)}
                        className='bg-background'
                      />
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium'>
                        Audience
                      </label>
                      <select
                        value={audience}
                        onChange={e => setAudience(e.target.value)}
                        className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm'
                      >
                        <option value='all'>All subscribers</option>
                        <option value='active'>Active only</option>
                        <option value='new'>New subscribers</option>
                        <option value='engaged'>Highly engaged</option>
                      </select>
                    </div>
                  </div>
                </Card>

                <div className='space-y-3'>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant='outline'
                    className='w-full bg-transparent flex items-center justify-center gap-2'
                  >
                    <Eye className='h-4 w-4' />
                    {showPreview ? 'Hide' : 'Preview'}
                  </Button>

                  <Button
                    onClick={handleSend}
                    disabled={!subject || !content || sending}
                    className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    <Send className='mr-2 h-4 w-4' />
                    {sending ? 'Sending...' : 'Send Now'}
                  </Button>

                  <Button
                    onClick={handleSchedule}
                    disabled={!subject || !content || !sendTime || sending}
                    variant='outline'
                    className='w-full bg-transparent'
                  >
                    <Clock className='mr-2 h-4 w-4' />
                    Schedule
                  </Button>

                  <Button
                    onClick={handleSaveDraft}
                    disabled={!subject || !content}
                    variant='outline'
                    className='w-full bg-transparent'
                  >
                    <Save className='mr-2 h-4 w-4' />
                    Save Draft
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <Card className='mt-6 bg-card p-6'>
                <h3 className='mb-4 font-bold'>Preview</h3>
                <div className='rounded-md border border-border bg-background p-6'>
                  <div className='mb-4 pb-4 border-b border-border'>
                    <h2 className='text-xl font-bold'>
                      {subject || 'Your subject here'}
                    </h2>
                    <p className='text-xs text-muted-foreground'>
                      To: All subscribers
                    </p>
                  </div>
                  <div className='prose prose-sm max-w-none text-foreground'>
                    {content || 'Your content will appear here...'}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className='pt-6 grid gap-4 md:grid-cols-3'>
            {templates.map(template => (
              <Card
                key={template.id}
                className='bg-card p-6 flex flex-col gap-4'
              >
                <div>
                  <h3 className='font-bold mb-2'>{template.name}</h3>
                  <p className='text-sm text-muted-foreground line-clamp-3'>
                    {template.content}
                  </p>
                </div>
                <Button
                  onClick={() => handleApplyTemplate(template)}
                  className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                >
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Drafts Tab */}
        {activeTab === 'drafts' && (
          <div className='pt-6'>
            {drafts.length === 0 ? (
              <Card className='bg-card p-12 text-center'>
                <p className='text-muted-foreground'>
                  No drafts yet. Save your first draft to see it here.
                </p>
              </Card>
            ) : (
              <div className='space-y-3'>
                {drafts.map(draft => (
                  <Card
                    key={draft.id}
                    className='bg-card p-4 flex items-center justify-between'
                  >
                    <div className='flex-1'>
                      <h3 className='font-medium'>{draft.subject}</h3>
                      <p className='text-xs text-muted-foreground'>
                        Saved: {draft.savedAt}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => handleLoadDraft(draft)}
                        size='sm'
                        className='bg-primary text-primary-foreground hover:bg-primary/90'
                      >
                        Load
                      </Button>
                      <Button
                        onClick={() => handleDeleteDraft(draft.id)}
                        size='sm'
                        variant='ghost'
                        className='text-destructive hover:bg-destructive/10'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Tabs>
    </div>
  );
}
