import { getContentRadarSummary } from '../src/lib/seo/contentRadarService';

async function main() {
  console.log('=== Testing getContentRadarSummary() ===');
  const summary = await getContentRadarSummary();

  console.log('Summary metrics:', {
    totalAssets: summary.totalAssets,
    needsLiftCount: summary.needsLiftCount,
    newlyPostedCount: summary.newlyPostedCount,
    coursesCount: summary.coursesCount,
    blogsCount: summary.blogsCount,
    indexedCount: summary.indexedCount,
    averageCtrLift: summary.averageCtrLift,
  });

  console.log('\nSample items from Radar:');
  summary.items.slice(0, 5).forEach((item, idx) => {
    console.log(`\n[${idx + 1}] ${item.type} | ${item.title}`);
    console.log(`URL: ${item.url}`);
    console.log(`Current Title (${item.currentTitleLength}c): "${item.currentTitle}"`);
    console.log(`Current Status: ${item.currentStatus} | Googlebot Status: ${item.googlebotStatus}`);
    console.log(`Recommended Title (${item.recommendedTitleLength}c): "${item.recommendedTitle}"`);
    console.log(`Recommended Description (${item.recommendedDescriptionLength}c): "${item.recommendedDescription}"`);
    console.log(`Lift: ${item.predictedCtrLift} | Query: "${item.searchQuery || item.focusKeyword}"`);
  });

  console.log('\n=== Test Completed Successfully ===');
}

main().catch(console.error);
