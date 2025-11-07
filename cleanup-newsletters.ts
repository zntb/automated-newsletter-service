// Create a cleanup script: scripts/cleanup-newsletters.js
import { prisma } from '@/lib/prisma';

async function cleanupOrphanedNewsletters() {
  try {
    // Find all newsletters
    const newsletters = await prisma.newsletter.findMany({
      include: { author: true },
    });

    // Identify newsletters with invalid authors
    const orphanedNewsletters = newsletters.filter(
      newsletter => !newsletter.author,
    );

    console.log(`Found ${orphanedNewsletters.length} orphaned newsletters`);

    // Delete orphaned newsletters
    for (const newsletter of orphanedNewsletters) {
      await prisma.newsletter.delete({
        where: { id: newsletter.id },
      });
      console.log(`Deleted orphaned newsletter: ${newsletter.id}`);
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupOrphanedNewsletters();
