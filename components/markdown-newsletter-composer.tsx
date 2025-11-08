/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  Eye,
  Bold,
  Italic,
  Link,
  List,
  Code,
  Image,
  Heading,
  Quote,
  Table,
  FileText,
  Copy,
  Download,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

// Markdown to HTML converter (simplified - in production use 'marked' or 'remark')
const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^\)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />',
  );

  // Code blocks
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<pre><code>$2</code></pre>',
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^> (.+$)/gim, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^\* (.+$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+$)/gim, '<li>$1</li>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/^(?!<[h|p|u|o|b])/gim, '<p>');
  html = html.replace(/(?!<\/[h|p|u|o|b]>)$/gim, '</p>');

  return html;
};

// Markdown syntax guide
const MarkdownGuide = () => (
  <Card className='p-4 bg-muted/50 text-sm space-y-2'>
    <h4 className='font-semibold mb-2'>Markdown Quick Reference</h4>
    <div className='grid grid-cols-2 gap-4'>
      <div>
        <p className='font-mono text-xs mb-1'># Heading 1</p>
        <p className='font-mono text-xs mb-1'>## Heading 2</p>
        <p className='font-mono text-xs mb-1'>### Heading 3</p>
        <p className='font-mono text-xs mb-1'>**bold text**</p>
        <p className='font-mono text-xs mb-1'>*italic text*</p>
      </div>
      <div>
        <p className='font-mono text-xs mb-1'>[link](url)</p>
        <p className='font-mono text-xs mb-1'>![image](url)</p>
        <p className='font-mono text-xs mb-1'>* list item</p>
        <p className='font-mono text-xs mb-1'>`inline code`</p>
        <p className='font-mono text-xs mb-1'>&gt; quote</p>
      </div>
    </div>
  </Card>
);

