import { prisma } from "@/lib/db";
import { MarketingClientView } from "./marketing-client";

export const dynamic = "force-dynamic";

export default async function MarketingAgentPage() {
  const posts = await prisma.marketingPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Agent 4 • Marketing Content Studio
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          B2B LinkedIn Content Generator &amp; Feed Simulation
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          AI Prompt: Generate high-impact marketing assets (visuals, copy, carousels) for platforms like LinkedIn. Save drafts for manager verification &amp; approval before publishing live.
        </p>
      </div>

      <MarketingClientView initialPosts={posts} />
    </div>
  );
}
