import { NextResponse } from 'next/server';

interface GenerateMetadataRequest {
  url?: string;
  topic?: string;
  keywords?: string;
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

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
You are an Elite Technical SEO Specialist & Conversion Rate Optimization (CRO) Architect specializing in high-ranking Cybersecurity and AI education portals.
Your objective is to generate 3 distinct, high-performing metadata variations for:
- Page URL: ${url}
- Core Topic: ${topic}
- Target Focus Keywords: ${keywords}
- Page Category: ${pageType}

CRITICAL GOOGLE RANK #1 ALGORITHMIC CONSTRAINTS:
1. Meta Title:
   - STRICT LIMIT: 50 to 60 characters (never exceed 60 characters so it is never truncated on mobile or desktop SERPs).
   - Place primary focus keyword in the first 35 characters.
   - Include high-converting trust or emotional modifiers (e.g. 2026, Practical, Masterclass, Certified, Hands-on).
   - End with: " | Thread Security"
2. Meta Description:
   - STRICT LIMIT: 140 to 158 characters (optimal sweet spot for Google search result snippets).
   - Must include primary keyword, secondary semantic LSI keyword, tangible benefit/USP (hands-on cyber labs, mentor-led), and clear Call To Action (Enroll now, Explore syllabus, Start lab).
3. Generate 3 distinct variants:
   - Variant 1: "High-CTR Commercial Magnet" (Optimized for searchers ready to enroll/buy)
   - Variant 2: "Rank #1 Algorithmic Stacking" (Exact match keyword density for top position)
   - Variant 3: "Authoritative Masterclass Credential" (Institutional and corporate B2B credibility)

Return ONLY valid JSON matching this exact structure:
{
  "primaryKeyword": "primary keyword string",
  "variants": [
    {
      "id": "variant-high-ctr",
      "name": "High-CTR Commercial Magnet",
      "badge": "Highest Clicks",
      "metaTitle": "Title here strictly under 60 chars | Thread Security",
      "metaDescription": "Description here strictly between 140 and 158 characters with action CTA.",
      "predictedCtr": 8.9,
      "serpRankPotential": "Top 3 Rank Target",
      "lsiKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "strategyRationale": "Short 1-sentence explanation of why this ranks."
    },
    {
      "id": "variant-rank-one",
      "name": "Rank #1 Algorithmic Stacking",
      "badge": "Max Google Relevance",
      "metaTitle": "Title here strictly under 60 chars | Thread Security",
      "metaDescription": "Description here strictly between 140 and 158 characters with action CTA.",
      "predictedCtr": 8.2,
      "serpRankPotential": "Rank #1 Target",
      "lsiKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "strategyRationale": "Short 1-sentence explanation of keyword placement."
    },
    {
      "id": "variant-authoritative",
      "name": "Authoritative Masterclass Credential",
      "badge": "Enterprise Trust",
      "metaTitle": "Title here strictly under 60 chars | Thread Security",
      "metaDescription": "Description here strictly between 140 and 158 characters with action CTA.",
      "predictedCtr": 7.8,
      "serpRankPotential": "High Trust / B2B",
      "lsiKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "strategyRationale": "Short 1-sentence explanation of authority positioning."
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
                temperature: 0.3,
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
            const validatedVariants: MetadataVariant[] = (parsed.variants || []).map((v: any, index: number) => {
              const title = (v.metaTitle || `${topic} | Thread Security`).trim();
              const desc = (v.metaDescription || `Explore ${topic} with practical labs and mentorship at Thread Security Education.`).trim();
              
              return {
                id: v.id || `variant-${index + 1}`,
                name: v.name || `Optimized Strategy ${index + 1}`,
                badge: v.badge || 'AI Generated',
                metaTitle: title,
                metaTitleLength: title.length,
                metaTitleStatus: title.length > 60 ? 'TOO_LONG' : title.length < 35 ? 'TOO_SHORT' : 'OPTIMAL',
                metaDescription: desc,
                metaDescriptionLength: desc.length,
                metaDescriptionStatus: desc.length > 160 ? 'TOO_LONG' : desc.length < 110 ? 'TOO_SHORT' : 'OPTIMAL',
                predictedCtr: typeof v.predictedCtr === 'number' ? v.predictedCtr : 7.8,
                serpRankPotential: v.serpRankPotential || 'Top 5 Target',
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
    const fallbackData = generateProgrammaticMetadata(url, topic, keywords, pageType);
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
  pageType: string
) {
  const kwList = rawKeywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const primaryKw = kwList[0] || topic;
  const secondaryKw = kwList[1] || 'Hands-on Cyber Labs';

  const cleanTopic = topic.length > 30 ? topic.substring(0, 28) + '...' : topic;

  const variants: MetadataVariant[] = [
    {
      id: 'variant-high-ctr',
      name: 'High-CTR Commercial Magnet',
      badge: 'Highest Clicks',
      metaTitle: `${cleanTopic} Course 2026 | Thread Security`.substring(0, 60),
      metaTitleLength: 0,
      metaTitleStatus: 'OPTIMAL',
      metaDescription: `Master ${primaryKw} with 100% hands-on labs and 1-on-1 industry mentorship. Earn your verified certificate. Enroll today at Thread Security!`.substring(0, 158),
      metaDescriptionLength: 0,
      metaDescriptionStatus: 'OPTIMAL',
      predictedCtr: 8.85,
      serpRankPotential: 'Top 3 Rank Target',
      lsiKeywords: [primaryKw, secondaryKw, 'practical cyber training', 'threat analysis labs'],
      strategyRationale: 'Front-loads year and primary keyword to attract high-intent enrollment searchers.',
    },
    {
      id: 'variant-rank-one',
      name: 'Rank #1 Algorithmic Stacking',
      badge: 'Max Google Relevance',
      metaTitle: `${cleanTopic} & ${secondaryKw} | Thread Security`.substring(0, 60),
      metaTitleLength: 0,
      metaTitleStatus: 'OPTIMAL',
      metaDescription: `Comprehensive ${primaryKw} training: practice real offensive security simulations, malware defense, and SOC workflows. Explore full syllabus now.`.substring(0, 158),
      metaDescriptionLength: 0,
      metaDescriptionStatus: 'OPTIMAL',
      predictedCtr: 8.12,
      serpRankPotential: 'Rank #1 Target',
      lsiKeywords: [primaryKw, secondaryKw, 'offensive security syllabus', 'cyber certifications'],
      strategyRationale: 'Combines two high-volume exact match terms to maximize Google algorithmic relevance score.',
    },
    {
      id: 'variant-authoritative',
      name: 'Authoritative Masterclass Credential',
      badge: 'Enterprise Trust',
      metaTitle: `Practical ${cleanTopic} Masterclass | Thread Security`.substring(0, 60),
      metaTitleLength: 0,
      metaTitleStatus: 'OPTIMAL',
      metaDescription: `Learn ${primaryKw} from active enterprise security architects. Hands-on virtual labs, live threat hunting, and career placement. Apply today.`.substring(0, 158),
      metaDescriptionLength: 0,
      metaDescriptionStatus: 'OPTIMAL',
      predictedCtr: 7.74,
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
