// app/actions/email-builder.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface SaveEmailTemplateData {
  name: string;
  components: unknown;
  html: string;
  subject?: string;
  preview?: string;
}

export async function saveEmailTemplate(data: SaveEmailTemplateData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // Validate input
    if (!data.name || !data.html) {
      return { success: false, error: 'Missing required fields: name, html' };
    }

    // Check if template name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name: data.name },
    });

    if (existingTemplate) {
      return {
        success: false,
        error:
          'A template with this name already exists. Please choose a different name.',
      };
    }

    const subject = data.subject || data.name;

    // Create the template
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        content: data.html,
        preview: `Email builder template - ${data.name}` || null,
        category: 'custom',
        authorId: session.user.id,
        // Store components as JSON string in subject field (reusing existing field)
        subject,
      },
    });

    return {
      success: true,
      template: {
        id: template.id,
        name: template.name,
        content: template.content,
        preview: template.preview,
        category: template.category,
        createdAt: template.createdAt,
      },
    };
  } catch (error) {
    console.error('[saveEmailTemplate Error]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save template',
    };
  }
}
