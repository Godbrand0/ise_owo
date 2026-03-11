# Taskify — AI Leaderboard Insights Integration

## Overview

The AI layer reads deterministic on-chain data (indexed off-chain) and generates human-readable insight narratives. It never influences scoring or fund distribution — it only interprets and presents data. Two insight types: **General** (public) and **Personal** (per-creator).

---

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│ Stacks Blockchain   │────►│ Chainhooks / Hiro API │
│ (on-chain events)   │     │ (event indexer)        │
└─────────────────────┘     └──────────┬───────────┘
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │ Database (PostgreSQL  │
                            │ or Supabase)          │
                            │                       │
                            │ Tables:               │
                            │  - tasks              │
                            │  - task_events        │
                            │  - user_profiles      │
                            │  - monthly_scores     │
                            │  - fee_collections    │
                            └──────────┬───────────┘
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                          ▼                         ▼
                ┌──────────────────┐     ┌──────────────────┐
                │ Scoring Engine   │     │ AI Insights API  │
                │ (deterministic)  │     │ (Claude/Gemini)  │
                │                  │     │                  │
                │ Calculates:      │     │ Generates:       │
                │ - Composite score│     │ - General summary│
                │ - Rankings       │     │ - Personal tips  │
                │ - Distributions  │     │ - Trend analysis │
                └──────────────────┘     └──────────────────┘
```

---

## Data Schema (Off-Chain Database)

### tasks table
```sql
CREATE TABLE tasks (
  task_id         INTEGER PRIMARY KEY,
  title           TEXT NOT NULL,
  creator         TEXT NOT NULL,       -- Stacks principal
  assignee        TEXT,
  token_type      TEXT NOT NULL,       -- 'STX' or 'USDCx'
  funding_amount  BIGINT NOT NULL,     -- micro units
  base_fee        BIGINT NOT NULL,
  tip_amount      BIGINT NOT NULL,
  tip_percent     INTEGER NOT NULL,
  status          TEXT NOT NULL,
  created_at      INTEGER NOT NULL,    -- block height
  completed_at    INTEGER,
  deadline        INTEGER NOT NULL
);
```

### monthly_scores table
```sql
CREATE TABLE monthly_scores (
  id                  SERIAL PRIMARY KEY,
  creator             TEXT NOT NULL,
  month               TEXT NOT NULL,         -- '2026-03'
  tasks_completed     INTEGER DEFAULT 0,
  funding_volume_usd  NUMERIC DEFAULT 0,     -- normalized to USD
  avg_tip_percent     NUMERIC DEFAULT 0,
  composite_score     NUMERIC DEFAULT 0,
  rank                INTEGER,
  payout_stx          BIGINT DEFAULT 0,
  payout_usdcx        BIGINT DEFAULT 0
);
```

### fee_collections table
```sql
CREATE TABLE fee_collections (
  id            SERIAL PRIMARY KEY,
  month         TEXT NOT NULL,
  token_type    TEXT NOT NULL,
  total_fees    BIGINT DEFAULT 0,
  leaderboard_pool  BIGINT DEFAULT 0,    -- 20%
  platform_revenue  BIGINT DEFAULT 0     -- 80%
);
```

---

## Scoring Engine (Deterministic)

Run monthly via cron job or triggered manually by admin.

```typescript
// scoring.ts

interface CreatorMonthlyData {
  creator: string;
  tasksCompleted: number;
  fundingVolumeUsd: number;
  avgTipPercent: number;
}

// Configurable weights (adjust as needed)
const WEIGHT_TASKS = 0.4;
const WEIGHT_VOLUME = 0.35;
const WEIGHT_TIP = 0.25;

function calculateCompositeScore(data: CreatorMonthlyData): number {
  // Normalize each metric to 0-100 scale relative to the month's max
  // Then apply weights
  return (
    (data.tasksCompleted * WEIGHT_TASKS) +
    (data.fundingVolumeUsd * WEIGHT_VOLUME) +
    (data.avgTipPercent * WEIGHT_TIP)
  );
}

