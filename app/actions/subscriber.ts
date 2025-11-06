/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/subscriber.ts
'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export interface Subscriber {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  lastOpenedAt: Date | null;
  name: string | null;
  joinedAt: Date | null;
}

interface SubscriberFilter {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export async function getSubscribers(filters: SubscriberFilter): Promise<{
  success: boolean;
  subscribers?: Subscriber[];
  total?: number;
  page?: number;
  perPage?: number;
  totalPages?: number;
  error?: string;
}> {
  try {
    const filter: any = {};
    if (filters.search) {
      filter.email = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }
    if (filters.status && filters.status !== 'all') {
      filter.status = filters.status;
    }

    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 10;

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          lastOpenedAt: true,
          name: true,
        },
      }),
      prisma.subscriber.count({ where: filter }),
    ]);

    const formatted = subscribers.map(sub => ({
      id: sub.id,
      email: sub.email,
      status: sub.status,
      createdAt: sub.createdAt,
      lastOpenedAt: sub.lastOpenedAt,
      joinedAt: sub.createdAt,
      name: sub.name,
    }));

    return {
      success: true,
      subscribers: formatted,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  } catch (error) {
    console.error('[getSubscribers Error]', error);
    return { success: false, error: 'Failed to fetch subscribers' };
  }
}

export async function deleteSubscribers(ids: string[]) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: 'Invalid subscriber IDs' };
    }

    await prisma.subscriber.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      success: true,
      message: `Deleted ${ids.length} subscriber(s)`,
    };
  } catch (error) {
    console.error('[deleteSubscribers Error]', error);
    return { success: false, error: 'Failed to delete subscribers' };
  }
}

export async function addSubscriber(email: string, name?: string) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber?.status === 'CONFIRMED') {
      return { success: false, error: 'Already subscribed' };
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${appUrl}/api/confirm-subscription?token=${confirmationToken}`;

    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: {
        status: 'PENDING',
        name: name || email.split('@')[0],
      },
      create: {
        email,
        name: name || email.split('@')[0],
        status: 'PENDING',
      },
    });

    // Store the token in VerificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: subscriber.email,
        token: confirmationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send confirmation email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #0070f3;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Our Newsletter!</h1>
            <p>Hi ${subscriber.name},</p>
            <p>Thank you for subscribing to our newsletter. To complete your subscription, please confirm your email address by clicking the button below:</p>
            <a href="${confirmationUrl}" class="button">Confirm Subscription</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0070f3;">${confirmationUrl}</p>
            <p>This confirmation link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't subscribe to this newsletter, you can safely ignore this email.</p>
              <p>© ${new Date().getFullYear()} Newsletter Service. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: subscriber.email,
        subject: 'Please confirm your newsletter subscription',
        html: emailHtml,
        text: `Welcome! Please confirm your subscription by visiting: ${confirmationUrl}`,
      });

      console.log(`[Confirmation Email Sent] To: ${subscriber.email}`);
    } catch (emailError) {
      console.error('[Email Send Error]', emailError);
      // Don't fail the subscription if email fails, but log it
      return {
        success: true,
        message:
          'Subscription created, but confirmation email failed to send. Please contact support.',
        email: subscriber.email,
        warning: 'Email delivery issue',
      };
    }

    return {
      success: true,
      message: 'Please check your email to confirm your subscription!',
      email: subscriber.email,
    };
  } catch (error) {
    console.error('[addSubscriber Error]', error);
    return { success: false, error: 'Failed to subscribe' };
  }
}

export async function confirmSubscription(token: string) {
  try {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gte: new Date(), // Not expired
        },
      },
    });

    if (!verificationToken) {
      return {
        success: false,
        error: 'Invalid or expired confirmation link',
      };
    }

    // Update subscriber status
    const subscriber = await prisma.subscriber.update({
      where: { email: verificationToken.identifier },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        subscribedAt: new Date(),
      },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    // Send welcome email
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .highlight {
              background-color: #f0f9ff;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Welcome Aboard!</h1>
            <p>Hi ${subscriber.name},</p>
            <p>Your subscription is now confirmed! You'll start receiving our newsletter soon.</p>
            <div class="highlight">
              <h3>What to expect:</h3>
              <ul>
                <li>Weekly curated content delivered to your inbox</li>
                <li>Industry insights and updates</li>
                <li>Exclusive tips and resources</li>
              </ul>
            </div>
            <p>Thank you for joining our community!</p>
            <p>Best regards,<br>The Newsletter Team</p>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: subscriber.email,
        subject: 'Welcome! Your subscription is confirmed',
        html: welcomeHtml,
      });
    } catch (emailError) {
      console.error('[Welcome Email Error]', emailError);
      // Don't fail confirmation if welcome email fails
    }

    return {
      success: true,
      message: 'Subscription confirmed successfully!',
      subscriber: {
        email: subscriber.email,
        name: subscriber.name,
      },
    };
  } catch (error) {
    console.error('[confirmSubscription Error]', error);
    return {
      success: false,
      error: 'Failed to confirm subscription',
    };
  }
}
