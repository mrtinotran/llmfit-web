const fs = require("fs");
const path = require("path");

const MOE_MODELS = {
  "mixtral-8x7b":  { active_params_b: 12.9 },
  "mixtral-8x22b": { active_params_b: 39.1 },
  "deepseek-v2":   { active_params_b: 21.0 },
  "deepseek-v3":   { active_params_b: 37.0 },
  "deepseek-r1":   { active_params_b: 37.0 },
  "dbrx":          { active_params_b: 36.0 },
  "grok-1":        { active_params_b: 86.0 },
  "qwen1.5-moe":   { active_params_b: 2.7 },
  "jamba":         { active_params_b: 12.0 },
};

const USE_CASE_PATTERNS = [
  { pattern: /code|coding|coder|starcoder|codellama|wizardcoder/i, use_case: "coding" },
  { pattern: /embed|embedding|bge|nomic-embed|gte-/i,              use_case: "embedding" },
  { pattern: /vision|multimodal|vl|llava|moondream/i,              use_case: "multimodal" },
  { pattern: /reason|reasoning|r1|orca|math/i,                     use_case: "reasoning" },
  { pattern: /chat|conversation|instruct|assistant/i,               use_case: "chat" },
];

function detectUseCase(name, useCaseField) {
  const combined = (name + " " + (useCaseField || "")).toLowerCase();
  for (const { pattern, use_case } of USE_CASE_PATTERNS) {
    if (pattern.test(combined)) return use_case;
  }
  return "general";
}

function detectMoE(name) {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(MOE_MODELS)) {
    if (lower.includes(key)) return { is_moe: true, active_params_b: val.active_params_b };
  }
  if (/\d+x\d+/i.test(name)) return { is_moe: true, active_params_b: null };
  return { is_moe: false, active_params_b: null };
}

function loadModels(jsonPath) {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  return data
    .map((m) => {
      const params_b = m.parameters_raw ? m.parameters_raw / 1e9 : 0;
      if (params_b < 0.01) return null; // skip tiny test models

      const moe = detectMoE(m.name || "");
      const shortName = (m.name || "").split("/").pop();

      return {
        name: shortName,
        provider: m.provider || "Unknown",
        params_b: Math.round(params_b * 100) / 100,
        context: m.context_length || 4096,
        use_case: detectUseCase(m.name || "", m.use_case || ""),
        is_moe: moe.is_moe,
        active_params_b: moe.active_params_b,
        min_ram_gb: m.min_ram_gb || null,
        min_vram_gb: m.min_vram_gb || null,
        architecture: m.architecture || null,
        release_date: m.release_date || null,
        hf_downloads: m.hf_downloads || 0,
      };
    })
    .filter(Boolean);
}

module.exports = { loadModels };