function calculateLeaderboard(allCreators: CreatorMonthlyData[]): RankedCreator[] {
  return allCreators
    .map(c => ({ ...c, score: calculateCompositeScore(c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)  // top 10
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

function calculatePayouts(
  rankedCreators: RankedCreator[],
  stxPool: number,
  usdcxPool: number
): PayoutInstruction[] {
  const totalScore = rankedCreators.reduce((sum, c) => sum + c.score, 0);

  return rankedCreators.map(c => ({
    address: c.creator,
    stxAmount: Math.floor((c.score / totalScore) * stxPool),
    usdcxAmount: Math.floor((c.score / totalScore) * usdcxPool),
  }));
}
```

---

## AI Insights — General (Public Dashboard)

### What It Shows
- Monthly platform activity summary
- Top categories/trends
- Notable achievements
- Growth metrics (vs previous month)

### Prompt Template

```typescript
const generalInsightsPrompt = (monthData: MonthlyPlatformData) => `
You are Taskify's analytics narrator. Generate a concise, engaging monthly summary
for the Taskify bounty board on Stacks (Bitcoin L2).

Data for ${monthData.month}:
- Total tasks created: ${monthData.tasksCreated}
- Total tasks completed: ${monthData.tasksCompleted}
- Total STX funded: ${monthData.totalStxFunded} microSTX
- Total USDCx funded: ${monthData.totalUsdcxFunded} micro-USDCx
- Unique creators: ${monthData.uniqueCreators}
- Unique contributors: ${monthData.uniqueContributors}
- Average completion time: ${monthData.avgCompletionBlocks} blocks (~${monthData.avgCompletionDays} days)
- Top creator: ${monthData.topCreator.username} (${monthData.topCreator.tasksCompleted} tasks, score: ${monthData.topCreator.score})
- Total fees collected: ${monthData.totalFeesStx} STX + ${monthData.totalFeesUsdcx} USDCx
- Leaderboard pool distributed: ${monthData.poolDistributed}
- Month-over-month growth: ${monthData.momGrowthPercent}%

Previous month comparison:
- Tasks created: ${monthData.prevTasksCreated} → ${monthData.tasksCreated}
- Unique users: ${monthData.prevUniqueUsers} → ${monthData.uniqueCreators + monthData.uniqueContributors}

Guidelines:
- Keep it to 3-4 paragraphs max
- Use specific numbers from the data
- Highlight notable achievements or trends
- Mention the Bitcoin/Stacks ecosystem context naturally
- Tone: professional but approachable, like a newsletter update
- Do NOT make up data or speculate beyond what's provided
- Convert microSTX to STX (divide by 1,000,000) and micro-USDCx to USDCx for display
`;
```

### Example Output

> **Taskify Monthly — March 2026**
>
> Taskify processed 47 completed tasks this month, a 28% increase from February. Creators collectively funded bounties worth 15,230 STX and 8,450 USDCx — with USDCx-denominated tasks overtaking STX for the first time since launch, signaling growing stablecoin adoption in the Stacks ecosystem.
>
> This month's top creator, **stxbuilder**, posted 6 bounties that were all completed and approved within an average of 3.2 days. The leaderboard pool distributed 620 STX and 340 USDCx across the top 10 creators, rewarding those who contributed most actively to the platform.
>
> The platform now has 89 registered creators and 142 contributors, with 23 new users joining this month. Average task completion time dropped to 4.1 days, down from 5.8 days last month — a sign that the contributor community is becoming more responsive.

---

## AI Insights — Personal (Creator-Specific)

### What It Shows
- Creator's monthly performance summary
- Current leaderboard rank and trajectory
- Actionable tips to improve ranking
- Comparison to platform averages
- Contributor patterns relevant to the creator

### Prompt Template

```typescript
const personalInsightsPrompt = (
  creator: CreatorData,
  platformAvg: PlatformAverages,
  month: string
) => `
You are Taskify's personal analytics assistant. Generate a personalized monthly
insight for a creator on the Taskify bounty board (Stacks/Bitcoin L2).

Creator: ${creator.username}
Month: ${month}

Creator's metrics:
- Tasks created this month: ${creator.tasksCreated}
- Tasks completed (approved & released): ${creator.tasksCompleted}
- Total funded: ${creator.totalFundedStx} STX + ${creator.totalFundedUsdcx} USDCx
- Average tip: ${creator.avgTipPercent}%
- Current leaderboard rank: #${creator.rank} of ${creator.totalCreators}
- Composite score: ${creator.score}
- Previous month rank: #${creator.prevRank}
- Payout received: ${creator.payoutStx} STX + ${creator.payoutUsdcx} USDCx

Platform averages:
- Avg tasks per creator: ${platformAvg.avgTasksPerCreator}
- Avg funding per task: ${platformAvg.avgFundingPerTask}
- Avg tip: ${platformAvg.avgTipPercent}%
- Median completion time: ${platformAvg.medianCompletionDays} days

Score breakdown:
- Tasks score component: ${creator.tasksScore} (weight: 40%)
- Volume score component: ${creator.volumeScore} (weight: 35%)
- Tip score component: ${creator.tipScore} (weight: 25%)

Gap to next rank:
- Creator at rank #${creator.rank - 1}: score ${creator.nextRankScore}
- Score gap: ${creator.nextRankScore - creator.score}

Guidelines:
- Keep it to 2-3 paragraphs
- Be specific with numbers — show the creator exactly where they stand
- Give 1-2 actionable suggestions to improve their rank
- Be encouraging but honest
- If they dropped in rank, acknowledge it constructively
- Mention which score component has the most room for improvement
- Tone: personal coach, not corporate report
- Convert micro units to human-readable (divide by 1,000,000)
`;
```

### Example Output

> **Your March 2026 Recap**
>
> You created 4 tasks this month, with 3 reaching completion — that puts you above the platform average of 2.3 tasks per creator. Your total funding volume of 2,100 STX and 500 USDCx landed you at **#7 on the leaderboard**, up from #12 last month. Nice climb! You earned 42 STX and 23 USDCx from this month's fee redistribution.
>
> Your biggest opportunity to move up is in tip generosity — your average tip of 1% is below the platform average of 1.8%. Bumping to 2% on your next couple of tasks would boost your tip score component significantly and could push you into the top 5. The creator at #6 is only 12 points ahead of you, so 2 more completed tasks with a 2% tip would likely close that gap.

---

## API Integration (Frontend)

```typescript
// services/insights.ts

const AI_API_URL = import.meta.env.VITE_AI_PROVIDER === "claude"
  ? "https://api.anthropic.com/v1/messages"
  : "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

// For Claude API
async function generateInsights(prompt: string): Promise<string> {
  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_AI_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}

// Fetch and display general insights
async function getGeneralInsights(month: string): Promise<string> {
  const monthData = await fetchMonthlyPlatformData(month); // from your DB/API
  const prompt = generalInsightsPrompt(monthData);
  return generateInsights(prompt);
}

// Fetch and display personal insights
async function getPersonalInsights(
  creatorAddress: string,
  month: string
): Promise<string> {
  const creatorData = await fetchCreatorData(creatorAddress, month);
  const platformAvg = await fetchPlatformAverages(month);
  const prompt = personalInsightsPrompt(creatorData, platformAvg, month);
  return generateInsights(prompt);
}
```

---

## Caching Strategy

AI-generated insights should be cached to avoid excessive API calls and costs:

```typescript
// Cache insights in your database or a simple KV store

// General insights: generate once per month, cache indefinitely
// Personal insights: generate once per user per month, cache for the month
// Re-generate if underlying data changes significantly (e.g., late task completions)

interface CachedInsight {
  key: string;          // "general:2026-03" or "personal:SP123...ABC:2026-03"
  content: string;
  generated_at: string;
  data_hash: string;    // hash of input data, re-generate if changed
}
```

---

## Security Considerations

1. **Never expose AI API keys on the frontend** — route all AI calls through your backend/API
2. **Rate limit insight generation** — max 1 personal insight request per user per day
3. **Validate all data** before passing to AI — never include raw user input in prompts
4. **Sanitize AI output** — strip any unexpected content before rendering
5. **AI is read-only** — it should never trigger contract calls or modify data

---

## Cost Estimation

| Provider | Model | Approximate Cost per Insight |
|---|---|---|
| Claude | claude-sonnet-4-20250514 | ~$0.003-0.01 per insight |
| Gemini | gemini-pro | ~$0.001-0.005 per insight |

For a platform with 100 active creators:
- 1 general insight/month: ~$0.01
- 100 personal insights/month: ~$0.50-1.00
- **Total monthly AI cost: ~$1-2** (very manageable)

---

## Future Enhancements

- **Weekly mini-insights** — shorter mid-month check-ins
- **Contributor insights** — not just creators, also contributors get performance summaries
- **Trend predictions** — "Based on current trajectory, you could reach top 3 by May"
- **Task recommendations** — "Contributors skilled in Clarity are most active on Tuesdays"
- **Natural language queries** — let users ask questions about their data ("How did I compare to last month?")
