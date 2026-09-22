import { prisma } from "../db";
import { callAgentLLM } from "./gemini-client";
import { MarketingStatus } from "@prisma/client";

export interface MarketingInput {
  topic: string;
  platform?: "LINKEDIN" | "INSTAGRAM" | "TWITTER";
  highlightMetrics?: string;
  targetAudience?: string;
}

export async function generateMarketingDraft(input: MarketingInput) {
  const platform = input.platform || "LINKEDIN";

  const systemPrompt = `You are an AI Marketing Studio Agent specialized in crafting high-impact B2B social content (text, image prompts, and ad briefs) for LinkedIn and industry channels.
Save the generated draft for review and approval by the QA Operations Manager or Admin prior to publishing.
Adopt an authoritative, value-driven B2B tone with bullet points, tangible metrics, and compelling calls-to-action (CTA).
Output JSON:
{
  "title": string,
  "caption": string,
  "mediaType": "IMAGE" | "VIDEO" | "CAROUSEL",
  "mediaPrompt": string,
  "suggestedMediaUrl": string,
  "targetAudience": string
}`;

  const userPrompt = `Topic: ${input.topic}
Platform: ${platform}
Metrics: ${input.highlightMetrics || "99.4% Inspection Accuracy, 15-minute ISO report turn-around"}
Audience: ${input.targetAudience || "QA Directors, Sourcing Heads, Supply Chain Executives"}`;

  const fallbackData = {
    title: `Transforming Supply Chain Quality: How Multi-Agent AI Delivers Zero-Defect Assurance`,
    caption: `🔍 Uncompromising Quality Standards on the Modern Factory Floor.

How long does your supply chain team wait for field inspection reports?
In today's fast-moving cross-border logistics, waiting 2 to 3 days for manual inspection reports creates costly shipping bottlenecks.

With our integrated Multi-Agent Inspection OS:
⚡ Real-time WhatsApp Photo Ingestion & Vision Verification
⚡ Instant Color, Dimension, & Material Matching against Golden Samples
⚡ Automated ISO/AQL 2.5 Audit Reports generated in under 15 minutes

Ensure your export batches comply with international buyer standards before the container leaves the loading dock.

Connect with our enterprise team to schedule a live demo! 📦

#QualityAssurance #SupplyChainTech #InspectionAI #ManufacturingExcellence #B2BLogistics #AQL25`,
    mediaType: "IMAGE" as const,
    mediaPrompt: "Modern high-tech manufacturing plant with quality inspector holding tablet and AI holographic quality scan overlays, cinematic lighting, 8k",
    suggestedMediaUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
    targetAudience: input.targetAudience || "Quality Assurance Heads, Supply Chain Executives, Exporters",
  };

  const { data } = await callAgentLLM<typeof fallbackData>({
    systemPrompt,
    userPrompt,
    fallbackResponse: fallbackData,
  });

  const post = await prisma.marketingPost.create({
    data: {
      platform,
      title: data.title,
      caption: data.caption,
      mediaType: data.mediaType,
      mediaUrl: data.suggestedMediaUrl || fallbackData.suggestedMediaUrl,
      status: MarketingStatus.DRAFT, // Must be DRAFT before approval as per prompt
      targetAudience: data.targetAudience,
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  return post;
}

export async function approveAndPublishMarketingPost(postId: string) {
  return prisma.marketingPost.update({
    where: { id: postId },
    data: {
      status: MarketingStatus.APPROVED,
      publishedAt: new Date(),
    },
  });
}
