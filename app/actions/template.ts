// app/actions/template.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  preview: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

interface TemplateResponse {
  success: boolean;
  error?: string;
  template?: EmailTemplate;
  templates?: EmailTemplate[];
}

// Get all templates
export async function getTemplates(): Promise<TemplateResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      templates,
    };
  } catch (error) {
    console.error('[getTemplates Error]', error);
    return {
      success: false,
      error: 'Failed to fetch templates',
    };
  }
}

// Get single template
export async function getTemplate(id: string): Promise<TemplateResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error('[getTemplate Error]', error);
    return {
      success: false,
      error: 'Failed to fetch template',
    };
  }
}

// Create template
export async function createTemplate(data: {
  name: string;
  subject: string;
  content: string;
  preview?: string;
  category?: string;
}): Promise<TemplateResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    // Validate input
    if (!data.name || !data.subject || !data.content) {
      return {
        success: false,
        error: 'Missing required fields: name, subject, content',
      };
    }

    // Check if template name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name: data.name },
    });

    if (existingTemplate) {
      return {
        success: false,
        error: 'A template with this name already exists',
      };
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        preview: data.preview || null,
        category: data.category || 'general',
        authorId: session.user.id,
      },
    });

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error('[createTemplate Error]', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create template',
    };
  }
}

// Update template
export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    subject?: string;
    content?: string;
    preview?: string;
    category?: string;
  },
): Promise<TemplateResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    // If name is being changed, check if new name already exists
    if (data.name && data.name !== existingTemplate.name) {
      const nameExists = await prisma.emailTemplate.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        return {
          success: false,
          error: 'A template with this name already exists',
        };
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.subject && { subject: data.subject }),
        ...(data.content && { content: data.content }),
        ...(data.preview !== undefined && { preview: data.preview || null }),
        ...(data.category && { category: data.category }),
      },
    });

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error('[updateTemplate Error]', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update template',
    };
  }
}

// Delete template
export async function deleteTemplate(id: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    // Check if template exists
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        newsletters: true,
      },
    });

    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    // Check if template is being used by any newsletters
    if (template.newsletters.length > 0) {
      return {
        success: false,
        error: `Cannot delete template. It is being used by ${template.newsletters.length} newsletter(s)`,
      };
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Template deleted successfully',
    };
  } catch (error) {
    console.error('[deleteTemplate Error]', error);
    return {
      success: false,
      error: 'Failed to delete template',
    };
  }
}

// Delete multiple templates
export async function deleteTemplates(ids: string[]): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  deleted?: number;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        success: false,
        error: 'Invalid template IDs',
      };
    }

    // Check if any templates are being used
    const templates = await prisma.emailTemplate.findMany({
      where: { id: { in: ids } },
      include: {
        newsletters: true,
      },
    });

    const templatesInUse = templates.filter(t => t.newsletters.length > 0);

    if (templatesInUse.length > 0) {
      return {
        success: false,
        error: `Cannot delete ${templatesInUse.length} template(s) that are being used by newsletters`,
      };
    }

    const result = await prisma.emailTemplate.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      success: true,
      message: `Deleted ${result.count} template(s)`,
      deleted: result.count,
    };
  } catch (error) {
    console.error('[deleteTemplates Error]', error);
    return {
      success: false,
      error: 'Failed to delete templates',
    };
  }
}
