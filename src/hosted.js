// hosted.js — Static reference data for hosted/cloud LLM APIs
// last_updated: 2026-03-07
// Benchmarks: MMLU-Pro (0-100), HumanEval (0-100), Arena ELO (Chatbot Arena)

const HOSTED_MODELS = [
  // OpenAI
  { id: "gpt-4.1",       name: "GPT-4.1",       provider: "OpenAI",    pricing: { input_per_1m: 2.00, output_per_1m: 8.00 },   throughput_tok_s: 100, ttft_ms: 350,  context_window: 1047576, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-04-14", notes: "Flagship model, strong at coding",
    benchmarks: { mmlu_pro: 79.6, humaneval: 92.0, arena_elo: 1340, swe_bench: 54.6 } },
  { id: "gpt-4.1-mini",  name: "GPT-4.1 Mini",  provider: "OpenAI",    pricing: { input_per_1m: 0.40, output_per_1m: 1.60 },   throughput_tok_s: 150, ttft_ms: 250,  context_window: 1047576, quality_tier: "strong",   capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-04-14", notes: "Cost-efficient, great for most tasks",
    benchmarks: { mmlu_pro: 73.5, humaneval: 88.5, arena_elo: 1290, swe_bench: 46.2 } },
  { id: "gpt-4.1-nano",  name: "GPT-4.1 Nano",  provider: "OpenAI",    pricing: { input_per_1m: 0.10, output_per_1m: 0.40 },   throughput_tok_s: 200, ttft_ms: 150,  context_window: 1047576, quality_tier: "budget",   capabilities: ["chat","coding"],                          release_date: "2025-04-14", notes: "Fastest and cheapest GPT-4.1",
    benchmarks: { mmlu_pro: 60.2, humaneval: 79.0, arena_elo: 1200, swe_bench: 28.5 } },
  { id: "gpt-4o",        name: "GPT-4o",         provider: "OpenAI",    pricing: { input_per_1m: 2.50, output_per_1m: 10.00 },  throughput_tok_s: 100, ttft_ms: 400,  context_window: 128000,  quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2024-05-13", notes: "Previous flagship, still widely used",
    benchmarks: { mmlu_pro: 74.5, humaneval: 90.2, arena_elo: 1310, swe_bench: 38.4 } },
  { id: "gpt-4o-mini",   name: "GPT-4o Mini",    provider: "OpenAI",    pricing: { input_per_1m: 0.15, output_per_1m: 0.60 },   throughput_tok_s: 150, ttft_ms: 250,  context_window: 128000,  quality_tier: "mid",      capabilities: ["chat","coding","multimodal"],              release_date: "2024-07-18", notes: "Budget multimodal option",
    benchmarks: { mmlu_pro: 63.1, humaneval: 87.2, arena_elo: 1220, swe_bench: 23.8 } },
  { id: "o3",            name: "o3",             provider: "OpenAI",    pricing: { input_per_1m: 10.00, output_per_1m: 40.00 },  throughput_tok_s: 40,  ttft_ms: 2000, context_window: 200000,  quality_tier: "frontier", capabilities: ["reasoning","coding","chat"],               release_date: "2025-01-31", notes: "Deep reasoning model, high latency",
    benchmarks: { mmlu_pro: 86.0, humaneval: 96.7, arena_elo: 1410, swe_bench: 71.7 } },
  { id: "o4-mini",       name: "o4-mini",        provider: "OpenAI",    pricing: { input_per_1m: 1.10, output_per_1m: 4.40 },   throughput_tok_s: 80,  ttft_ms: 1000, context_window: 200000,  quality_tier: "strong",   capabilities: ["reasoning","coding","chat"],               release_date: "2025-04-16", notes: "Efficient reasoning model",
    benchmarks: { mmlu_pro: 81.4, humaneval: 94.2, arena_elo: 1370, swe_bench: 68.1 } },

  // Anthropic
  { id: "claude-opus-4",     name: "Claude Opus 4",     provider: "Anthropic", pricing: { input_per_1m: 15.00, output_per_1m: 75.00 }, throughput_tok_s: 40,  ttft_ms: 1500, context_window: 200000, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-05-22", notes: "Most capable Claude, agentic coding",
    benchmarks: { mmlu_pro: 84.2, humaneval: 95.3, arena_elo: 1395, swe_bench: 72.0 } },
  { id: "claude-sonnet-4",   name: "Claude Sonnet 4",   provider: "Anthropic", pricing: { input_per_1m: 3.00, output_per_1m: 15.00 },  throughput_tok_s: 80,  ttft_ms: 600,  context_window: 200000, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-05-22", notes: "Best balance of speed and quality",
    benchmarks: { mmlu_pro: 80.1, humaneval: 93.8, arena_elo: 1365, swe_bench: 65.3 } },
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic", pricing: { input_per_1m: 3.00, output_per_1m: 15.00 },  throughput_tok_s: 90,  ttft_ms: 500,  context_window: 200000, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-10-22", notes: "Improved reasoning and speed over Sonnet 4",
    benchmarks: { mmlu_pro: 82.5, humaneval: 94.5, arena_elo: 1380, swe_bench: 70.3 } },
  { id: "claude-haiku-4.5",  name: "Claude Haiku 4.5",  provider: "Anthropic", pricing: { input_per_1m: 0.80, output_per_1m: 4.00 },   throughput_tok_s: 170, ttft_ms: 250,  context_window: 200000, quality_tier: "strong",   capabilities: ["chat","coding","reasoning"],              release_date: "2025-10-01", notes: "Fast and affordable, big step up from 3.5",
    benchmarks: { mmlu_pro: 72.8, humaneval: 89.7, arena_elo: 1295, swe_bench: 49.2 } },
  { id: "claude-opus-4.6",   name: "Claude Opus 4.6",   provider: "Anthropic", pricing: { input_per_1m: 15.00, output_per_1m: 75.00 }, throughput_tok_s: 50,  ttft_ms: 1200, context_window: 200000, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2026-01-15", notes: "Latest Opus, strongest agentic performance",
    benchmarks: { mmlu_pro: 86.8, humaneval: 96.5, arena_elo: 1420, swe_bench: 75.2 } },
  { id: "claude-sonnet-4.6", name: "Claude Sonnet 4.6", provider: "Anthropic", pricing: { input_per_1m: 3.00, output_per_1m: 15.00 },  throughput_tok_s: 100, ttft_ms: 450,  context_window: 200000, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2026-01-15", notes: "Fast frontier model, excellent value",
    benchmarks: { mmlu_pro: 83.5, humaneval: 95.0, arena_elo: 1390, swe_bench: 72.1 } },

  // Google
  { id: "gemini-2.5-pro",   name: "Gemini 2.5 Pro",   provider: "Google", pricing: { input_per_1m: 1.25, output_per_1m: 10.00 },  throughput_tok_s: 120, ttft_ms: 400,  context_window: 1048576, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-03-25", notes: "Thinking model, 1M context",
    benchmarks: { mmlu_pro: 83.0, humaneval: 93.5, arena_elo: 1375, swe_bench: 63.8 } },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", pricing: { input_per_1m: 0.15, output_per_1m: 0.60 },   throughput_tok_s: 180, ttft_ms: 200,  context_window: 1048576, quality_tier: "strong",   capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-04-17", notes: "Fast thinking, great value",
    benchmarks: { mmlu_pro: 74.0, humaneval: 90.0, arena_elo: 1310, swe_bench: 47.5 } },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", pricing: { input_per_1m: 0.10, output_per_1m: 0.40 },   throughput_tok_s: 200, ttft_ms: 150,  context_window: 1048576, quality_tier: "mid",      capabilities: ["chat","coding","multimodal"],              release_date: "2025-02-05", notes: "Budget speed option",
    benchmarks: { mmlu_pro: 65.8, humaneval: 84.2, arena_elo: 1230, swe_bench: 33.0 } },

  // Meta (via API providers)
  { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "Meta (via API)", pricing: { input_per_1m: 0.50, output_per_1m: 0.70 },  throughput_tok_s: 100, ttft_ms: 500,  context_window: 1048576, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-04-05", notes: "MoE 400B, 17B active. Priced via Together AI",
    benchmarks: { mmlu_pro: 79.8, humaneval: 91.5, arena_elo: 1330, swe_bench: 50.1 } },
  { id: "llama-4-scout",   name: "Llama 4 Scout",   provider: "Meta (via API)", pricing: { input_per_1m: 0.18, output_per_1m: 0.30 },  throughput_tok_s: 140, ttft_ms: 300,  context_window: 10485760,quality_tier: "strong",   capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-04-05", notes: "MoE 109B, 17B active. 10M context",
    benchmarks: { mmlu_pro: 72.0, humaneval: 86.5, arena_elo: 1275, swe_bench: 40.3 } },

  // xAI
  { id: "grok-3",        name: "Grok 3",         provider: "xAI",      pricing: { input_per_1m: 3.00, output_per_1m: 15.00 },  throughput_tok_s: 80,  ttft_ms: 600,  context_window: 131072, quality_tier: "frontier", capabilities: ["chat","coding","reasoning","multimodal"], release_date: "2025-02-17", notes: "Strong reasoning and coding",
    benchmarks: { mmlu_pro: 81.2, humaneval: 93.0, arena_elo: 1360, swe_bench: 58.5 } },
  { id: "grok-3-mini",   name: "Grok 3 Mini",    provider: "xAI",      pricing: { input_per_1m: 0.30, output_per_1m: 0.50 },   throughput_tok_s: 150, ttft_ms: 300,  context_window: 131072, quality_tier: "strong",   capabilities: ["chat","coding","reasoning"],              release_date: "2025-03-12", notes: "Efficient reasoning, think mode",
    benchmarks: { mmlu_pro: 74.5, humaneval: 88.0, arena_elo: 1300, swe_bench: 45.0 } },

  // Mistral
  { id: "mistral-large",  name: "Mistral Large",  provider: "Mistral",  pricing: { input_per_1m: 2.00, output_per_1m: 6.00 },   throughput_tok_s: 90,  ttft_ms: 500,  context_window: 128000, quality_tier: "strong",   capabilities: ["chat","coding","reasoning"],              release_date: "2024-11-18", notes: "Mistral's most capable model",
    benchmarks: { mmlu_pro: 72.5, humaneval: 88.0, arena_elo: 1280, swe_bench: 42.0 } },
  { id: "mistral-small",  name: "Mistral Small",  provider: "Mistral",  pricing: { input_per_1m: 0.10, output_per_1m: 0.30 },   throughput_tok_s: 160, ttft_ms: 200,  context_window: 32000,  quality_tier: "mid",      capabilities: ["chat","coding"],                          release_date: "2025-02-21", notes: "Efficient for simple tasks",
    benchmarks: { mmlu_pro: 58.2, humaneval: 78.5, arena_elo: 1180, swe_bench: 22.0 } },

  // DeepSeek
  { id: "deepseek-v3",   name: "DeepSeek V3",   provider: "DeepSeek",  pricing: { input_per_1m: 0.27, output_per_1m: 1.10 },   throughput_tok_s: 60,  ttft_ms: 800,  context_window: 65536,  quality_tier: "strong",   capabilities: ["chat","coding","reasoning"],              release_date: "2024-12-26", notes: "MoE 671B, strong at coding",
    benchmarks: { mmlu_pro: 75.8, humaneval: 91.0, arena_elo: 1315, swe_bench: 48.8 } },
  { id: "deepseek-r1",   name: "DeepSeek R1",   provider: "DeepSeek",  pricing: { input_per_1m: 0.55, output_per_1m: 2.19 },   throughput_tok_s: 30,  ttft_ms: 2000, context_window: 65536,  quality_tier: "frontier", capabilities: ["reasoning","coding","chat"],               release_date: "2025-01-20", notes: "Reasoning model, chain-of-thought",
    benchmarks: { mmlu_pro: 84.0, humaneval: 94.8, arena_elo: 1390, swe_bench: 57.2 } },

  // Qwen (via API providers)
  { id: "qwen-2.5-72b",  name: "Qwen 2.5 72B",  provider: "Alibaba (via API)", pricing: { input_per_1m: 0.40, output_per_1m: 0.40 },  throughput_tok_s: 80,  ttft_ms: 500,  context_window: 131072, quality_tier: "strong",   capabilities: ["chat","coding","reasoning"],              release_date: "2025-01-15", notes: "Strong open-weight model via Together/Fireworks",
    benchmarks: { mmlu_pro: 71.2, humaneval: 86.8, arena_elo: 1270, swe_bench: 39.5 } },
];

