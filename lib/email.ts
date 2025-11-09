import nodemailer from 'nodemailer';
import { prisma } from './prisma';

const createTransporter = () => {
  // Gmail configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // SMTP configuration (Mailgun, SendGrid, etc.)
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Fallback for development
  console.warn(
    '[Email] Using development mode - install Mailhog or configure SMTP',
  );
  return nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
  });
};

// ✅ NEW: Helper function to personalize content for each subscriber
function personalizeContent(
  content: string,
  subscriber: { email: string; name?: string | null },
): string {
  let personalized = content;

  // Replace {{user_name}} with subscriber name or fallback to email prefix
  const displayName = subscriber.name || subscriber.email.split('@')[0];
  personalized = personalized.replace(/\{\{user_name\}\}/g, displayName);

  // Replace {{email}} if used in template
  personalized = personalized.replace(/\{\{email\}\}/g, subscriber.email);

  // Replace {{first_name}} - extract first name from full name or use display name
  const firstName =
    subscriber.name?.split(' ')[0] || subscriber.email.split('@')[0];
  personalized = personalized.replace(/\{\{first_name\}\}/g, firstName);

  // Add unsubscribe URL with subscriber email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(
    subscriber.email,
  )}`;
  personalized = personalized.replace(
    /\{\{unsubscribe_url\}\}/g,
    unsubscribeUrl,
  );

  return personalized;
}

// Send single email
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  subscriberId,
  newsletterId,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  subscriberId?: string;
  newsletterId?: string;
}) {
  const transporter = createTransporter();

  try {
    const result = await transporter.sendMail({
      from: from || process.env.EMAIL_FROM || 'noreply@newsletter.com',
      to,
      subject,
      html: html || text,
      text: text,
    });

    // Log to database if subscriberId and newsletterId provided
    if (subscriberId && newsletterId) {
      await prisma.emailLog.create({
        data: {
          messageId: result.messageId,
          recipientEmail: to,
          subscriberId,
          newsletterId,
          status: 'SENT',
        },
      });
    }

    console.log(`[Email Sent] To: ${to}, Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[Email Error]', error);
    throw new Error(`Failed to send email to ${to}`);
  }
}

// ✅ UPDATED: Send newsletter to multiple subscribers with personalization
export async function sendNewsletter({
  subject,
  content,
  subscribers,
  audience,
  newsletterId,
}: {
  subject: string;
  content: string;
  subscribers: Array<{ id: string; email: string; name: string | null }>; // ✅ Updated type
  audience?: string;
  newsletterId?: string;
}) {
  if (subscribers.length === 0) {
    throw new Error('No subscribers provided');
  }

  const transporter = createTransporter();
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Send emails in batches
  const batchSize = 10;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    const promises = batch.map(subscriber => {
      // ✅ PERSONALIZE content for each subscriber
      const personalizedSubject = personalizeContent(subject, subscriber);
      const personalizedContent = personalizeContent(content, subscriber);

      return transporter
        .sendMail({
          from: process.env.EMAIL_FROM || 'noreply@newsletter.com',
          to: subscriber.email,
          subject: personalizedSubject,
          html: personalizedContent,
        })
        .then(async result => {
          sent++;
          // Log to database
          if (newsletterId) {
            await prisma.emailLog.create({
              data: {
                messageId: result.messageId,
                recipientEmail: subscriber.email,
                subscriberId: subscriber.id,
                newsletterId,
                status: 'SENT',
              },
            });
          }
        })
        .catch(error => {
          failed++;
          errors.push(`${subscriber.email}: ${error.message}`);
        });
    });

    await Promise.all(promises);
  }

  console.log(
    `[Newsletter Sent] Audience: ${audience}, Sent: ${sent}, Failed: ${failed}`,
  );

  return {
    sent,
    failed,
    total: subscribers.length,
    errors: failed > 0 ? errors : undefined,
  };
}
