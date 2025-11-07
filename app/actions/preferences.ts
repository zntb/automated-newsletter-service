/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/preferences.ts
'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

interface SubscribeWithPreferencesData {
  email: string;
  name?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'REALTIME';
  categories: string[];
}

export async function subscribeWithPreferences(
  data: SubscribeWithPreferencesData,
) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Invalid email address' };
    }

    if (!data.categories || data.categories.length === 0) {
      return { success: false, error: 'Please select at least one category' };
    }

    // Check if subscriber exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: data.email },
      include: { preferences: true },
    });

    if (existingSubscriber?.status === 'CONFIRMED') {
      return {
        success: false,
        error:
          'This email is already subscribed. Use the manage preferences link in your emails to update.',
      };
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${appUrl}/api/confirm-subscription?token=${confirmationToken}`;

    // Create or update subscriber
    const subscriber = await prisma.subscriber.upsert({
      where: { email: data.email },
      update: {
        status: 'PENDING',
        name: data.name || data.email.split('@')[0],
        tags: data.categories,
      },
      create: {
        email: data.email,
        name: data.name || data.email.split('@')[0],
        status: 'PENDING',
        tags: data.categories,
      },
    });

    // Create or update preferences
    await prisma.subscriberPreference.upsert({
      where: { subscriberId: subscriber.id },
      update: {
        frequency: data.frequency as any,
        categories: data.categories,
        noEmails: false,
      },
      create: {
        subscriberId: subscriber.id,
        frequency: data.frequency as any,
        categories: data.categories,
        noEmails: false,
      },
    });

    // Store the token
    await prisma.verificationToken.create({
      data: {
        identifier: subscriber.email,
        token: confirmationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send confirmation email
    const frequencyLabels = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      MONTHLY: 'Monthly',
      REALTIME: 'Real-time',
    };

    const categoryNames = {
      tech: 'Technology',
      business: 'Business',
      lifestyle: 'Lifestyle',
      finance: 'Finance',
      marketing: 'Marketing',
      design: 'Design',
      development: 'Development',
      productivity: 'Productivity',
    };

    const selectedCategories = data.categories
      .map(cat => categoryNames[cat as keyof typeof categoryNames])
      .filter(Boolean)
      .join(', ');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 40px 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 600;
            }
            .preferences-box {
              background: #f9fafb;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .preference-item {
              display: flex;
              align-items: start;
              margin: 10px 0;
            }
            .preference-label {
              font-weight: 600;
              min-width: 100px;
              color: #667eea;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Welcome to Our Newsletter!</h1>
              <p style="margin: 10px 0 0; opacity: 0.95;">Just one more step to confirm your subscription</p>
            </div>
            
            <div class="content">
              <p>Hi ${subscriber.name},</p>
              
              <p>Thank you for subscribing! We're excited to send you content tailored to your interests.</p>
              
              <div class="preferences-box">
                <h3 style="margin-top: 0; color: #667eea;">📋 Your Subscription Preferences</h3>
                <div class="preference-item">
                  <span class="preference-label">Frequency:</span>
                  <span>${frequencyLabels[data.frequency]}</span>
                </div>
                <div class="preference-item">
                  <span class="preference-label">Topics:</span>
                  <span>${selectedCategories}</span>
                </div>
              </div>
              
              <p>To complete your subscription and start receiving newsletters, please confirm your email address:</p>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Confirm Subscription</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; font-size: 12px; background: #f9fafb; padding: 10px; border-radius: 4px; color: #667eea;">${confirmationUrl}</p>
              
              <p style="font-size: 14px; color: #ef4444;">⏰ This confirmation link will expire in 24 hours.</p>
              
              <div class="footer">
                <p><strong>Note:</strong> You can change your preferences anytime by clicking "Manage Preferences" in any of our emails.</p>
                <p>If you didn't subscribe to this newsletter, you can safely ignore this email.</p>
                <p>© ${new Date().getFullYear()} Newsletter Service. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: subscriber.email,
        subject: '✨ Confirm Your Newsletter Subscription',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('[Email Send Error]', emailError);
      return {
        success: true,
        message:
          'Subscription created, but confirmation email failed to send. Please contact support.',
        warning: 'Email delivery issue',
      };
    }

    return {
      success: true,
      message: 'Please check your email to confirm your subscription!',
      email: subscriber.email,
    };
  } catch (error) {
    console.error('[subscribeWithPreferences Error]', error);
    return {
      success: false,
      error: 'Failed to complete subscription. Please try again.',
    };
  }
}

export async function getSubscriberPreferences(email: string) {
  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
      include: { preferences: true },
    });

    if (!subscriber) {
      return { success: false, error: 'Subscriber not found' };
    }

    return {
      success: true,
      preferences: {
        email: subscriber.email,
        name: subscriber.name,
        frequency: subscriber.preferences?.frequency || 'WEEKLY',
        categories: subscriber.preferences?.categories || [],
        noEmails: subscriber.preferences?.noEmails || false,
        status: subscriber.status,
      },
    };
  } catch (error) {
    console.error('[getSubscriberPreferences Error]', error);
    return { success: false, error: 'Failed to fetch preferences' };
  }
}

export async function updateSubscriberPreferences(
  email: string,
  token: string,
  data: {
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'REALTIME';
    categories?: string[];
    noEmails?: boolean;
  },
) {
  try {
    // Verify the token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
        expires: { gte: new Date() },
      },
    });

    if (!verificationToken) {
      return { success: false, error: 'Invalid or expired token' };
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
      include: { preferences: true },
    });

    if (!subscriber) {
      return { success: false, error: 'Subscriber not found' };
    }

    // Update preferences
    await prisma.subscriberPreference.upsert({
      where: { subscriberId: subscriber.id },
      update: {
        ...(data.frequency && { frequency: data.frequency as any }),
        ...(data.categories && { categories: data.categories }),
        ...(data.noEmails !== undefined && { noEmails: data.noEmails }),
      },
      create: {
        subscriberId: subscriber.id,
        frequency: (data.frequency || 'WEEKLY') as any,
        categories: data.categories || [],
        noEmails: data.noEmails || false,
      },
    });

    // Update tags on subscriber
    if (data.categories) {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { tags: data.categories },
      });
    }

    return {
      success: true,
      message: 'Preferences updated successfully',
    };
  } catch (error) {
    console.error('[updateSubscriberPreferences Error]', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}

export async function unsubscribeWithReason(
  email: string,
  token: string,
  reason?: string,
) {
  try {
    // Verify the token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
        expires: { gte: new Date() },
      },
    });

    if (!verificationToken) {
      return { success: false, error: 'Invalid or expired unsubscribe link' };
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return { success: false, error: 'Subscriber not found' };
    }

    // Update subscriber status
    await prisma.subscriber.update({
      where: { email },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    });

    // Log unsubscribe
    await prisma.unsubscribeLog.create({
      data: {
        email,
        reason: reason || 'No reason provided',
        subscriberId: subscriber.id,
        unsubscribedAt: new Date(),
      },
    });

    // Delete the token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return {
      success: true,
      message: 'Successfully unsubscribed',
    };
  } catch (error) {
    console.error('[unsubscribeWithReason Error]', error);
    return { success: false, error: 'Failed to unsubscribe' };
  }
}
