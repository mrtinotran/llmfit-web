// models.js — Loads and normalizes the llmfit model database
const fs = require("fs");
const path = require("path");

// Known MoE models and their active parameter counts
const MOE_MODELS = {
  "Mixtral-8x7B":  { active_params_b: 12.9 },
  "Mixtral-8x22B": { active_params_b: 39.1 },
  "DeepSeek-V2":   { active_params_b: 21.0 },
  "DeepSeek-V3":   { active_params_b: 37.0 },
  "DeepSeek-R1":   { active_params_b: 37.0 },
  "DBRX":          { active_params_b: 36.0 },
  "Grok-1":        { active_params_b: 86.0 },
  "Qwen1.5-MoE":   { active_params_b: 2.7 },
  "Jamba":         { active_params_b: 12.0 },
};

// Use-case detection by model name patterns
const USE_CASE_PATTERNS = [
  { pattern: /coder|code|starcoder|codellama|wizardcoder/i, use_case: "coding" },
  { pattern: /embed|bge|nomic-embed|gte-/i,                 use_case: "embedding" },
  { pattern: /vision|vl|llava|moondream/i,                  use_case: "multimodal" },
  { pattern: /reason|r1|orca|math/i,                        use_case: "reasoning" },
  { pattern: /chat|instruct|it$/i,                           use_case: "chat" },
];

function detectMoE(name) {
  for (const [key, val] of Object.entries(MOE_MODELS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return { is_moe: true, active_params_b: val.active_params_b };
    }
  }
  // Check for MoE indicators in name
  if (/\d+x\d+[bB]/.test(name)) return { is_moe: true, active_params_b: null };
  return { is_moe: false };
}

function detectUseCase(name, existing) {
  if (existing && existing !== "general") return existing;
  for (const { pattern, use_case } of USE_CASE_PATTERNS) {
    if (pattern.test(name)) return use_case;
  }
  return "general";
}

function loadModels(jsonPath) {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  // hf_models.json is an array of model objects
  // Schema: name, provider, parameter_count, context_length, use_case, etc.
  return data.map((m) => {
    const params_b = m.parameter_count
      ? m.parameter_count / 1e9
      : m.params_b || 0;

    const moeInfo = m.num_local_experts
      ? { is_moe: true, active_params_b: m.active_params_b || null }
      : detectMoE(m.name || "");

    // Estimate active params if MoE but not specified
    if (moeInfo.is_moe && !moeInfo.active_params_b && m.num_local_experts && m.num_experts_per_tok) {
      moeInfo.active_params_b = params_b * (m.num_experts_per_tok / m.num_local_experts) * 1.2;
    }

    return {
      name: m.name || "Unknown",
      provider: m.provider || m.organization || "Unknown",
      params_b: Math.round(params_b * 100) / 100,
      context: m.context_length || m.context || 4096,
      use_case: detectUseCase(m.name || "", m.use_case),
      is_moe: moeInfo.is_moe,
      active_params_b: moeInfo.active_params_b
        ? Math.round(moeInfo.active_params_b * 100) / 100
        : null,
    };
  }).filter((m) => m.params_b > 0);
}

module.exports = { loadModels };
