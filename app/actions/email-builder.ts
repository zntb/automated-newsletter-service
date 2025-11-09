/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/email-builder.ts
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function saveEmailTemplate(data: {
  name: string;
  components: any;
  html: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const template = await prisma.emailTemplate.create({
    data: {
      name: data.name,
      content: data.html,
      preview: data.name,
      category: 'custom',
      authorId: session.user.id,
      // Store components as JSON
      subject: JSON.stringify(data.components),
    },
  });

  return { success: true, template };
}