const TIER_ORDER = { frontier: 0, strong: 1, mid: 2, budget: 3 };

function getHostedByTier(tier) {
  return HOSTED_MODELS.filter((m) => m.quality_tier === tier);
}

function calculateMonthlyCost(model, profile) {
  const { prompts_per_day = 100, avg_input_tokens = 500, avg_output_tokens = 1000 } = profile;
  const days = 30;
  const inputTokensMonth = prompts_per_day * avg_input_tokens * days;
  const outputTokensMonth = prompts_per_day * avg_output_tokens * days;
  const monthlyCost =
    (inputTokensMonth / 1_000_000) * model.pricing.input_per_1m +
    (outputTokensMonth / 1_000_000) * model.pricing.output_per_1m;
  const costPerPrompt =
    (avg_input_tokens / 1_000_000) * model.pricing.input_per_1m +
    (avg_output_tokens / 1_000_000) * model.pricing.output_per_1m;
  return {
    monthly_cost: Math.round(monthlyCost * 100) / 100,
    cost_per_prompt: Math.round(costPerPrompt * 10000) / 10000,
    input_tokens_month: inputTokensMonth,
    output_tokens_month: outputTokensMonth,
  };
}

function findComparableHosted(localModel) {
  const qScore = localModel.scores?.quality || 0;
  const tier = qScore >= 80 ? "frontier" : qScore >= 60 ? "strong" : qScore >= 40 ? "mid" : "budget";
  const useCase = localModel.use_case || "chat";

  const scored = HOSTED_MODELS.map((h) => {
    const tierDist = Math.abs((TIER_ORDER[h.quality_tier] || 2) - (TIER_ORDER[tier] || 2));
    const capMatch = h.capabilities.includes(useCase) ? 1 : 0;
    return { model: h, score: capMatch * 10 - tierDist };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.model);
}

module.exports = { HOSTED_MODELS, getHostedByTier, calculateMonthlyCost, findComparableHosted };
