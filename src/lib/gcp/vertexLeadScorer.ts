export interface LeadScoreResult {
  aiScore: number; // 0 to 100
  intentCategory: 'HIGH_INTENT' | 'MEDIUM_INTENT' | 'LOW_INTENT';
  reasoning: string;
  recommendedAction: string;
}

export async function scoreLeadWithAI(leadData: {
  name: string;
  email: string;
  phone?: string | null;
  courseInterest?: string | null;
  careerGoal?: string | null;
  source?: string | null;
}): Promise<LeadScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackRuleBasedScoring(leadData);
  }

  try {
    const prompt = `
You are an expert Cybersecurity Education Admissions AI Counselor.
Evaluate the following lead and assign a Lead Intent Score between 0 and 100 based on likelihood to enroll.

Lead Profile:
- Name: ${leadData.name}
- Email: ${leadData.email}
- Phone Provided: ${leadData.phone ? 'Yes (' + leadData.phone + ')' : 'No'}
- Course Interest: ${leadData.courseInterest || 'Not specified'}
- Career Goal: ${leadData.careerGoal || 'Not specified'}
- Acquisition Source: ${leadData.source || 'Website'}

Respond ONLY with a JSON object in this exact format:
{
  "aiScore": 85,
  "intentCategory": "HIGH_INTENT",
  "reasoning": "Provided contact number and specific career goal in SOC Analysis.",
  "recommendedAction": "Call within 2 hours to schedule dynamic lab demo."
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          aiScore: Math.min(100, Math.max(0, parsed.aiScore || 50)),
          intentCategory: parsed.intentCategory || (parsed.aiScore > 75 ? 'HIGH_INTENT' : parsed.aiScore > 40 ? 'MEDIUM_INTENT' : 'LOW_INTENT'),
          reasoning: parsed.reasoning || 'AI processed lead criteria.',
          recommendedAction: parsed.recommendedAction || 'Follow up with welcome package.',
        };
      }
    }
  } catch (error) {
    console.error('[Vertex Lead Scorer] Gemini API call failed, falling back to rule engine:', error);
  }

  return fallbackRuleBasedScoring(leadData);
}

function fallbackRuleBasedScoring(leadData: {
  name: string;
  email: string;
  phone?: string | null;
  courseInterest?: string | null;
  careerGoal?: string | null;
  source?: string | null;
}): LeadScoreResult {
  let score = 40; // Base score
  const reasons: string[] = [];

  if (leadData.phone) {
    score += 25;
    reasons.push('Provided direct contact phone number.');
  }

  if (leadData.careerGoal && leadData.careerGoal.length > 10) {
    score += 20;
    reasons.push('Clear career objective stated.');
  }

  if (leadData.courseInterest) {
    score += 15;
    reasons.push(`Specific course interest in ${leadData.courseInterest}.`);
  }

  if (leadData.source === 'WORKSHOP' || leadData.source === 'COURSE_SYLLABUS') {
    score += 10;
    reasons.push(`High engagement acquisition channel (${leadData.source}).`);
  }

  const finalScore = Math.min(100, score);
  const category = finalScore >= 75 ? 'HIGH_INTENT' : finalScore >= 45 ? 'MEDIUM_INTENT' : 'LOW_INTENT';
  const action =
    category === 'HIGH_INTENT'
      ? 'High priority! Immediate direct phone reach-out recommended.'
      : category === 'MEDIUM_INTENT'
      ? 'Send personalized course curriculum PDF and offer 1-on-1 mentor session.'
      : 'Include in automated weekly newsletter drip campaign.';

  return {
    aiScore: finalScore,
    intentCategory: category,
    reasoning: reasons.join(' ') || 'Standard lead entry.',
    recommendedAction: action,
  };
}
