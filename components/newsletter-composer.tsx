/* eslint-disable @typescript-eslint/no-explicit-any */
// components/newsletter-composer.tsx
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
  Bold,
  Italic,
  List,
  Link,
  Heading,
  Quote,
  Image as ImageIcon,
  X,
  Check,
  Copy,
  Download,
  AlertCircle,
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
import {
  markdownToHtml,
  wrapInEmailTemplate,
  getContentStats,
  validateMarkdown,
} from '@/lib/markdown-utils';

type EditorMode = 'visual' | 'html' | 'markdown';

interface MarkdownTool {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
}

export default function NewsletterComposer() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [preheader, setPreheader] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTime, setSendTime] = useState('');
  const [audience, setAudience] = useState<
    'all' | 'active' | 'new' | 'engaged'
  >('all');
  const [showPreview, setShowPreview] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('markdown');

  // Template state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Professional templates state
  const [showProfessionalTemplates, setShowProfessionalTemplates] =
    useState(false);
  const [selectedProfessionalTemplate, setSelectedProfessionalTemplate] =
    useState<any>(null);
  const [templateVariables, setTemplateVariables] = useState<
    Record<string, string>
  >({});

  // Markdown state
  const [markdownStats, setMarkdownStats] = useState<any>(null);
  const [markdownIssues, setMarkdownIssues] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  // Update markdown stats when content changes
  useEffect(() => {
    if (editorMode === 'markdown' && markdown) {
      const stats = getContentStats(markdown);
      setMarkdownStats(stats);

      const issues = validateMarkdown(markdown);
      setMarkdownIssues(issues);
    }
  }, [markdown, editorMode]);

  // Sync content between modes
  useEffect(() => {
    if (editorMode === 'markdown' && markdown) {
      const html = markdownToHtml(markdown);
      setContent(html);
    }
  }, [markdown, editorMode]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    const result = await getTemplates();
    if (result.success && result.templates) {
      setTemplates(result.templates);
    }
    setLoadingTemplates(false);
  };

  const handleSend = async () => {
    if (!subject) {
      toast.error('Please add a subject line');
      return;
    }

    // Use markdown content if in markdown mode, otherwise use HTML content
    const finalContent =
      editorMode === 'markdown' && markdown
        ? markdownToHtml(markdown)
        : content;

    if (!finalContent) {
      toast.error('Please add content to your newsletter');
      return;
    }

    // Wrap in email template
    const emailHtml = wrapInEmailTemplate(finalContent, subject, preheader);

    setSending(true);
    try {
      const result = await sendNewsletterAction({
        subject,
        content: emailHtml,
        audience,
      });

      if (result.success) {
        toast.success('Newsletter sent!', {
          description: `Successfully sent to ${result.sent} subscribers`,
        });
        setSubject('');
        setContent('');
        setMarkdown('');
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

    if (editorMode === 'html') {
      setContent(finalContent);
    }

    const finalSubject = replaceTemplateVariables(
      selectedProfessionalTemplate.subject,
      templateVariables,
    );
    setSubject(finalSubject);

    toast.success('Content generated!', {
      description: 'Review and customize your newsletter',
    });
  };

  // Markdown toolbar actions
  const insertMarkdown = (
    before: string,
    after: string = '',
    placeholder: string = 'text',
  ) => {
    const textarea = document.querySelector(
      'textarea[name="markdown"]',
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    const insertion = before + (selectedText || placeholder) + after;
    const newMarkdown =
      markdown.substring(0, start) + insertion + markdown.substring(end);
    setMarkdown(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      const newPos =
        start + before.length + (selectedText || placeholder).length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const markdownTools: MarkdownTool[] = [
    {
      icon: Heading,
      label: 'Heading',
      action: () => insertMarkdown('## ', '', 'Heading'),
    },
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertMarkdown('**', '**', 'bold'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertMarkdown('*', '*', 'italic'),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)', 'link text'),
    },
    {
      icon: ImageIcon,
      label: 'Image',
      action: () => insertMarkdown('![', '](url)', 'alt text'),
    },
    {
      icon: List,
      label: 'List',
      action: () => insertMarkdown('\n* ', '', 'list item'),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertMarkdown('> ', '', 'quote'),
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertMarkdown('`', '`', 'code'),
    },
  ];

  const handleExportTemplate = () => {
    const templateData = {
      name: subject || 'Untitled Template',
      subject,
      content: editorMode === 'markdown' ? markdown : content,
      contentType: editorMode,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCurrentContent = () => {
    if (editorMode === 'markdown') {
      return (
        markdown ||
        '<p class="text-muted-foreground">Start writing in Markdown...</p>'
      );
    }
    return (
      content ||
      '<p class="text-muted-foreground">Your content will appear here...</p>'
    );
  };

  const getRenderedHtml = () => {
    if (editorMode === 'markdown' && markdown) {
      return markdownToHtml(markdown);
    }
    return content;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Newsletter Composer</h2>
          <p className='text-sm text-muted-foreground'>
            Create beautiful newsletters with Markdown, HTML, or Visual editor
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
                    onClick={() => setEditorMode('markdown')}
                    variant={editorMode === 'markdown' ? 'default' : 'ghost'}
                    size='sm'
                  >
                    <FileText className='h-4 w-4 mr-1' />
                    Markdown
                  </Button>
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

              {/* Markdown Toolbar */}
              {editorMode === 'markdown' && (
                <div className='flex flex-wrap gap-1 p-2 bg-muted/50 rounded-t-md border-b'>
                  {markdownTools.map((tool, index) => (
                    <Button
                      key={index}
                      onClick={tool.action}
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

              {/* Editor Textarea */}
              {editorMode === 'markdown' ? (
                <textarea
                  name='markdown'
                  placeholder='# Start writing in Markdown...

Write naturally with simple formatting:
- Use **bold** or *italic*
- Add [links](url) and ![images](url)
- Create lists with * or 1.
- Use > for quotes
- Add code with `backticks`'
                  value={markdown}
                  onChange={e => setMarkdown(e.target.value)}
                  className='h-96 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono'
                />
              ) : (
                <textarea
                  name='content'
                  placeholder={
                    editorMode === 'html'
                      ? '<h1>Your HTML content here...</h1>'
                      : 'Start typing or use the toolbar to format your content...'
                  }
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className='h-96 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono'
                />
              )}

              {/* Markdown Stats & Issues */}
              {editorMode === 'markdown' && markdownStats && (
                <div className='grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-md text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Words:</span>
                    <span className='font-semibold ml-2'>
                      {markdownStats.words}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Reading:</span>
                    <span className='font-semibold ml-2'>
                      {markdownStats.readingTime} min
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Links:</span>
                    <span className='font-semibold ml-2'>
                      {markdownStats.links}
                    </span>
                  </div>
                </div>
              )}

              {/* Markdown Issues */}
              {editorMode === 'markdown' && markdownIssues.length > 0 && (
                <div className='space-y-2'>
                  {markdownIssues.map((issue, i) => (
                    <div
                      key={i}
                      className='flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm'
                    >
                      <AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5 shrink-0' />
                      <span className='text-yellow-800 dark:text-yellow-200'>
                        {issue.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
              disabled={!subject || (!content && !markdown) || sending}
              className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
            >
              <Send className='mr-2 h-4 w-4' />
              {sending ? 'Sending...' : 'Send Now'}
            </Button>

            <Button
              onClick={handleExportTemplate}
              disabled={!subject || (!content && !markdown)}
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
                const html = getRenderedHtml();
                navigator.clipboard.writeText(html);
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
              className='prose prose-sm max-w-none dark:prose-invert'
              dangerouslySetInnerHTML={{
                __html: getRenderedHtml(),
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
