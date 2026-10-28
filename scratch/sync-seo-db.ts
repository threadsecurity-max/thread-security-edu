import { prisma } from '../src/server/database/prisma';
import { getAllPageSeoOverrides } from '../src/lib/seo/pageSeoStore';

async function main() {
  console.log('--- Verifying SEO Overrides in Store ---');
  const overrides = getAllPageSeoOverrides();
  console.log(`Loaded ${Object.keys(overrides).length} page overrides.`);

  for (const [key, data] of Object.entries(overrides)) {
    console.log(`[${key}] => Title (${data.metaTitle.length} chars): "${data.metaTitle}"`);
    console.log(`        => Desc (${data.metaDescription.length} chars): "${data.metaDescription.substring(0, 60)}..."`);
    
    // If it's a blog post, try to update prisma blogSEO
    if (key.startsWith('/blog/')) {
      const slug = key.replace('/blog/', '');
      try {
        const blog = await prisma.blog.findUnique({
          where: { slug },
          select: { id: true, title: true },
        });

        if (blog) {
          await prisma.blogSEO.upsert({
            where: { blogId: blog.id },
            create: {
              blogId: blog.id,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              focusKeyword: data.focusKeyword || null,
              keywords: data.keywords || [],
            },
            update: {
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              focusKeyword: data.focusKeyword || null,
              keywords: data.keywords || [],
            },
          });
          console.log(`  -> Synced to Prisma DB BlogSEO for blog: "${blog.title}" (${blog.id})`);
        } else {
          console.log(`  -> Blog slug "${slug}" not found in current DB (store will serve override).`);
        }
      } catch (err: any) {
        console.warn(`  -> DB sync note for ${slug}: ${err.message}`);
      }
    }
  }

  console.log('\n--- Sync & Verification Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
