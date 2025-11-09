/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Save,
  Eye,
  Download,
  Upload,
  Smartphone,
  Monitor,
  Tablet,
  X,
  Image,
  Type,
  Square,
  Columns,
  Layout,
  Mail,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';

// Component types for the builder
interface EmailComponent {
  id: string;
  type:
    | 'text'
    | 'image'
    | 'button'
    | 'divider'
    | 'spacer'
    | 'columns'
    | 'header'
    | 'footer';
  content?: string;
  src?: string;
  alt?: string;
  href?: string;
  bgColor?: string;
  textColor?: string;
  padding?: string;
  align?: 'left' | 'center' | 'right';
  columns?: EmailComponent[][];
}

// Component library
const componentLibrary = [
  { type: 'text', icon: Type, label: 'Text', color: 'bg-blue-500' },
  { type: 'image', icon: Image, label: 'Image', color: 'bg-green-500' },
  { type: 'button', icon: Square, label: 'Button', color: 'bg-purple-500' },
  { type: 'divider', icon: Layout, label: 'Divider', color: 'bg-gray-500' },
  { type: 'columns', icon: Columns, label: 'Columns', color: 'bg-orange-500' },
  { type: 'header', icon: Mail, label: 'Header', color: 'bg-pink-500' },
];

const initialComponents: EmailComponent[] = [
  {
    id: '1',
    type: 'header',
    content: 'Welcome to Our Newsletter',
    bgColor: '#667eea',
    textColor: '#ffffff',
    padding: '40px 20px',
    align: 'center',
  },
  {
    id: '2',
    type: 'text',
    content:
      'Start building your email by dragging components from the left sidebar.',
    padding: '20px',
    align: 'left',
  },
];

