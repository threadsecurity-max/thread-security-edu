import { getGcpCredentialStatus, getGcpAuthClient } from '../src/lib/gcp/gcpClient';
import { requestGoogleInstantIndexing } from '../src/lib/gcp/indexingService';

async function main() {
  console.log('=== Step 1: Testing GCP Credential Status ===');
  const creds = getGcpCredentialStatus();
  console.log('Credential Status:', JSON.stringify(creds, null, 2));

  const auth = getGcpAuthClient();
  console.log('GCP Auth Client Initialized:', Boolean(auth));

  const testUrls = [
    'https://www.threadsecurity.in/',
    'https://www.threadsecurity.in/contact',
    'https://www.threadsecurity.in/courses/binary-exploitation-reverse-engineering',
    'https://www.threadsecurity.in/blog/soc-analysis-a-complete-guide-to-modern-security-operations',
    'https://www.threadsecurity.in/blog/free-cybersecurity-lab-a-safe-zero-cost-practice-roadmap',
    'https://www.threadsecurity.in/blog/cybersecurity-courses-in-jalandhar-or-thread-security-education',
    'https://www.threadsecurity.in/blog/upi-scam-prevention-why-warnings-fail-and-what-works',
    'https://www.threadsecurity.in/blog/why-openai-scrapped-gpt-61-astra-the-safety-story-behind-the-cancelled-launch',
  ];

  console.log('\n=== Step 2: Executing Instant Google Indexing for Key Pages ===');
  for (const url of testUrls) {
    try {
      console.log(`Submitting to Google Indexing API: ${url}...`);
      const res = await requestGoogleInstantIndexing(url, 'URL_UPDATED', 'AUTONOMOUS_CTR_PIPELINE');
      console.log(` -> Result: [Success: ${res.success}] ${res.message} (isMock: ${res.isMock})`);
    } catch (err: any) {
      console.error(` -> Failed for ${url}:`, err.message);
    }
  }

  console.log('\n=== Execution Completed Successfully ===');
}

main().catch(console.error);
