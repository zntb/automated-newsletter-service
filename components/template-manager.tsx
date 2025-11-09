'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Trash2,
  Eye,
  Copy,
  Edit,
  Mail,
  Calendar,
  User,
  Building,
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
import { toast } from 'sonner';
import {
  getTemplates,
  deleteTemplate,
  type EmailTemplate,
} from '@/app/actions/template';

export default function TemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getTemplates();
      if (result.success && result.templates) {
        setTemplates(result.templates);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await deleteTemplate(id);
    if (result.success) {
      toast.success('Template deleted');
      setTemplates(templates.filter(t => t.id !== id));
    } else {
      toast.error(result.error || 'Failed to delete template');
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Template HTML copied to clipboard');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.subject.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Email Templates</h2>
          <p className='text-sm text-muted-foreground'>
            Manage and preview your email templates
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search templates...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-10 bg-card'
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className='w-[180px] bg-card'>
            <SelectValue placeholder='All categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className='p-12 text-center'>
          <Mail className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
          <h3 className='text-lg font-semibold mb-2'>No templates found</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            {search || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first template to get started'}
          </p>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className='bg-card p-6 hover:shadow-lg transition-shadow'
            >
              <div className='space-y-4'>
                <div>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='font-bold text-lg line-clamp-1'>
                      {template.name}
                    </h3>
                    <span className='text-xs px-2 py-1 bg-primary/10 text-primary rounded-full'>
                      {template.category}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {template.preview || template.subject}
                  </p>
                </div>

                <div className='space-y-2 text-xs text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-3 w-3' />
                    <span>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {template.authorId ? (
                      <>
                        <User className='h-3 w-3' />
                        <span>Custom template</span>
                      </>
                    ) : (
                      <>
                        <Building className='h-3 w-3' />
                        <span>System template</span>
                      </>
                    )}
                  </div>
                </div>

                <div className='flex gap-2'>
                  <Button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}
                    variant='outline'
                    size='sm'
                    className='flex-1'
                  >
                    <Eye className='h-4 w-4 mr-1' />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleCopyContent(template.content)}
                    variant='outline'
                    size='sm'
                    className='flex-1'
                  >
                    <Copy className='h-4 w-4 mr-1' />
                    Copy
                  </Button>
                </div>

                <div className='flex gap-2'>
                  <Button
                    onClick={() => {
                      // TODO: Implement edit functionality
                      toast.info('Edit functionality coming soon');
                    }}
                    variant='outline'
                    size='sm'
                    className='flex-1'
                  >
                    <Edit className='h-4 w-4 mr-1' />
                    Edit
                  </Button>
                  {template.authorId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1 text-destructive hover:bg-destructive/10'
                        >
                          <Trash2 className='h-4 w-4 mr-1' />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete template?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{template.name}". This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(template.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedTemplate?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTemplate?.preview || selectedTemplate?.subject}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='border rounded-md p-4 bg-white'>
            <div
              dangerouslySetInnerHTML={{
                __html: selectedTemplate?.content || '',
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedTemplate) {
                  handleCopyContent(selectedTemplate.content);
                }
              }}
            >
              <Copy className='h-4 w-4 mr-2' />
              Copy HTML
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