export default function EmailBuilder() {
  const [components, setComponents] =
    useState<EmailComponent[]>(initialComponents);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  );
  const [previewMode, setPreviewMode] = useState<
    'desktop' | 'tablet' | 'mobile'
  >('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const componentIdCounter = useRef(1);

  // Add new component
  const addComponent = (type: string) => {
    const componentId = `component-${componentIdCounter.current++}`;
    const newComponent: EmailComponent = {
      id: componentId,
      type: type as any,
      content: getDefaultContent(type),
      padding: '20px',
      align: 'left',
    };

    if (type === 'button') {
      newComponent.bgColor = '#667eea';
      newComponent.textColor = '#ffffff';
      newComponent.href = '#';
    }

    if (type === 'image') {
      newComponent.src = 'https://via.placeholder.com/600x300';
      newComponent.alt = 'Placeholder image';
    }

    if (type === 'columns') {
      newComponent.columns = [
        [
          {
            id: `${componentId}-col-1`,
            type: 'text',
            content: 'Column 1',
            padding: '10px',
          },
        ],
        [
          {
            id: `${componentId}-col-2`,
            type: 'text',
            content: 'Column 2',
            padding: '10px',
          },
        ],
      ];
    }

    setComponents([...components, newComponent]);
    toast.success('Component added');
  };

  const getDefaultContent = (type: string): string => {
    const defaults: Record<string, string> = {
      text: 'Enter your text here...',
      button: 'Click Me',
      header: 'Header Text',
      footer: 'Footer Text',
      divider: '',
      spacer: '',
    };
    return defaults[type] || '';
  };

  // Update component
  const updateComponent = (id: string, updates: Partial<EmailComponent>) => {
    setComponents(
      components.map(c => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  // Delete component
  const deleteComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
    toast.success('Component deleted');
  };

  // Move component
  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(c => c.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === components.length - 1)
    ) {
      return;
    }

    const newComponents = [...components];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newComponents[index], newComponents[newIndex]] = [
      newComponents[newIndex],
      newComponents[index],
    ];
    setComponents(newComponents);
  };

  // Drag and drop handlers
  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-primary', 'bg-primary/5');
    }
  };

  const handleDragLeave = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-primary', 'bg-primary/5');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedType) {
      addComponent(draggedType);
      setDraggedType(null);
    }
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-primary', 'bg-primary/5');
    }
  };

  // Generate HTML
  const generateHTML = (): string => {
    const componentHTML = components
      .map(component => {
        switch (component.type) {
          case 'text':
            return `<div style="padding: ${component.padding}; text-align: ${
              component.align
            };">
            <p style="margin: 0; color: ${component.textColor || '#333'};">${
              component.content
            }</p>
          </div>`;

          case 'image':
            return `<div style="padding: ${component.padding}; text-align: ${component.align};">
            <img src="${component.src}" alt="${component.alt}" style="max-width: 100%; height: auto; display: block;" />
          </div>`;

          case 'button':
            return `<div style="padding: ${component.padding}; text-align: ${component.align};">
            <a href="${component.href}" style="display: inline-block; padding: 12px 24px; background-color: ${component.bgColor}; color: ${component.textColor}; text-decoration: none; border-radius: 4px; font-weight: 600;">
              ${component.content}
            </a>
          </div>`;

          case 'divider':
            return `<div style="padding: ${component.padding};">
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;" />
          </div>`;

          case 'header':
            return `<div style="padding: ${component.padding}; text-align: ${component.align}; background-color: ${component.bgColor};">
            <h1 style="margin: 0; color: ${component.textColor}; font-size: 28px; font-weight: 700;">${component.content}</h1>
          </div>`;

          case 'columns':
            const columnHTML = component.columns
              ?.map(column => {
                const colContent = column
                  .map(c => {
                    if (c.type === 'text') {
                      return `<p style="margin: 0; padding: ${c.padding};">${c.content}</p>`;
                    }
                    return '';
                  })
                  .join('');
                return `<td style="width: 50%; vertical-align: top;">${colContent}</td>`;
              })
              .join('');
            return `<table style="width: 100%; padding: ${component.padding};">
            <tr>${columnHTML}</tr>
          </table>`;

          default:
            return '';
        }
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${componentHTML}
  </div>
</body>
</html>`;
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!templateName) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      const html = generateHTML();

      // Extract a clean subject from the content
      const extractSubjectFromContent = () => {
        // Look for header content first
        const header = components.find(c => c.type === 'header');
        if (header?.content) {
          return header.content.substring(0, 100); // Limit subject length
        }

        // Otherwise use template name
        return templateName;
      };

      const subject = extractSubjectFromContent();

      // Import the server action
      const { saveEmailTemplate } = await import('@/app/actions/email-builder');

      const result = await saveEmailTemplate({
        name: templateName,
        subject: subject, // Save clean subject
        components,
        html,
        preview: templateName, // Use template name as preview
      });

      if (result.success) {
        toast.success('Template saved successfully!');
        setShowSaveDialog(false);
        setTemplateName('');
      } else {
        toast.error(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // Export HTML
  const handleExport = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${componentIdCounter.current}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template exported!');
  };

  // Preview width based on mode
  const previewWidth = {
    desktop: '600px',
    tablet: '768px',
    mobile: '375px',
  }[previewMode];

  const selectedComp = components.find(c => c.id === selectedComponent);

  return (
    <div className='flex h-screen bg-background'>
      {/* Component Library Sidebar */}
      <div className='w-64 border-r border-border bg-card p-4 overflow-y-auto'>
        <h3 className='font-bold mb-4 flex items-center gap-2'>
          <Layout className='h-5 w-5' />
          Components
        </h3>
        <div className='space-y-2'>
          {componentLibrary.map(comp => (
            <div
              key={comp.type}
              draggable
              onDragStart={() => handleDragStart(comp.type)}
              onClick={() => addComponent(comp.type)}
              className='flex items-center gap-3 p-3 rounded-lg border-2 border-border hover:border-primary cursor-move transition-all hover:shadow-md'
            >
              <div className={`${comp.color} p-2 rounded`}>
                <comp.icon className='h-4 w-4 text-white' />
              </div>
              <span className='font-medium text-sm'>{comp.label}</span>
            </div>
          ))}
        </div>

        <div className='mt-6 pt-6 border-t'>
          <h4 className='font-semibold mb-3 text-sm'>Quick Actions</h4>
          <div className='space-y-2'>
            <Button
              onClick={() => setShowSaveDialog(true)}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <Save className='h-4 w-4 mr-2' />
              Save Template
            </Button>
            <Button
              onClick={handleExport}
              variant='outline'
              size='sm'
              className='w-full justify-start'
            >
              <Download className='h-4 w-4 mr-2' />
              Export HTML
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className='flex-1 flex flex-col'>
        {/* Toolbar */}
        <div className='border-b border-border bg-card p-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Button
              onClick={() => setPreviewMode('desktop')}
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size='sm'
            >
              <Monitor className='h-4 w-4' />
            </Button>
            <Button
              onClick={() => setPreviewMode('tablet')}
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size='sm'
            >
              <Tablet className='h-4 w-4' />
            </Button>
            <Button
              onClick={() => setPreviewMode('mobile')}
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size='sm'
            >
              <Smartphone className='h-4 w-4' />
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant='outline'
              size='sm'
            >
              <Eye className='h-4 w-4 mr-2' />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className='flex-1 overflow-auto p-8 bg-muted/30'>
          <div
            className='mx-auto transition-all duration-200'
            style={{ maxWidth: previewWidth }}
          >
            {showPreview ? (
              <div
                className='bg-white shadow-xl'
                dangerouslySetInnerHTML={{ __html: generateHTML() }}
              />
            ) : (
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className='bg-white shadow-xl min-h-[600px] border-2 border-dashed border-border rounded-lg transition-colors'
              >
                {components.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-[600px] text-center p-8'>
                    <Upload className='h-16 w-16 text-muted-foreground mb-4' />
                    <h3 className='text-xl font-semibold mb-2'>
                      Drag & Drop Components
                    </h3>
                    <p className='text-muted-foreground'>
                      Start building your email by dragging components from the
                      sidebar
                    </p>
                  </div>
                ) : (
                  components.map((component, index) => (
                    <div
                      key={component.id}
                      onClick={() => setSelectedComponent(component.id)}
                      className={`relative group ${
                        selectedComponent === component.id
                          ? 'ring-2 ring-primary'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                    >
                      {/* Component Content */}
                      {component.type === 'text' && (
                        <div
                          style={{
                            padding: component.padding,
                            textAlign: component.align,
                          }}
                        >
                          <p className='m-0'>{component.content}</p>
                        </div>
                      )}

                      {component.type === 'image' && (
                        <div
                          style={{
                            padding: component.padding,
                            textAlign: component.align,
                          }}
                        >
                          <img
                            src={component.src}
                            alt={component.alt}
                            className='max-w-full h-auto'
                          />
                        </div>
                      )}

                      {component.type === 'button' && (
                        <div
                          style={{
                            padding: component.padding,
                            textAlign: component.align,
                          }}
                        >
                          <button
                            style={{
                              backgroundColor: component.bgColor,
                              color: component.textColor,
                              padding: '12px 24px',
                              borderRadius: '4px',
                              border: 'none',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {component.content}
                          </button>
                        </div>
                      )}

                      {component.type === 'divider' && (
                        <div style={{ padding: component.padding }}>
                          <hr className='border-0 border-t border-gray-300' />
                        </div>
                      )}

                      {component.type === 'header' && (
                        <div
                          style={{
                            padding: component.padding,
                            backgroundColor: component.bgColor,
                            textAlign: component.align,
                          }}
                        >
                          <h1
                            style={{
                              margin: 0,
                              color: component.textColor,
                              fontSize: '28px',
                              fontWeight: 700,
                            }}
                          >
                            {component.content}
                          </h1>
                        </div>
                      )}

                      {component.type === 'columns' && (
                        <div
                          className='grid grid-cols-2 gap-4'
                          style={{ padding: component.padding }}
                        >
                          {component.columns?.map((column, colIndex) => (
                            <div key={colIndex}>
                              {column.map(c => (
                                <div key={c.id} style={{ padding: c.padding }}>
                                  {c.content}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Component Actions */}
                      <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            moveComponent(component.id, 'up');
                          }}
                          disabled={index === 0}
                          size='sm'
                          variant='secondary'
                          className='h-7 w-7 p-0'
                        >
                          ↑
                        </Button>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            moveComponent(component.id, 'down');
                          }}
                          disabled={index === components.length - 1}
                          size='sm'
                          variant='secondary'
                          className='h-7 w-7 p-0'
                        >
                          ↓
                        </Button>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            deleteComponent(component.id);
                          }}
                          size='sm'
                          variant='destructive'
                          className='h-7 w-7 p-0'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedComp && !showPreview && (
        <div className='w-80 border-l border-border bg-card p-4 overflow-y-auto'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-bold'>Properties</h3>
            <Button
              onClick={() => setSelectedComponent(null)}
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='space-y-4'>
            {(selectedComp.type === 'text' ||
              selectedComp.type === 'button' ||
              selectedComp.type === 'header') && (
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Content
                </label>
                <textarea
                  value={selectedComp.content || ''}
                  onChange={e =>
                    updateComponent(selectedComp.id, {
                      content: e.target.value,
                    })
                  }
                  className='w-full h-24 rounded-md border border-border bg-background px-3 py-2 text-sm'
                />
              </div>
            )}

            {selectedComp.type === 'image' && (
              <>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Image URL
                  </label>
                  <Input
                    value={selectedComp.src || ''}
                    onChange={e =>
                      updateComponent(selectedComp.id, { src: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Alt Text
                  </label>
                  <Input
                    value={selectedComp.alt || ''}
                    onChange={e =>
                      updateComponent(selectedComp.id, { alt: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {selectedComp.type === 'button' && (
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Link URL
                </label>
                <div className='flex items-center gap-2'>
                  <Link2 className='h-4 w-4 text-muted-foreground' />
                  <Input
                    value={selectedComp.href || ''}
                    onChange={e =>
                      updateComponent(selectedComp.id, { href: e.target.value })
                    }
                    placeholder='https://example.com'
                  />
                </div>
              </div>
            )}

            <div>
              <label className='block text-sm font-medium mb-2'>
                Alignment
              </label>
              <Select
                value={selectedComp.align || 'left'}
                onValueChange={(value: any) =>
                  updateComponent(selectedComp.id, { align: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='left'>Left</SelectItem>
                  <SelectItem value='center'>Center</SelectItem>
                  <SelectItem value='right'>Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Padding</label>
              <Input
                value={selectedComp.padding || ''}
                onChange={e =>
                  updateComponent(selectedComp.id, { padding: e.target.value })
                }
                placeholder='20px'
              />
            </div>

            {(selectedComp.type === 'button' ||
              selectedComp.type === 'header') && (
              <>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Background Color
                  </label>
                  <Input
                    type='color'
                    value={selectedComp.bgColor || '#667eea'}
                    onChange={e =>
                      updateComponent(selectedComp.id, {
                        bgColor: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Text Color
                  </label>
                  <Input
                    type='color'
                    value={selectedComp.textColor || '#ffffff'}
                    onChange={e =>
                      updateComponent(selectedComp.id, {
                        textColor: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Template Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Email Template</AlertDialogTitle>
            <AlertDialogDescription>
              Give your template a name to save it for future use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <Input
              placeholder='My Awesome Template'
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveTemplate}>
              Save Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
