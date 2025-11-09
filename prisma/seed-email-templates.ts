// prisma/seed-email-templates.ts
import { prisma } from '@/lib/prisma';
import { emailTemplates } from '@/lib/email-templates';

async function seedEmailTemplates() {
  console.log('🌱 Seeding email templates...');

  // Clear existing templates (optional - comment out if you want to keep existing ones)
  // await prisma.emailTemplate.deleteMany({
  //   where: { authorId: null },
  // });

  let created = 0;
  let skipped = 0;

  for (const template of emailTemplates) {
    try {
      // Check if template already exists
      const existing = await prisma.emailTemplate.findUnique({
        where: { name: template.name },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${template.name} (already exists)`);
        skipped++;
        continue;
      }

      // Create the template
      await prisma.emailTemplate.create({
        data: {
          name: template.name,
          subject: template.subject,
          content: template.content,
          preview: template.preview,
          category: template.category,
          authorId: null, // System templates have no author
        },
      });

      console.log(`✅ Created: ${template.name}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${template.name}:`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   - ${created} templates created`);
  console.log(`   - ${skipped} templates skipped`);
  console.log(`   - ${emailTemplates.length} total templates in library`);
}

seedEmailTemplates()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
