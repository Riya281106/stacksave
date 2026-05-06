export type ToolEntry = {
  toolId: string;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type FormData = {
  tools: ToolEntry[];
  teamSize: number;
  useCase: string;
};

export type AuditResult = {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan: string;
  potentialSaving: number;
  reason: string;
};

// Official pricing as of May 2026
const PRICING: Record<string, Record<string, number>> = {
  cursor: {
    Hobby: 0,
    Pro: 20,
    Business: 40,
    Enterprise: 100,
  },
  github_copilot: {
    Individual: 10,
    Business: 19,
    Enterprise: 39,
  },
  claude: {
    Free: 0,
    Pro: 20,
    Max: 100,
    Team: 30,
    Enterprise: 60,
    API: 0,
  },
  chatgpt: {
    Plus: 20,
    Team: 30,
    Enterprise: 60,
    API: 0,
  },
  gemini: {
    Pro: 20,
    Ultra: 300,
    API: 0,
  },
  windsurf: {
    Free: 0,
    Pro: 15,
    Teams: 35,
  },
};

const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export function runAudit(form: FormData): AuditResult[] {
  const results: AuditResult[] = [];

  for (const tool of form.tools) {
    const { toolId, plan, monthlySpend, seats } = tool;
    const toolName = TOOL_NAMES[toolId] || toolId;
    const officialPrice = (PRICING[toolId]?.[plan] ?? 0) * seats;

    let recommendedAction = "No change needed";
    let recommendedPlan = plan;
    let potentialSaving = 0;
    let reason = "Your current plan looks right for your usage.";

    // Check 1: Are they overpaying vs official price?
    if (monthlySpend > officialPrice * 1.1 && officialPrice > 0) {
      potentialSaving = monthlySpend - officialPrice;
      recommendedAction = "Review your billing";
      reason = `You're paying $${monthlySpend}/mo but the official ${plan} plan for ${seats} seat(s) costs $${officialPrice}/mo. Check for unused seats or billing errors.`;
    }

    // Check 2: Too many seats for team size?
    if (seats > form.teamSize) {
      const correctPrice = (PRICING[toolId]?.[plan] ?? 0) * form.teamSize;
      const saving = officialPrice - correctPrice;
      if (saving > potentialSaving) {
        potentialSaving = saving;
        recommendedAction = "Reduce seats";
        recommendedPlan = plan;
        reason = `You have ${seats} seats but only ${form.teamSize} people on your team. Reducing to ${form.teamSize} seats saves $${saving}/mo.`;
      }
    }

    // Check 3: Team plan for small teams
    if (toolId === "claude" && plan === "Team" && seats <= 2) {
      const proPlanCost = (PRICING.claude["Pro"] ?? 0) * seats;
      const saving = officialPrice - proPlanCost;
      if (saving > 0) {
        potentialSaving = saving;
        recommendedAction = "Downgrade to Pro";
        recommendedPlan = "Pro";
        reason = `Claude Team is designed for larger teams. With ${seats} seat(s), ${seats} x Claude Pro ($20/mo each) saves you $${saving}/mo with similar features.`;
      }
    }

    if (toolId === "chatgpt" && plan === "Team" && seats <= 2) {
      const plusPlanCost = (PRICING.chatgpt["Plus"] ?? 0) * seats;
      const saving = officialPrice - plusPlanCost;
      if (saving > 0) {
        potentialSaving = saving;
        recommendedAction = "Downgrade to Plus";
        recommendedPlan = "Plus";
        reason = `ChatGPT Team adds collaboration features you likely don't need with ${seats} user(s). ${seats} x Plus ($20/mo) saves $${saving}/mo.`;
      }
    }

    // Check 4: Gemini Ultra is very expensive
    if (toolId === "gemini" && plan === "Ultra") {
      const saving = PRICING.gemini["Ultra"] - PRICING.gemini["Pro"];
      potentialSaving = saving * seats;
      recommendedAction = "Downgrade to Gemini Pro";
      recommendedPlan = "Pro";
      reason = `Gemini Ultra costs $300/mo. Unless you need the highest context window for specialized research, Gemini Pro at $20/mo covers most use cases.`;
    }

    // Check 5: Duplicate tools doing the same job
    const codingTools = form.tools.filter((t) =>
      ["cursor", "github_copilot", "windsurf"].includes(t.toolId)
    );
    if (codingTools.length > 1 && ["cursor", "github_copilot", "windsurf"].includes(toolId)) {
      if (codingTools[0].toolId !== toolId) {
        reason = `You're paying for multiple AI coding tools. Consider picking one — Cursor or Windsurf already includes AI completions, making GitHub Copilot redundant for most workflows.`;
        recommendedAction = "Consolidate coding tools";
        potentialSaving = Math.max(potentialSaving, monthlySpend * 0.5);
      }
    }

    results.push({
      toolId,
      toolName,
      currentPlan: plan,
      currentSpend: monthlySpend,
      recommendedAction,
      recommendedPlan,
      potentialSaving: Math.round(potentialSaving),
      reason,
    });
  }

  return results;
}

export function getTotalSavings(results: AuditResult[]): {
  monthly: number;
  annual: number;
} {
  const monthly = results.reduce((sum, r) => sum + r.potentialSaving, 0);
  return { monthly, annual: monthly * 12 };
}