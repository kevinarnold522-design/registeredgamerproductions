import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ILLEGAL_KEYWORDS = [
  "porn","pornography","xxx","sex","adult content","nude","nudity","naked","erotic","onlyfans",
  "escort","prostitution","drugs","cocaine","heroin","meth","methamphetamine","marijuana for sale",
  "weed for sale","illegal weapons","firearms","gun for sale","bomb","explosive","child abuse",
  "cp","csam","trafficking","weapon","hitman","darkweb","dark web","counterfeit","piracy",
  "account hacking","hacked accounts","stolen accounts","malware","ransomware","phishing kit",
  "carding","cvv dump","credit card dump","ssn dump"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, category } = await req.json();
    const combined = `${title || ""} ${description || ""}`.toLowerCase();

    // Rule 1: keyword check
    const flaggedKeywords = ILLEGAL_KEYWORDS.filter(kw => combined.includes(kw));

    // Rule 2: AI moderation via LLM
    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation AI for a gaming marketplace. Analyze the following listing and determine if it contains illegal, adult, pornographic, drug-related, or clearly harmful content that should be rejected.

Title: ${title}
Description: ${description || ""}
Category: ${category || ""}

Respond with a JSON object:
{
  "is_illegal": boolean,
  "confidence": "high" | "medium" | "low",
  "reason": "brief explanation",
  "flags": ["list", "of", "issues"]
}

Be strict: porn, sex services, illegal drugs, illegal weapons, stolen/hacked accounts, trafficking, child exploitation = reject. Gaming mods, cheats/trainers for single-player games, regular gaming gear = allow.`,
      response_json_schema: {
        type: "object",
        properties: {
          is_illegal: { type: "boolean" },
          confidence: { type: "string" },
          reason: { type: "string" },
          flags: { type: "array", items: { type: "string" } }
        }
      }
    });

    const hasKeywordFlag = flaggedKeywords.length > 0;
    const aiFlag = aiResult?.is_illegal === true && (aiResult?.confidence === "high" || aiResult?.confidence === "medium");

    const requiresReview = hasKeywordFlag || aiFlag;

    return Response.json({
      requiresReview,
      is_approved: !requiresReview,
      flaggedKeywords,
      aiAnalysis: aiResult,
      message: requiresReview
        ? "This listing has been flagged for admin review due to potentially illegal or inappropriate content."
        : "Listing passed content moderation."
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});