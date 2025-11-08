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

    // If subscriber is already confirmed, update their preferences instead
    if (existingSubscriber?.status === 'CONFIRMED') {
      // Update preferences for existing confirmed subscriber
      await prisma.subscriberPreference.upsert({
        where: { subscriberId: existingSubscriber.id },
        update: {
          frequency: data.frequency as any,
          categories: data.categories,
          noEmails: false,
        },
        create: {
          subscriberId: existingSubscriber.id,
          frequency: data.frequency as any,
          categories: data.categories,
          noEmails: false,
        },
      });

      // Update tags on subscriber
      await prisma.subscriber.update({
        where: { id: existingSubscriber.id },
        data: {
          tags: data.categories,
          name: data.name || existingSubscriber.name,
        },
      });

      // Send confirmation email about updated preferences
      const frequencyLabels = {
        DAILY: 'Daily',
        WEEKLY: 'Weekly',
        MONTHLY: 'Monthly',
        REALTIME: 'Real-time',
      };

      const categoryNames: Record<string, string> = {
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

      const updateEmailHtml = `
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
              .preferences-box {
                background: #f0f9ff;
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
                <h1 style="margin: 0;">✨ Preferences Updated!</h1>
                <p style="margin: 10px 0 0; opacity: 0.95;">Your subscription preferences have been saved</p>
              </div>
              
              <div class="content">
                <p>Hi ${existingSubscriber.name},</p>
                
                <p>Great news! We've updated your newsletter preferences based on your latest selections.</p>
                
                <div class="preferences-box">
                  <h3 style="margin-top: 0; color: #667eea;">📋 Your Updated Preferences</h3>
                  <div class="preference-item">
                    <span class="preference-label">Frequency:</span>
                    <span>${frequencyLabels[data.frequency]}</span>
                  </div>
                  <div class="preference-item">
                    <span class="preference-label">Topics:</span>
                    <span>${selectedCategories}</span>
                  </div>
                </div>
                
                <p>You'll start receiving newsletters according to these new preferences. Your next newsletter will reflect the topics you selected!</p>
                
                <div class="footer">
                  <p>You can change your preferences anytime by clicking "Manage Preferences" in any of our emails.</p>
                  <p>© ${new Date().getFullYear()} Newsletter Service. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        await sendEmail({
          to: existingSubscriber.email,
          subject: '✨ Your Newsletter Preferences Have Been Updated',
          html: updateEmailHtml,
        });
      } catch (emailError) {
        console.error('[Preference Update Email Error]', emailError);
      }

      return {
        success: true,
        message: 'Your preferences have been updated successfully!',
        email: existingSubscriber.email,
        isUpdate: true,
      };
    }

    // For new subscribers or pending subscribers, proceed with normal flow
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

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: subscriber.email },
    });

    // Store the new token
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

    const categoryNames: Record<string, string> = {
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
      isUpdate: false,
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

    // Send unsubscribe confirmation email
    const unsubscribeConfirmationHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribe Confirmation</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 10px 0 0;
              opacity: 0.95;
              font-size: 16px;
            }
            .content {
              background: white;
              padding: 40px 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .content p {
              margin: 0 0 20px;
              font-size: 16px;
              color: #4b5563;
            }
            .info-box {
              background: #f3f4f6;
              border-left: 4px solid #6b7280;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .info-box h3 {
              margin: 0 0 10px;
              color: #1f2937;
              font-size: 18px;
            }
            .info-box ul {
              margin: 0;
              padding-left: 20px;
            }
            .info-box li {
              margin: 8px 0;
              color: #4b5563;
            }
            .resubscribe-box {
              background: #dbeafe;
              border: 2px solid #3b82f6;
              padding: 25px;
              margin: 25px 0;
              border-radius: 8px;
              text-align: center;
            }
            .resubscribe-box h3 {
              margin: 0 0 15px;
              color: #1e40af;
              font-size: 20px;
            }
            .resubscribe-box p {
              color: #1e3a8a;
              margin: 0 0 20px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 13px;
              color: #6b7280;
              text-align: center;
            }
            .footer p {
              margin: 5px 0;
            }
            .emoji {
              font-size: 48px;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">👋</div>
              <h1>You've Been Unsubscribed</h1>
              <p>We're sorry to see you go</p>
            </div>
            
            <div class="content">
              <p>Hi ${subscriber.name || 'there'},</p>
              
              <p>This email confirms that you have been successfully unsubscribed from our newsletter. You will no longer receive emails from us.</p>
              
              ${
                reason && reason !== 'No reason provided'
                  ? `
              <div class="info-box">
                <h3>📝 Your Feedback</h3>
                <p><strong>You told us:</strong> ${reason}</p>
                <p>Thank you for sharing your thoughts. We take all feedback seriously and use it to improve our service.</p>
              </div>
              `
                  : ''
              }
              
              <div class="info-box">
                <h3>✅ What's Been Done</h3>
                <ul>
                  <li>Your email address (${email}) has been removed from our active mailing list</li>
                  <li>You'll stop receiving newsletters within 48 hours</li>
                  <li>Your subscription preferences have been cleared</li>
                  <li>We've recorded your unsubscribe date: ${new Date().toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div class="resubscribe-box">
                <h3>Changed Your Mind?</h3>
                <p>You can resubscribe anytime! We'd love to have you back.</p>
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                }" class="button">
                  Resubscribe
                </a>
              </div>
              
              <p>We hope our paths cross again in the future. If you have any questions or concerns, please don't hesitate to contact our support team.</p>
              
              <p style="margin-top: 30px;">
                Best wishes,<br>
                <strong>The Newsletter Team</strong>
              </p>
              
              <div class="footer">
                <p><strong>Why did you receive this email?</strong></p>
                <p>This is a one-time confirmation that you've unsubscribed from our newsletter. You won't receive any further emails from us unless you resubscribe.</p>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} Newsletter Service. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the confirmation email
    try {
      await sendEmail({
        to: email,
        subject: "Unsubscribe Confirmation - We'll Miss You",
        html: unsubscribeConfirmationHtml,
        text: `
Hi ${subscriber.name || 'there'},

This email confirms that you have been successfully unsubscribed from our newsletter.

What's been done:
- Your email address (${email}) has been removed from our mailing list
- You'll stop receiving newsletters within 48 hours
- Your subscription preferences have been cleared

${reason && reason !== 'No reason provided' ? `Your feedback: ${reason}` : ''}

Changed your mind? You can resubscribe anytime at ${
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        }

Best wishes,
The Newsletter Team
        `.trim(),
      });

      console.log(`[Unsubscribe Confirmation Email Sent] To: ${email}`);
    } catch (emailError) {
      console.error('[Unsubscribe Confirmation Email Error]', emailError);
      // Don't fail the unsubscribe if email fails, but log it
    }

    return {
      success: true,
      message: 'Successfully unsubscribed. Check your email for confirmation.',
    };
  } catch (error) {
    console.error('[unsubscribeWithReason Error]', error);
    return { success: false, error: 'Failed to unsubscribe' };
  }
}

export async function getManagePreferencesToken(email: string) {
  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
      select: { status: true },
    });

    if (!subscriber) {
      return { success: false, error: 'No subscription found with this email' };
    }

    // Generate a secure token for managing preferences
    const token = crypto.randomBytes(32).toString('hex');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const manageUrl = `${appUrl}/manage-preferences?email=${encodeURIComponent(
      email,
    )}&token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Manage Your Newsletter Preferences',
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #0070f3; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Manage Your Preferences</h1>
          <p>You're already subscribed! Click below to manage your newsletter preferences:</p>
          <a href="${manageUrl}" class="button">Manage Preferences</a>
          <p>This link will expire in 1 hour for security.</p>
        </div>
      </body>
    </html>
  `,
    });

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Store the new token (expires in 1 hour for security)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    return {
      success: true,
      token,
      status: subscriber.status,
      isExisting: subscriber.status === 'CONFIRMED',
    };
  } catch (error) {
    console.error('[getManagePreferencesToken Error]', error);
    return { success: false, error: 'Failed to generate token' };
  }
}
