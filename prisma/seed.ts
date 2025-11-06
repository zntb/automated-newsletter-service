import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

enum SubscriberStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  BOUNCED = 'BOUNCED',
}

interface Subscriber {
  email: string;
  name: string;
  status: SubscriberStatus;
  createdAt?: Date;
  lastOpenedAt?: Date;
  confirmedAt?: Date;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  bouncedAt?: Date;
  bounceCount?: number;
  openCount?: number;
  clickCount?: number;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.emailLog.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.subscriberPreference.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.unsubscribeLog.deleteMany();
  await prisma.campaignSegment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL!,
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create subscribers
  console.log('📧 Creating subscribers...');
  const subscribersData: Subscriber[] = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      status: SubscriberStatus.CONFIRMED,
      confirmedAt: new Date('2024-01-15'),
      lastOpenedAt: new Date('2024-12-01'),
      openCount: 12,
      clickCount: 5,
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      status: SubscriberStatus.CONFIRMED,
      confirmedAt: new Date('2024-01-20'),
      lastOpenedAt: new Date('2024-11-28'),
      openCount: 15,
      clickCount: 8,
    },
    {
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      status: SubscriberStatus.UNSUBSCRIBED,
      confirmedAt: new Date('2024-01-10'),
      unsubscribedAt: new Date('2024-10-20'),
      lastOpenedAt: new Date('2024-10-15'),
      openCount: 3,
      clickCount: 1,
    },
    {
      email: 'alice.johnson@example.com',
      name: 'Alice Johnson',
      status: SubscriberStatus.CONFIRMED,
      confirmedAt: new Date('2024-02-01'),
      lastOpenedAt: new Date('2024-12-02'),
      openCount: 20,
      clickCount: 12,
    },
    {
      email: 'charlie.brown@example.com',
      name: 'Charlie Brown',
      status: SubscriberStatus.CONFIRMED,
      confirmedAt: new Date('2024-02-05'),
      lastOpenedAt: new Date('2024-11-30'),
      openCount: 8,
      clickCount: 4,
    },
    {
      email: 'diana.prince@example.com',
      name: 'Diana Prince',
      status: SubscriberStatus.BOUNCED,
      confirmedAt: new Date('2024-02-10'),
      bounceCount: 2,
      openCount: 0,
      clickCount: 0,
    },
    {
      email: 'evan.peters@example.com',
      name: 'Evan Peters',
      status: SubscriberStatus.CONFIRMED,
      confirmedAt: new Date('2024-03-01'),
      lastOpenedAt: new Date('2024-11-25'),
      openCount: 6,
      clickCount: 2,
    },
    {
      email: 'frank.castle@example.com',
      name: 'Frank Castle',
      status: SubscriberStatus.CONFIRMED,
      confirmedAt: new Date('2024-03-15'),
      lastOpenedAt: new Date('2024-12-03'),
      openCount: 10,
      clickCount: 6,
    },
  ];

  const subscribers = await Promise.all(
    subscribersData.map(data =>
      prisma.subscriber.create({
        data: {
          ...data,
          subscribedAt: data.confirmedAt,
          tags: data.status === 'CONFIRMED' ? ['active', 'tech'] : [],
          status: data.status as SubscriberStatus, // Cast the status to the correct type
        },
      }),
    ),
  );
  console.log(`✅ Created ${subscribers.length} subscribers`);

  // Create subscriber preferences
  console.log('⚙️  Creating subscriber preferences...');
  const confirmedSubscribers = subscribers.filter(
    s => s.status === 'CONFIRMED',
  );
  await Promise.all(
    confirmedSubscribers.map(subscriber =>
      prisma.subscriberPreference.create({
        data: {
          subscriberId: subscriber.id,
          frequency: 'WEEKLY',
          categories: ['tech', 'business', 'lifestyle'],
          noEmails: false,
        },
      }),
    ),
  );
  console.log('✅ Subscriber preferences created');

  // Create email templates
  console.log('📝 Creating email templates...');
  const templates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Weekly Digest',
        subject: 'Your Weekly Digest - {{date}}',
        content: `
          <!DOCTYPE html>
          <html>
          <head><style>body { font-family: Arial, sans-serif; }</style></head>
          <body>
            <h1>This Week's Highlights</h1>
            <ul>
              <li>Featured Article 1</li>
              <li>Featured Article 2</li>
              <li>Featured Article 3</li>
            </ul>
            <p>Thank you for reading!</p>
          </body>
          </html>
        `,
        preview: 'Your weekly curated content',
        category: 'newsletter',
        authorId: admin.id,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Product Announcement',
        subject: 'Exciting News: New Feature Launch',
        content: `
          <!DOCTYPE html>
          <html>
          <head><style>body { font-family: Arial, sans-serif; }</style></head>
          <body>
            <h1>We're excited to announce...</h1>
            <p>Check out our new feature!</p>
            <a href="#">Learn More</a>
          </body>
          </html>
        `,
        preview: 'Important product update',
        category: 'announcement',
        authorId: admin.id,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Welcome Email',
        subject: 'Welcome to Our Newsletter!',
        content: `
          <!DOCTYPE html>
          <html>
          <head><style>body { font-family: Arial, sans-serif; }</style></head>
          <body>
            <h1>Welcome aboard!</h1>
            <p>We're thrilled to have you as a subscriber.</p>
            <p>Here's what you can expect from us...</p>
          </body>
          </html>
        `,
        preview: 'Thanks for subscribing',
        category: 'welcome',
        authorId: admin.id,
      },
    }),
  ]);
  console.log(`✅ Created ${templates.length} email templates`);

  // Create newsletters
  console.log('📬 Creating newsletters...');
  const newsletters = await Promise.all([
    prisma.newsletter.create({
      data: {
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
        authorId: admin.id,
        templateId: templates[0].id,
      },
    }),
    prisma.newsletter.create({
      data: {
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
        authorId: admin.id,
        templateId: templates[0].id,
      },
    }),
    prisma.newsletter.create({
      data: {
        title: 'November Week 1 - Product Launch',
        subject: 'New Feature: Enhanced Analytics',
        content:
          '<h1>New Feature</h1><p>Enhanced analytics now available...</p>',
        preview: 'Check out our new analytics',
        status: 'SENT',
        sentAt: new Date('2024-11-04'),
        scheduledFor: new Date('2024-11-04'),
        audienceTags: ['all'],
        recipientCount: 6,
        openCount: 18,
        clickCount: 10,
        authorId: admin.id,
        templateId: templates[1].id,
      },
    }),
    prisma.newsletter.create({
      data: {
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
        authorId: admin.id,
        templateId: templates[0].id,
      },
    }),
    prisma.newsletter.create({
      data: {
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
        authorId: admin.id,
        templateId: templates[0].id,
      },
    }),
  ]);
  console.log(`✅ Created ${newsletters.length} newsletters`);

  // Create email logs
  console.log('📊 Creating email logs...');
  const sentNewsletters = newsletters.filter(n => n.status === 'SENT');
  const activeSubscribers = subscribers.filter(s => s.status === 'CONFIRMED');

  const emailLogs = [];
  for (const newsletter of sentNewsletters) {
    for (const subscriber of activeSubscribers) {
      const shouldOpen = Math.random() > 0.3; // 70% open rate
      const shouldClick = shouldOpen && Math.random() > 0.5; // 50% click rate if opened

      emailLogs.push(
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
  }

  await Promise.all(emailLogs);
  console.log(`✅ Created ${emailLogs.length} email logs`);

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

  // Create some unsubscribe logs
  console.log('📋 Creating unsubscribe logs...');
  await Promise.all([
    prisma.unsubscribeLog.create({
      data: {
        email: 'bob.wilson@example.com',
        reason: 'Too many emails',
        unsubscribedAt: new Date('2024-10-20'),
      },
    }),
    prisma.unsubscribeLog.create({
      data: {
        email: 'old.subscriber@example.com',
        reason: 'Not interested anymore',
        unsubscribedAt: new Date('2024-09-15'),
      },
    }),
  ]);
  console.log('✅ Unsubscribe logs created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Admin Login Credentials:');
  console.log('   Email: admin@newsletter.com');
  console.log('   Password: admin123');
  console.log('\n📊 Summary:');
  console.log(`   - 1 admin user`);
  console.log(`   - ${subscribers.length} subscribers`);
  console.log(`   - ${templates.length} email templates`);
  console.log(`   - ${newsletters.length} newsletters`);
  console.log(`   - ${emailLogs.length} email logs`);
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
