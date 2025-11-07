'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Send, Save, Eye, Trash2, Clock, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { sendNewsletterAction } from '@/app/actions/newsletter';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  deleteTemplates,
  type EmailTemplate,
} from '@/app/actions/template';
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
import { Checkbox } from '@/components/ui/checkbox';

interface Draft {
  id: string;
  subject: string;
  content: string;
  savedAt: string;
}

export default function NewsletterComposer() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTime, setSendTime] = useState('');
  const [audience, setAudience] = useState<
    'all' | 'active' | 'new' | 'engaged'
  >('all');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');

  // Template state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null,
  );
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    preview: '',
    category: 'general',
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    const result = await getTemplates();
    if (result.success && result.templates) {
      setTemplates(result.templates);
    } else {
      toast.error('Failed to load templates');
    }
    setLoadingTemplates(false);
  };

  const handleSend = async () => {
    if (!subject || !content) return;

    setSending(true);
    try {
      // ✅ Call the server action directly
      const result = await sendNewsletterAction({
        subject,
        content,
        audience,
      });

      if (result.success) {
        toast.success('Newsletter sent!', {
          description: `Successfully sent to ${result.sent} subscribers`,
        });
        setSubject('');
        setContent('');
        setSendTime('');
      } else {
        toast.error('Error', {
          description: result.error || 'Failed to send newsletter',
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

  const handleApplyTemplate = (template: EmailTemplate) => {
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

  // Template management functions
  const openTemplateDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        preview: template.preview || '',
        category: template.category,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        subject: '',
        content: '',
        preview: '',
        category: 'general',
      });
    }
    setShowTemplateDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast.error('Error', {
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const result = await updateTemplate(editingTemplate.id, templateForm);
        if (result.success) {
          toast.success('Template updated successfully');
          await loadTemplates();
          setShowTemplateDialog(false);
        } else {
          toast.error('Error', {
            description: result.error || 'Failed to update template',
          });
        }
      } else {
        // Create new template
        const result = await createTemplate(templateForm);
        if (result.success) {
          toast.success('Template created successfully');
          await loadTemplates();
          setShowTemplateDialog(false);
        } else {
          toast.error('Error', {
            description: result.error || 'Failed to create template',
          });
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const result = await deleteTemplate(id);
    if (result.success) {
      toast.success('Template deleted successfully');
      await loadTemplates();
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to delete template',
      });
    }
  };

  const handleBulkDeleteTemplates = async () => {
    if (selectedTemplateIds.length === 0) return;

    const result = await deleteTemplates(selectedTemplateIds);
    if (result.success) {
      toast.success(`Deleted ${result.deleted} template(s)`);
      setSelectedTemplateIds([]);
      await loadTemplates();
    } else {
      toast.error('Error', {
        description: result.error || 'Failed to delete templates',
      });
    }
  };

  const toggleTemplateSelection = (id: string) => {
    setSelectedTemplateIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id],
    );
  };

  const toggleSelectAllTemplates = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(templates.map(t => t.id));
    }
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
              Templates ({templates.length})
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
                        placeholder='Write your newsletter content here... You can use HTML formatting.'
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
                        onChange={e =>
                          setAudience(
                            e.target.value as
                              | 'all'
                              | 'active'
                              | 'new'
                              | 'engaged',
                          )
                        }
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
                  <div
                    className='prose prose-sm max-w-none text-foreground'
                    dangerouslySetInnerHTML={{
                      __html: content || 'Your content will appear here...',
                    }}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className='pt-6'>
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                {selectedTemplateIds.length > 0 && (
                  <>
                    <Checkbox
                      checked={selectedTemplateIds.length === templates.length}
                      onCheckedChange={toggleSelectAllTemplates}
                    />
                    <span className='text-sm text-muted-foreground'>
                      {selectedTemplateIds.length} selected
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size='sm'
                          variant='outline'
                          className='bg-transparent text-destructive hover:bg-destructive/10'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete Selected
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete {selectedTemplateIds.length} template(s)?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Templates in use by
                            newsletters cannot be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBulkDeleteTemplates}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
              <Button
                onClick={() => openTemplateDialog()}
                className='bg-primary text-primary-foreground hover:bg-primary/90'
              >
                <Plus className='h-4 w-4 mr-2' />
                New Template
              </Button>
            </div>

            {loadingTemplates ? (
              <Card className='bg-card p-12 text-center'>
                <p className='text-muted-foreground'>Loading templates...</p>
              </Card>
            ) : templates.length === 0 ? (
              <Card className='bg-card p-12 text-center'>
                <p className='text-muted-foreground mb-4'>
                  No templates yet. Create your first template to get started.
                </p>
                <Button
                  onClick={() => openTemplateDialog()}
                  className='bg-primary text-primary-foreground hover:bg-primary/90'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Create Template
                </Button>
              </Card>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {templates.map(template => (
                  <Card
                    key={template.id}
                    className='bg-card p-6 flex flex-col gap-4'
                  >
                    <div className='flex items-start gap-3'>
                      <Checkbox
                        checked={selectedTemplateIds.includes(template.id)}
                        onCheckedChange={() =>
                          toggleTemplateSelection(template.id)
                        }
                      />
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h3 className='font-bold'>{template.name}</h3>
                            <span className='text-xs text-muted-foreground'>
                              {template.category}
                            </span>
                          </div>
                        </div>
                        <p className='text-sm text-muted-foreground line-clamp-2 mb-2'>
                          {template.preview || template.subject}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => handleApplyTemplate(template)}
                        size='sm'
                        className='flex-1 bg-primary text-primary-foreground hover:bg-primary/90'
                      >
                        Use Template
                      </Button>
                      <Button
                        onClick={() => openTemplateDialog(template)}
                        size='sm'
                        variant='outline'
                        className='bg-transparent'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='text-destructive hover:bg-destructive/10'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete template?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The template cannot
                              be deleted if it&apos;s being used by any
                              newsletters.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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

      {/* Template Create/Edit Dialog */}
      <AlertDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      >
        <AlertDialogContent className='max-w-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Fill in the template details below
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Template Name *
              </label>
              <Input
                placeholder='e.g., Weekly Newsletter'
                value={templateForm.name}
                onChange={e =>
                  setTemplateForm({ ...templateForm, name: e.target.value })
                }
                className='bg-background'
              />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Subject Line *
              </label>
              <Input
                placeholder='e.g., Weekly Digest - {{date}}'
                value={templateForm.subject}
                onChange={e =>
                  setTemplateForm({ ...templateForm, subject: e.target.value })
                }
                className='bg-background'
              />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Preview Text
              </label>
              <Input
                placeholder='Short preview text'
                value={templateForm.preview}
                onChange={e =>
                  setTemplateForm({ ...templateForm, preview: e.target.value })
                }
                className='bg-background'
              />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>Category</label>
              <select
                value={templateForm.category}
                onChange={e =>
                  setTemplateForm({ ...templateForm, category: e.target.value })
                }
                className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm'
              >
                <option value='general'>General</option>
                <option value='newsletter'>Newsletter</option>
                <option value='announcement'>Announcement</option>
                <option value='welcome'>Welcome</option>
                <option value='marketing'>Marketing</option>
              </select>
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Content (HTML) *
              </label>
              <textarea
                placeholder='Your HTML content here...'
                value={templateForm.content}
                onChange={e =>
                  setTemplateForm({ ...templateForm, content: e.target.value })
                }
                className='h-48 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveTemplate}>
              {editingTemplate ? 'Update' : 'Create'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
