import nodemailer from 'nodemailer';

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

// Send single email
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
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

    console.log(`[Email Sent] To: ${to}, Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[Email Error]', error);
    throw new Error(`Failed to send email to ${to}`);
  }
}

// Send newsletter to multiple subscribers
export async function sendNewsletter({
  subject,
  content,
  subscribers,
  audience,
}: {
  subject: string;
  content: string;
  subscribers: string[];
  audience?: string;
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

    const promises = batch.map(email =>
      transporter
        .sendMail({
          from: process.env.EMAIL_FROM || 'noreply@newsletter.com',
          to: email,
          subject,
          html: content,
        })
        .then(() => {
          sent++;
        })
        .catch((error: Error) => {
          failed++;
          errors.push(`${email}: ${error.message}`);
        }),
    );

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
