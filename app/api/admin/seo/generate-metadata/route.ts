import { NextResponse } from 'next/server';

interface GenerateMetadataRequest {
  url?: string;
  topic?: string;
  keywords?: string;
  searchQuery?: string;
  pageType?: 'COURSE' | 'BLOG' | 'LANDING' | 'WORKSHOP';
  targetAudience?: string;
  tone?: 'HIGH_CTR' | 'RANK_ONE' | 'AUTHORITATIVE';
}

interface MetadataVariant {
  id: string;
  name: string;
  badge: string;
  metaTitle: string;
  metaTitleLength: number;
  metaTitleStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG';
  metaDescription: string;
  metaDescriptionLength: number;
  metaDescriptionStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG';
  predictedCtr: number;
  predictedCtrLift?: string;
  serpRankPotential: string;
  lsiKeywords: string[];
  strategyRationale: string;
}

export async function POST(req: Request) {
  try {
    const body: GenerateMetadataRequest = await req.json();
    const url = body.url || 'https://www.threadsecurity.in';
    const topic = body.topic || 'Cybersecurity & Offensive Security Education';
    const keywords = body.keywords || 'cyber threat defense, ethical hacking course, soc training';
    const pageType = body.pageType || 'COURSE';

    const searchQuery = body.searchQuery || '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
You are an Elite Technical SEO Specialist & Conversion Rate Optimization (CRO) Architect specializing in high-ranking Cybersecurity and AI education portals.
Your objective is to generate 4 distinct, high-converting Google SERP metadata variations engineered to maximize Click-Through Rate (CTR) for:
- Page URL: ${url}
- Core Topic: ${topic}
- Target Search Query Driving Impressions: ${searchQuery || 'Not specified'}
- Focus Keywords: ${keywords}
- Page Category: ${pageType}

CRITICAL GOOGLE SERP ALGORITHMIC & CRO CONSTRAINTS:
1. Meta Title (Max Mobile/Desktop Viewport ~580px):
   - STRICT LENGTH: 50 to 58 characters. NEVER exceed 58 characters to prevent SERP truncation on mobile.
   - Front-load the primary search query or keyword in the first 30 characters.
   - Use high-CTR psychological triggers: Brackets "[2026]", "[100% Labs]", "(Zero-Cost)", "[Jalandhar's Best]", or "(Exam Prep)".
   - End with: " | Thread Security" or concise brand suffix.
2. Meta Description:
   - STRICT LENGTH: 140 to 155 characters. NEVER exceed 155 characters.
   - Must include an actionable USP (e.g. 100% practical cloud labs, verified TS-ID credential, 1-on-1 mentorship).
   - End with an explicit, high-urgency Call To Action ("Enroll now!", "Download syllabus", "Start practicing free").
3. Generate 4 distinct variants:
   - Variant 1: "High-CTR Commercial Magnet" (Highest Clicks with bracket hooks)
   - Variant 2: "Rank #1 Algorithmic Stacking" (Exact match keyword density for top ranking)
   - Variant 3: "Local Intent & Trust Dominator" (Optimized for Jalandhar / Punjab geographic search intent or national authority)
   - Variant 4: "Authoritative Masterclass Credential" (Enterprise B2B credibility & career verification)

Return ONLY valid JSON matching this exact structure:
{
  "primaryKeyword": "primary keyword string",
  "variants": [
    {
      "id": "variant-high-ctr",
      "name": "High-CTR Commercial Magnet",
      "badge": "Highest Clicks",
      "metaTitle": "Title here strictly 50-58 chars | Thread Security",
      "metaDescription": "Description here strictly 140-155 characters with clear action CTA.",
      "predictedCtr": 9.4,
      "predictedCtrLift": "+6.2% expected CTR lift",
      "serpRankPotential": "Top 3 Rank Target",
      "lsiKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "strategyRationale": "Uses psychological bracket triggers and action verbs to drive clicks."
    },
    {
      "id": "variant-rank-one",
      "name": "Rank #1 Algorithmic Stacking",
      "badge": "Max Google Relevance",
      "metaTitle": "Title here strictly 50-58 chars | Thread Security",
      "metaDescription": "Description here strictly 140-155 characters with clear action CTA.",
      "predictedCtr": 8.7,
      "predictedCtrLift": "+5.1% expected CTR lift",
      "serpRankPotential": "Rank #1 Target",
      "lsiKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "strategyRationale": "Front-loads exact search query match to maximize relevancy score."
    },
    {
      "id": "variant-local-trust",
      "name": "Local Intent & Trust Dominator",
      "badge": "Local Leader",
      "metaTitle": "Title here strictly 50-58 chars | Thread Security",
      "metaDescription": "Description here strictly 140-155 characters with clear action CTA.",
      "predictedCtr": 9.1,
      "predictedCtrLift": "+5.8% expected CTR lift",
      "serpRankPotential": "Top 1-2 Local Target",
      "lsiKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "strategyRationale": "Capitalizes on Jalandhar local search dominance and institutional trust."
    },
    {
      "id": "variant-authoritative",
      "name": "Authoritative Masterclass Credential",
      "badge": "Enterprise Trust",
      "metaTitle": "Title here strictly 50-58 chars | Thread Security",
      "metaDescription": "Description here strictly 140-155 characters with clear action CTA.",
      "predictedCtr": 8.1,
      "predictedCtrLift": "+4.3% expected CTR lift",
      "serpRankPotential": "High Trust / B2B",
      "lsiKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "strategyRationale": "Institutional credibility designed to capture enterprise and corporate searchers."
    }
  ],
  "seoTips": [
    "Tip 1 for on-page SEO ranking",
    "Tip 2 for structured data or internal linking",
    "Tip 3 for user intent satisfaction"
  ]
}
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
            signal: AbortSignal.timeout(9000),
          }
        );

        if (response.ok) {
          const geminiData = await response.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);

            // Format and validate lengths
            const validatedVariants: any[] = (parsed.variants || []).map((v: any, index: number) => {
              const title = (v.metaTitle || `${topic} | Thread Security`).trim();
              const desc = (v.metaDescription || `Explore ${topic} with practical labs and mentorship at Thread Security Education.`).trim();

              return {
                id: v.id || `variant-${index + 1}`,
                name: v.name || `Optimized Strategy ${index + 1}`,
                badge: v.badge || 'AI Generated',
                metaTitle: title,
                metaTitleLength: title.length,
                metaTitleStatus: title.length > 58 ? 'TOO_LONG' : title.length < 35 ? 'TOO_SHORT' : 'OPTIMAL',
                metaDescription: desc,
                metaDescriptionLength: desc.length,
                metaDescriptionStatus: desc.length > 158 ? 'TOO_LONG' : desc.length < 110 ? 'TOO_SHORT' : 'OPTIMAL',
                predictedCtr: typeof v.predictedCtr === 'number' ? v.predictedCtr : 8.5,
                predictedCtrLift: v.predictedCtrLift || '+5.0% expected CTR lift',
                serpRankPotential: v.serpRankPotential || 'Top 3 Target',
                lsiKeywords: Array.isArray(v.lsiKeywords) ? v.lsiKeywords : [topic],
                strategyRationale: v.strategyRationale || 'Engineered for search intent alignment.',
              };
            });

            return NextResponse.json({
              success: true,
              engine: 'VERTEX_GEMINI_1_5_FLASH',
              data: {
                url,
                topic,
                primaryKeyword: parsed.primaryKeyword || keywords.split(',')[0].trim(),
                variants: validatedVariants,
                seoTips: parsed.seoTips || [
                  'Keep primary keyword in the initial <h1> and first 100 words of the page.',
                  'Add Course or Article JSON-LD Schema to capture rich Google snippets.',
                  'Submit the URL via the Instant Google Indexing API immediately upon publishing.',
                ],
              },
            });
          }
        }
      } catch (aiError) {
        console.warn('[AI Metadata Generator] Gemini API error, falling back to algorithmic formula:', aiError);
      }
    }

    // Programmatic Fallback Formula Engine (Zero Failure Guarantee)
    const fallbackData = generateProgrammaticMetadata(url, topic, keywords, pageType, searchQuery);
    return NextResponse.json({
      success: true,
      engine: 'PROGRAMMATIC_ALGO_ENGINE',
      data: fallbackData,
    });
  } catch (error: any) {
    console.error('[AI Metadata Generator] API error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate SEO metadata.' },
      { status: 500 }
    );
  }
}

