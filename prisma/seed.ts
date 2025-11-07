import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// Use the exact enum values from Prisma schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SubscriberStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
  BOUNCED: 'BOUNCED',
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NewsletterStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Frequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  REALTIME: 'REALTIME',
} as const;

interface SubscriberData {
  email: string;
  name: string;
  status: keyof typeof SubscriberStatus;
  createdAt?: Date;
  lastOpenedAt?: Date;
  confirmedAt?: Date;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  bounceCount?: number;
  openCount?: number;
  clickCount?: number;
  complaintCount?: number;
}

interface NewsletterData {
  title: string;
  subject: string;
  content: string;
  preview: string;
  status: keyof typeof NewsletterStatus;
  sentAt?: Date;
  scheduledFor?: Date;
  audienceTags: string[];
  recipientCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  templateId: string;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Use environment variables with fallbacks
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@newsletter.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('🧹 Cleaning existing data...');
  await prisma.emailLog.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.subscriberPreference.deleteMany();
  await prisma.unsubscribeLog.deleteMany();
  await prisma.campaignSegment.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create subscribers sequentially to avoid issues
  console.log('📧 Creating subscribers...');
  const subscribersData: SubscriberData[] = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      status: 'CONFIRMED',
      confirmedAt: new Date('2024-01-15'),
      lastOpenedAt: new Date('2024-12-01'),
      openCount: 12,
      clickCount: 5,
      complaintCount: 0,
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      status: 'CONFIRMED',
      confirmedAt: new Date('2024-01-20'),
      lastOpenedAt: new Date('2024-11-28'),
      openCount: 15,
      clickCount: 8,
      complaintCount: 0,
    },
    {
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      status: 'UNSUBSCRIBED',
      confirmedAt: new Date('2024-01-10'),
      unsubscribedAt: new Date('2024-10-20'),
      lastOpenedAt: new Date('2024-10-15'),
      openCount: 3,
      clickCount: 1,
      complaintCount: 0,
    },
    {
      email: 'alice.johnson@example.com',
      name: 'Alice Johnson',
      status: 'CONFIRMED',
      confirmedAt: new Date('2024-02-01'),
      lastOpenedAt: new Date('2024-12-02'),
      openCount: 20,
      clickCount: 12,
      complaintCount: 0,
    },
    {
      email: 'charlie.brown@example.com',
      name: 'Charlie Brown',
      status: 'CONFIRMED',
      confirmedAt: new Date('2024-02-05'),
      lastOpenedAt: new Date('2024-11-30'),
      openCount: 8,
      clickCount: 4,
      complaintCount: 0,
    },
    {
      email: 'diana.prince@example.com',
      name: 'Diana Prince',
      status: 'BOUNCED',
      confirmedAt: new Date('2024-02-10'),
      bounceCount: 2,
      openCount: 0,
      clickCount: 0,
      complaintCount: 0,
    },
    {
      email: 'evan.peters@example.com',
      name: 'Evan Peters',
      status: 'CONFIRMED',
      confirmedAt: new Date('2024-03-01'),
      lastOpenedAt: new Date('2024-11-25'),
      openCount: 6,
      clickCount: 2,
      complaintCount: 0,
    },
    {
      email: 'frank.castle@example.com',
      name: 'Frank Castle',
      status: 'CONFIRMED',
      confirmedAt: new Date('2024-03-15'),
      lastOpenedAt: new Date('2024-12-03'),
      openCount: 10,
      clickCount: 6,
      complaintCount: 0,
    },
  ];

  // Create subscribers one by one to avoid race conditions
  const subscribers = [];
  for (const data of subscribersData) {
    const subscriber = await prisma.subscriber.create({
      data: {
        email: data.email,
        name: data.name,
        status: data.status,
        subscribedAt: data.confirmedAt,
        confirmedAt: data.confirmedAt,
        unsubscribedAt: data.unsubscribedAt,
        lastOpenedAt: data.lastOpenedAt,
        openCount: data.openCount || 0,
        clickCount: data.clickCount || 0,
        bounceCount: data.bounceCount || 0,
        complaintCount: data.complaintCount || 0,
        tags: data.status === 'CONFIRMED' ? ['active', 'tech'] : [],
      },
    });
    subscribers.push(subscriber);
  }
  console.log(`✅ Created ${subscribers.length} subscribers`);

  // Create subscriber preferences
  console.log('⚙️  Creating subscriber preferences...');
  const confirmedSubscribers = subscribers.filter(
    s => s.status === 'CONFIRMED',
  );

  for (const subscriber of confirmedSubscribers) {
    await prisma.subscriberPreference.create({
      data: {
        subscriberId: subscriber.id,
        frequency: 'WEEKLY',
        categories: ['tech', 'business', 'lifestyle'],
        noEmails: false,
      },
    });
  }
  console.log('✅ Subscriber preferences created');

  // Create email templates
  console.log('📝 Creating email templates...');
  const templates = [];
  const templateData = [
    {
      name: 'Weekly Digest',
      subject: 'Your Weekly Digest - {{date}}',
      content: `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; }</style></head><body><h1>This Week\'s Highlights</h1><ul><li>Featured Article 1</li><li>Featured Article 2</li><li>Featured Article 3</li></ul><p>Thank you for reading!</p></body></html>`,
      preview: 'Your weekly curated content',
      category: 'newsletter',
    },
    {
      name: 'Product Announcement',
      subject: 'Exciting News: New Feature Launch',
      content: `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; }</style></head><body><h1>We\'re excited to announce...</h1><p>Check out our new feature!</p><a href="#">Learn More</a></body></html>`,
      preview: 'Important product update',
      category: 'announcement',
    },
    {
      name: 'Welcome Email',
      subject: 'Welcome to Our Newsletter!',
      content: `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; }</style></head><body><h1>Welcome aboard!</h1><p>We\'re thrilled to have you as a subscriber.</p><p>Here\'s what you can expect from us...</p></body></html>`,
      preview: 'Thanks for subscribing',
      category: 'welcome',
    },
  ];

  for (const data of templateData) {
    const template = await prisma.emailTemplate.create({
      data: {
        ...data,
        authorId: admin.id,
      },
    });
    templates.push(template);
  }
  console.log(`✅ Created ${templates.length} email templates`);

  // Create newsletters with proper type casting
  console.log('📬 Creating newsletters...');
  const newsletterData: NewsletterData[] = [
    {
      title: 'October Week 1 - Tech Trends',
      subject: 'Tech Trends: What You Need to Know',
      content: '<h1>Tech Trends</h1><p>Latest updates in technology...</p>',
      preview: 'Latest tech updates',
      status: 'SENT',
      sentAt: new Date('2024-10-07'),
      scheduledFor: new Date('2024-10-07'),
      audienceTags: ['tech', 'active'],
      recipientCount: 5,
      openCount: 12,
      clickCount: 5,
      bounceCount: 0,
      templateId: templates[0].id,
    },
    {
      title: 'October Week 2 - Business Insights',
      subject: 'Business Insights for Growth',
      content: '<h1>Business Insights</h1><p>Growth strategies...</p>',
      preview: 'Business growth strategies',
      status: 'SENT',
      sentAt: new Date('2024-10-14'),
      scheduledFor: new Date('2024-10-14'),
      audienceTags: ['business', 'active'],
      recipientCount: 5,
      openCount: 15,
      clickCount: 8,
      bounceCount: 0,
      templateId: templates[0].id,
    },
    {
      title: 'November Week 1 - Product Launch',
      subject: 'New Feature: Enhanced Analytics',
      content: '<h1>New Feature</h1><p>Enhanced analytics now available...</p>',
      preview: 'Check out our new analytics',
      status: 'SENT',
      sentAt: new Date('2024-11-04'),
      scheduledFor: new Date('2024-11-04'),
      audienceTags: ['all'],
      recipientCount: 6,
      openCount: 18,
      clickCount: 10,
      bounceCount: 0,
      templateId: templates[1].id,
    },
    {
      title: 'November Week 4 - Year-End Review',
      subject: '2024 Year in Review',
      content: '<h1>Year in Review</h1><p>A look back at 2024...</p>',
      preview: 'Our 2024 highlights',
      status: 'SENT',
      sentAt: new Date('2024-11-25'),
      scheduledFor: new Date('2024-11-25'),
      audienceTags: ['all'],
      recipientCount: 6,
      openCount: 20,
      clickCount: 12,
      bounceCount: 0,
      templateId: templates[0].id,
    },
    {
      title: 'December Holiday Special',
      subject: 'Happy Holidays from Our Team!',
      content: '<h1>Happy Holidays</h1><p>Season greetings...</p>',
      preview: 'Holiday greetings',
      status: 'DRAFT',
      scheduledFor: new Date('2024-12-24'),
      audienceTags: ['all'],
      recipientCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      templateId: templates[0].id,
    },
  ];

  const newsletters = [];
  for (const data of newsletterData) {
    const newsletter = await prisma.newsletter.create({
      data: {
        title: data.title,
        subject: data.subject,
        content: data.content,
        preview: data.preview,
        status: data.status,
        sentAt: data.sentAt,
        scheduledFor: data.scheduledFor,
        audienceTags: data.audienceTags,
        recipientCount: data.recipientCount,
        openCount: data.openCount,
        clickCount: data.clickCount,
        bounceCount: data.bounceCount,
        authorId: admin.id,
        templateId: data.templateId,
      },
    });
    newsletters.push(newsletter);
  }
  console.log(`✅ Created ${newsletters.length} newsletters`);

  // Create email logs in batches to avoid overwhelming the database
  console.log('📊 Creating email logs...');
  const sentNewsletters = newsletters.filter(n => n.status === 'SENT');
  const activeSubscribers = subscribers.filter(s => s.status === 'CONFIRMED');

  let emailLogsCount = 0;
  for (const newsletter of sentNewsletters) {
    const batch = [];
    for (const subscriber of activeSubscribers) {
      const shouldOpen = Math.random() > 0.3;
      const shouldClick = shouldOpen && Math.random() > 0.5;

      batch.push(
        prisma.emailLog.create({
          data: {
            messageId: `msg-${newsletter.id}-${subscriber.id}`,
            recipientEmail: subscriber.email,
            subscriberId: subscriber.id,
            newsletterId: newsletter.id,
            status: shouldClick ? 'CLICKED' : shouldOpen ? 'OPENED' : 'SENT',
            openedAt: shouldOpen ? new Date(newsletter.sentAt!) : undefined,
            clickedAt: shouldClick ? new Date(newsletter.sentAt!) : undefined,
          },
        }),
      );
    }

    // Process in smaller batches
    const results = await Promise.all(batch);
    emailLogsCount += results.length;
  }
  console.log(`✅ Created ${emailLogsCount} email logs`);

  // Create campaign segments
  console.log('🎯 Creating campaign segments...');
  await Promise.all([
    prisma.campaignSegment.create({
      data: {
        name: 'Highly Engaged',
        description: 'Subscribers who open 80%+ of emails',
        tags: ['engaged', 'active'],
      },
    }),
    prisma.campaignSegment.create({
      data: {
        name: 'Tech Enthusiasts',
        description: 'Interested in technology content',
        tags: ['tech', 'active'],
      },
    }),
    prisma.campaignSegment.create({
      data: {
        name: 'Business Leaders',
        description: 'Interested in business and growth',
        tags: ['business', 'active'],
      },
    }),
  ]);
  console.log('✅ Campaign segments created');

  // Create unsubscribe logs with subscriber relationships
  console.log('📋 Creating unsubscribe logs...');
  await Promise.all([
    prisma.unsubscribeLog.create({
      data: {
        email: 'bob.wilson@example.com',
        reason: 'Too many emails',
        unsubscribedAt: new Date('2024-10-20'),
        subscriberId: subscribers.find(
          s => s.email === 'bob.wilson@example.com',
        )?.id,
      },
    }),
    prisma.unsubscribeLog.create({
      data: {
        email: 'old.subscriber@example.com',
        reason: 'Not interested anymore',
        unsubscribedAt: new Date('2024-09-15'),
        // This one doesn't have a corresponding subscriber, so subscriberId remains null
      },
    }),
  ]);
  console.log('✅ Unsubscribe logs created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Admin Login Credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n📊 Summary:');
  console.log(`   - 1 admin user`);
  console.log(`   - ${subscribers.length} subscribers`);
  console.log(`   - ${templates.length} email templates`);
  console.log(`   - ${newsletters.length} newsletters`);
  console.log(`   - ${emailLogsCount} email logs`);
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