export default function MarkdownNewsletterComposer() {
  const [subject, setSubject] = useState('');
  const [markdown, setMarkdown] = useState(`# Welcome to Our Newsletter!

Thanks for subscribing! Here's what's new this week.

## 📰 Top Stories

### Feature Release: Dark Mode
We're excited to announce **dark mode** is now available! Switch between light and dark themes in your settings.

[Learn more →](https://example.com)

### Community Spotlight
Meet *Sarah Chen*, this month's contributor of the month. Her work on improving accessibility has been outstanding.

## 💡 Quick Tips

* Use keyboard shortcuts to work faster
* Enable notifications for important updates
* Customize your dashboard layout

> "The best way to predict the future is to create it." - Peter Drucker

## 📊 By The Numbers

Here's what happened last month:
- **1,240** new subscribers
- **89%** open rate
- **45%** click-through rate

\`\`\`javascript
// Sample code block
const newsletter = {
  frequency: 'weekly',
  subscribers: 1240
};
\`\`\`

---

Thanks for reading! Reply to this email with any questions.

Best regards,  
The Team`);
  const [preheader, setPreheader] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const markdownTools = [
    { icon: Heading, label: 'Heading', syntax: '## ' },
    { icon: Bold, label: 'Bold', syntax: '****', offset: 2 },
    { icon: Italic, label: 'Italic', syntax: '**', offset: 1 },
    { icon: Link, label: 'Link', syntax: '[text](url)' },
    { icon: Image, label: 'Image', syntax: '![alt](url)' },
    { icon: List, label: 'List', syntax: '* ' },
    { icon: Quote, label: 'Quote', syntax: '> ' },
    { icon: Code, label: 'Code', syntax: '``', offset: 1 },
    {
      icon: Table,
      label: 'Table',
      syntax:
        '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n',
    },
  ];

  const insertMarkdown = (syntax: string, offset?: number) => {
    const textarea = document.querySelector(
      'textarea[name="markdown"]',
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    let insertion = syntax;
    if (syntax.includes('text')) {
      insertion = syntax.replace('text', selectedText || 'text');
    } else if (syntax.includes('**') && offset) {
      insertion =
        syntax.slice(0, offset) +
        (selectedText || 'text') +
        syntax.slice(offset);
    } else {
      insertion = syntax + selectedText;
    }

    const newMarkdown =
      markdown.substring(0, start) + insertion + markdown.substring(end);
    setMarkdown(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + insertion.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleSend = async () => {
    if (!subject || !markdown) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);

    // Convert markdown to HTML
    // const htmlContent = markdownToHtml(markdown);

    // Simulate sending
    setTimeout(() => {
      toast.success('Newsletter sent!', {
        description: 'Your newsletter has been sent to all subscribers',
      });
      setSending(false);
    }, 2000);
  };

  const copyHtml = () => {
    const html = markdownToHtml(markdown);
    navigator.clipboard.writeText(html);
    toast.success('HTML copied to clipboard');
  };

  const exportMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown exported');
  };

  return (
    <div className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Markdown Newsletter Composer</h1>
            <p className='text-muted-foreground'>
              Write beautiful newsletters with Markdown
            </p>
          </div>
          <Button
            onClick={() =>
              setActiveTab(activeTab === 'write' ? 'preview' : 'write')
            }
            variant='outline'
          >
            <Eye className='h-4 w-4 mr-2' />
            {activeTab === 'write' ? 'Preview' : 'Edit'}
          </Button>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Editor */}
          <div className='lg:col-span-2 space-y-6'>
            <Card className='p-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Subject Line *
                  </label>
                  <Input
                    placeholder='Your amazing subject line...'
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Preheader Text
                  </label>
                  <Input
                    placeholder='Preview text that appears after the subject'
                    value={preheader}
                    onChange={e => setPreheader(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Tabs
              value={activeTab}
              onValueChange={v => setActiveTab(v as any)}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='write'>
                  <FileText className='h-4 w-4 mr-2' />
                  Write
                </TabsTrigger>
                <TabsTrigger value='preview'>
                  <Eye className='h-4 w-4 mr-2' />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value='write' className='space-y-4'>
                <Card className='p-4'>
                  {/* Toolbar */}
                  <div className='flex flex-wrap gap-1 pb-4 mb-4 border-b'>
                    {markdownTools.map((tool, index) => (
                      <Button
                        key={index}
                        onClick={() => insertMarkdown(tool.syntax, tool.offset)}
                        variant='ghost'
                        size='sm'
                        title={tool.label}
                      >
                        <tool.icon className='h-4 w-4' />
                      </Button>
                    ))}
                  </div>

                  {/* Editor */}
                  <textarea
                    name='markdown'
                    value={markdown}
                    onChange={e => setMarkdown(e.target.value)}
                    placeholder='Start writing in Markdown...'
                    className='w-full h-[600px] resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </Card>

                <MarkdownGuide />
              </TabsContent>

              <TabsContent value='preview'>
                <Card className='p-8'>
                  <div className='space-y-4'>
                    {/* Email Header */}
                    <div className='pb-4 border-b'>
                      <h2 className='text-2xl font-bold mb-2'>
                        {subject || 'Your Subject Line'}
                      </h2>
                      {preheader && (
                        <p className='text-sm text-muted-foreground'>
                          {preheader}
                        </p>
                      )}
                      <p className='text-xs text-muted-foreground mt-2'>
                        To: All subscribers
                      </p>
                    </div>

                    {/* Rendered Content */}
                    <div
                      className='prose prose-sm max-w-none dark:prose-invert'
                      dangerouslySetInnerHTML={{
                        __html:
                          markdownToHtml(markdown) ||
                          '<p class="text-muted-foreground">Your content will appear here...</p>',
                      }}
                    />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <Card className='p-6'>
              <h3 className='font-bold mb-4 flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-primary' />
                Actions
              </h3>
              <div className='space-y-3'>
                <Button
                  onClick={handleSend}
                  disabled={!subject || !markdown || sending}
                  className='w-full'
                >
                  <Send className='h-4 w-4 mr-2' />
                  {sending ? 'Sending...' : 'Send Newsletter'}
                </Button>

                <Button
                  onClick={copyHtml}
                  variant='outline'
                  className='w-full'
                  disabled={!markdown}
                >
                  <Copy className='h-4 w-4 mr-2' />
                  Copy HTML
                </Button>

                <Button
                  onClick={exportMarkdown}
                  variant='outline'
                  className='w-full'
                  disabled={!markdown}
                >
                  <Download className='h-4 w-4 mr-2' />
                  Export Markdown
                </Button>
              </div>
            </Card>

            {/* Stats */}
            <Card className='p-6'>
              <h3 className='font-bold mb-4'>Content Stats</h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Words:</span>
                  <span className='font-semibold'>
                    {markdown.split(/\s+/).filter(Boolean).length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Characters:</span>
                  <span className='font-semibold'>{markdown.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Reading Time:</span>
                  <span className='font-semibold'>
                    {Math.ceil(
                      markdown.split(/\s+/).filter(Boolean).length / 200,
                    )}{' '}
                    min
                  </span>
                </div>
              </div>
            </Card>

            {/* Email Settings */}
            <Card className='p-6'>
              <h3 className='font-bold mb-4'>Send Options</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Audience
                  </label>
                  <select className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm'>
                    <option>All subscribers</option>
                    <option>Active only</option>
                    <option>New subscribers</option>
                    <option>Highly engaged</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Schedule
                  </label>
                  <Input type='datetime-local' />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
