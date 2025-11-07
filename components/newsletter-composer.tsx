/* eslint-disable @typescript-eslint/no-explicit-any */
// components/enhanced-newsletter-composer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Eye,
  Clock,
  Sparkles,
  Code,
  FileText,
  Image,
  Link,
  Bold,
  Italic,
  List,
  AlignLeft,
  X,
  Check,
  Copy,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { sendNewsletterAction } from '@/app/actions/newsletter';
import { getTemplates, type EmailTemplate } from '@/app/actions/template';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  emailTemplates,
  replaceTemplateVariables,
} from '@/lib/email-templates';

interface EditorTool {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: string;
}

export default function NewsletterComposer() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [preheader, setPreheader] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTime, setSendTime] = useState('');
  const [audience, setAudience] = useState<
    'all' | 'active' | 'new' | 'engaged'
  >('all');
  const [showPreview, setShowPreview] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

  // Template state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Professional templates state
  const [showProfessionalTemplates, setShowProfessionalTemplates] =
    useState(false);
  const [selectedProfessionalTemplate, setSelectedProfessionalTemplate] =
    useState<any>(null);
  const [templateVariables, setTemplateVariables] = useState<
    Record<string, string>
  >({});

  // Editor tools
  const editorTools: EditorTool[] = [
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: List, label: 'List', action: 'list' },
    { icon: Link, label: 'Link', action: 'link' },
    { icon: Image, label: 'Image', action: 'image' },
    { icon: AlignLeft, label: 'Heading', action: 'heading' },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    const result = await getTemplates();
    if (result.success && result.templates) {
      setTemplates(result.templates);
    }
    setLoadingTemplates(false);
  };

  const handleSend = async () => {
    if (!subject || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
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
        setPreheader('');
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

  const handleApplyProfessionalTemplate = (template: any) => {
    setSelectedProfessionalTemplate(template);
    setSubject(template.subject);
    setPreheader(template.preview);

    // Initialize variables
    const vars: Record<string, string> = {};
    template.variables?.forEach((v: string) => {
      vars[v] = '';
    });
    setTemplateVariables(vars);

    setShowProfessionalTemplates(false);
    toast.success('Template applied', {
      description: 'Fill in the template variables to customize',
    });
  };

  const handleGenerateContent = () => {
    if (!selectedProfessionalTemplate) return;

    const finalContent = replaceTemplateVariables(
      selectedProfessionalTemplate.content,
      templateVariables,
    );
    setContent(finalContent);

    const finalSubject = replaceTemplateVariables(
      selectedProfessionalTemplate.subject,
      templateVariables,
    );
    setSubject(finalSubject);

    toast.success('Content generated!', {
      description: 'Review and customize your newsletter',
    });
  };

  const handleInsertElement = (action: string) => {
    const textarea = document.querySelector(
      'textarea[name="content"]',
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let insertion = '';

    switch (action) {
      case 'bold':
        insertion = `<strong>${selectedText || 'Bold text'}</strong>`;
        break;
      case 'italic':
        insertion = `<em>${selectedText || 'Italic text'}</em>`;
        break;
      case 'list':
        insertion = `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>`;
        break;
      case 'link':
        insertion = `<a href="https://example.com">${
          selectedText || 'Link text'
        }</a>`;
        break;
      case 'image':
        insertion = `<img src="https://via.placeholder.com/600x300" alt="Image description" style="width: 100%; height: auto;" />`;
        break;
      case 'heading':
        insertion = `<h2>${selectedText || 'Heading'}</h2>`;
        break;
    }

    const newContent =
      content.substring(0, start) + insertion + content.substring(end);
    setContent(newContent);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertion.length,
        start + insertion.length,
      );
    }, 0);
  };

  const handleExportTemplate = () => {
    const templateData = {
      name: subject || 'Untitled Template',
      subject,
      content,
      preview: preheader,
      category: 'custom',
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(templateData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Template exported!');
  };

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter(t => t.category === selectedCategory);

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Newsletter Composer</h2>
          <p className='text-sm text-muted-foreground'>
            Create beautiful newsletters with professional templates
          </p>
        </div>
        <Button
          onClick={() => setShowProfessionalTemplates(true)}
          className='bg-primary text-primary-foreground hover:bg-primary/90'
        >
          <Sparkles className='h-4 w-4 mr-2' />
          Browse Templates
        </Button>
      </div>

      {/* Professional Templates Modal */}
      <AlertDialog
        open={showProfessionalTemplates}
        onOpenChange={setShowProfessionalTemplates}
      >
        <AlertDialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <AlertDialogHeader>
            <AlertDialogTitle>Professional Email Templates</AlertDialogTitle>
            <AlertDialogDescription>
              Choose from our collection of professionally designed templates
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='grid gap-4 md:grid-cols-2 py-4'>
            {emailTemplates.map((template, index) => (
              <Card
                key={index}
                className='bg-card p-4 hover:shadow-lg transition-shadow cursor-pointer'
              >
                <div className='space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-bold text-lg'>{template.name}</h3>
                      <span className='text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground'>
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {template.preview}
                  </p>
                  <div className='flex flex-wrap gap-1'>
                    {template.variables?.slice(0, 3).map((v, i) => (
                      <span
                        key={i}
                        className='text-xs px-2 py-1 bg-accent/20 rounded text-accent'
                      >
                        {v}
                      </span>
                    ))}
                    {template.variables && template.variables.length > 3 && (
                      <span className='text-xs px-2 py-1 bg-muted rounded text-muted-foreground'>
                        +{template.variables.length - 3} more
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleApplyProfessionalTemplate(template)}
                    size='sm'
                    className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Variables Section */}
      {selectedProfessionalTemplate && (
        <Card className='bg-accent/10 border-accent/20 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='font-bold flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-accent' />
                Template Variables
              </h3>
              <p className='text-sm text-muted-foreground'>
                Customize your template by filling in these values
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedProfessionalTemplate(null);
                setTemplateVariables({});
              }}
              variant='ghost'
              size='sm'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {selectedProfessionalTemplate.variables?.map((variable: string) => (
              <div key={variable}>
                <label className='mb-2 block text-sm font-medium capitalize'>
                  {variable.replace(/_/g, ' ')}
                </label>
                <Input
                  placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                  value={templateVariables[variable] || ''}
                  onChange={e =>
                    setTemplateVariables({
                      ...templateVariables,
                      [variable]: e.target.value,
                    })
                  }
                  className='bg-card'
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleGenerateContent}
            className='mt-4 bg-accent text-accent-foreground hover:bg-accent/90'
          >
            <Check className='h-4 w-4 mr-2' />
            Generate Content
          </Button>
        </Card>
      )}

      {/* Main Composer */}
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-6'>
          <Card className='bg-card p-6'>
            <div className='space-y-4'>
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Subject Line *
                </label>
                <Input
                  placeholder='Grab their attention...'
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className='bg-background'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Preheader Text
                </label>
                <Input
                  placeholder='Preview text that appears after the subject'
                  value={preheader}
                  onChange={e => setPreheader(e.target.value)}
                  className='bg-background'
                />
              </div>

              <div className='flex items-center justify-between border-b pb-2'>
                <label className='text-sm font-medium'>Content *</label>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => setEditorMode('visual')}
                    variant={editorMode === 'visual' ? 'default' : 'ghost'}
                    size='sm'
                  >
                    <FileText className='h-4 w-4 mr-1' />
                    Visual
                  </Button>
                  <Button
                    onClick={() => setEditorMode('html')}
                    variant={editorMode === 'html' ? 'default' : 'ghost'}
                    size='sm'
                  >
                    <Code className='h-4 w-4 mr-1' />
                    HTML
                  </Button>
                </div>
              </div>

              {editorMode === 'visual' && (
                <div className='flex flex-wrap gap-1 p-2 bg-muted/50 rounded-t-md border-b'>
                  {editorTools.map((tool, index) => (
                    <Button
                      key={index}
                      onClick={() => handleInsertElement(tool.action)}
                      variant='ghost'
                      size='sm'
                      title={tool.label}
                      className='h-8 w-8 p-0'
                    >
                      <tool.icon className='h-4 w-4' />
                    </Button>
                  ))}
                </div>
              )}

              <textarea
                name='content'
                placeholder={
                  editorMode === 'html'
                    ? 'Write your HTML content here...'
                    : 'Start typing or use the toolbar to format your content...'
                }
                value={content}
                onChange={e => setContent(e.target.value)}
                className='h-96 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono'
              />
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
                  Audience
                </label>
                <Select
                  value={audience}
                  onValueChange={(val: any) => setAudience(val)}
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All subscribers</SelectItem>
                    <SelectItem value='active'>Active only</SelectItem>
                    <SelectItem value='new'>New subscribers</SelectItem>
                    <SelectItem value='engaged'>Highly engaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Schedule (Optional)
                </label>
                <Input
                  type='datetime-local'
                  value={sendTime}
                  onChange={e => setSendTime(e.target.value)}
                  className='bg-background'
                />
              </div>
            </div>
          </Card>

          <div className='space-y-3'>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant='outline'
              className='w-full bg-transparent'
            >
              <Eye className='h-4 w-4 mr-2' />
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
              onClick={handleExportTemplate}
              disabled={!subject || !content}
              variant='outline'
              className='w-full bg-transparent'
            >
              <Download className='h-4 w-4 mr-2' />
              Export Template
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card className='bg-card p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-bold'>Preview</h3>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success('HTML copied to clipboard');
              }}
              variant='ghost'
              size='sm'
            >
              <Copy className='h-4 w-4 mr-2' />
              Copy HTML
            </Button>
          </div>
          <div className='rounded-md border border-border bg-background p-6'>
            <div className='mb-4 pb-4 border-b border-border'>
              <h2 className='text-xl font-bold mb-1'>
                {subject || 'Your subject here'}
              </h2>
              {preheader && (
                <p className='text-sm text-muted-foreground'>{preheader}</p>
              )}
              <p className='text-xs text-muted-foreground mt-2'>
                To:{' '}
                {audience === 'all'
                  ? 'All subscribers'
                  : `${audience} subscribers`}
              </p>
            </div>
            <div
              className='prose prose-sm max-w-none'
              dangerouslySetInnerHTML={{
                __html:
                  content ||
                  '<p class="text-muted-foreground">Your content will appear here...</p>',
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