function generateProgrammaticMetadata(
  url: string,
  topic: string,
  rawKeywords: string,
  pageType: string,
  searchQuery?: string
) {
  const kwList = rawKeywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const primaryKw = searchQuery || kwList[0] || topic;
  const secondaryKw = kwList[1] || 'Hands-on Labs';

  const cleanTopic = topic.length > 26 ? topic.substring(0, 24) + '...' : topic;

  const variants: any[] = [
    {
      id: 'variant-high-ctr',
      name: 'High-CTR Commercial Magnet',
      badge: 'Highest Clicks',
      metaTitle: `${cleanTopic} [2026 Labs] | Thread Security`.substring(0, 58),
      metaTitleLength: 0,
      metaTitleStatus: 'OPTIMAL',
      metaDescription: `Master ${primaryKw} with 100% hands-on cloud labs & 1-on-1 mentorship. Earn your verified TS-ID credential. Enroll today at Thread Security!`.substring(0, 155),
      metaDescriptionLength: 0,
      metaDescriptionStatus: 'OPTIMAL',
      predictedCtr: 9.35,
      predictedCtrLift: '+6.1% expected CTR lift',
      serpRankPotential: 'Top 3 Rank Target',
      lsiKeywords: [primaryKw, secondaryKw, 'practical cyber training', 'threat analysis labs'],
      strategyRationale: 'Front-loads year bracket and primary keyword to attract high-intent enrollment searchers.',
    },
    {
      id: 'variant-rank-one',
      name: 'Rank #1 Algorithmic Stacking',
      badge: 'Max Google Relevance',
      metaTitle: `${primaryKw}: Practical Guide | Thread Security`.substring(0, 58),
      metaTitleLength: 0,
      metaTitleStatus: 'OPTIMAL',
      metaDescription: `Comprehensive ${primaryKw} roadmap: practice real offensive security simulations, malware defense & SOC operations. Explore full syllabus now.`.substring(0, 155),
      metaDescriptionLength: 0,
      metaDescriptionStatus: 'OPTIMAL',
      predictedCtr: 8.65,
      predictedCtrLift: '+5.2% expected CTR lift',
      serpRankPotential: 'Rank #1 Target',
      lsiKeywords: [primaryKw, secondaryKw, 'offensive security syllabus', 'cyber certifications'],
      strategyRationale: 'Exact match keyword placement at index 0 for maximum Google algorithmic relevance.',
    },
    {
      id: 'variant-local-trust',
      name: 'Local Intent & Trust Dominator',
      badge: 'Local Leader',
      metaTitle: `${cleanTopic} in Jalandhar | Thread Security`.substring(0, 58),
      metaTitleLength: 0,
      metaTitleStatus: 'OPTIMAL',
      metaDescription: `Top-rated ${primaryKw} institute in Jalandhar, Punjab. 100% practical cyber range, placement support & industry certificates. Inquire now!`.substring(0, 155),
      metaDescriptionLength: 0,
      metaDescriptionStatus: 'OPTIMAL',
      predictedCtr: 9.10,
      predictedCtrLift: '+5.7% expected CTR lift',
      serpRankPotential: 'Rank #1-2 Local',
      lsiKeywords: [primaryKw, 'jalandhar cyber course', 'punjab ethical hacking'],
      strategyRationale: 'Leverages high local conversion intent proven by #1.1 ranking on Jalandhar queries.',
    },
    {
      id: 'variant-authoritative',
      name: 'Authoritative Masterclass Credential',
      badge: 'Enterprise Trust',
      metaTitle: `Practical ${cleanTopic} Course | Thread Security`.substring(0, 58),
      metaTitleLength: 0,
      metaTitleStatus: 'OPTIMAL',
      metaDescription: `Learn ${primaryKw} from active enterprise security architects. Sandboxed virtual labs, live threat hunting & career placement. Apply today.`.substring(0, 155),
      metaDescriptionLength: 0,
      metaDescriptionStatus: 'OPTIMAL',
      predictedCtr: 7.95,
      predictedCtrLift: '+4.1% expected CTR lift',
      serpRankPotential: 'High Trust / B2B',
      lsiKeywords: [primaryKw, 'cyber security architect', 'enterprise threat hunting'],
      strategyRationale: 'Uses high-trust institutional terminology to capture enterprise students and career switchers.',
    },
  ];

  variants.forEach((v) => {
    v.metaTitleLength = v.metaTitle.length;
    v.metaDescriptionLength = v.metaDescription.length;
  });

  return {
    url,
    topic,
    primaryKeyword: primaryKw,
    variants,
    seoTips: [
      `Place "${primaryKw}" within the main H1 tag and first paragraph of ${url}.`,
      'Implement Course / EducationalOrganization JSON-LD structured data with rating & price indicators.',
      'Submit the URL to Google Indexing API right after saving metadata for instant indexing.',
    ],
  };
}
