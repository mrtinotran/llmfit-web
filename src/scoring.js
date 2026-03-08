// scoring.js — Implements llmfit's documented scoring formulas in JavaScript
// Reference: https://github.com/AlexsJones/llmfit#how-it-works

const QUANT_HIERARCHY = [
  { name: "Q8_0",   bpp: 8.5, quality: 1.0,  speed: 0.85 },
  { name: "Q6_K",   bpp: 6.5, quality: 0.95, speed: 0.9  },
  { name: "Q5_K_M", bpp: 5.5, quality: 0.9,  speed: 0.93 },
  { name: "Q5_K_S", bpp: 5.3, quality: 0.88, speed: 0.94 },
  { name: "Q4_K_M", bpp: 4.8, quality: 0.85, speed: 0.97 },
  { name: "Q4_K_S", bpp: 4.5, quality: 0.82, speed: 0.98 },
  { name: "Q4_0",   bpp: 4.5, quality: 0.8,  speed: 1.0  },
  { name: "Q3_K_M", bpp: 3.9, quality: 0.7,  speed: 1.02 },
  { name: "Q3_K_S", bpp: 3.5, quality: 0.6,  speed: 1.04 },
  { name: "Q2_K",   bpp: 2.9, quality: 0.5,  speed: 1.08 },
];

const BACKEND_SPEEDS = {
  cuda:    220,
  metal:   160,
  rocm:    180,
  sycl:    100,
  cpu_arm: 90,
  cpu_x86: 70,
};

const USE_CASE_WEIGHTS = {
  general:    { quality: 0.35, speed: 0.25, fit: 0.25, context: 0.15 },
  coding:     { quality: 0.4,  speed: 0.2,  fit: 0.25, context: 0.15 },
  reasoning:  { quality: 0.55, speed: 0.1,  fit: 0.2,  context: 0.15 },
  chat:       { quality: 0.2,  speed: 0.35, fit: 0.3,  context: 0.15 },
  multimodal: { quality: 0.35, speed: 0.2,  fit: 0.25, context: 0.2  },
  embedding:  { quality: 0.3,  speed: 0.3,  fit: 0.3,  context: 0.1  },
};

function scoreModel(model, specs) {
  const { ram_gb, vram_gb, cpu_cores, backend, bandwidth_gb_s, unified_memory } = specs;
  const hasGpu = vram_gb > 0 && backend !== "cpu_x86" && backend !== "cpu_arm";
  const effectiveParams = model.is_moe && model.active_params_b ? model.active_params_b : model.params_b;
  const totalParams = model.params_b;

  let bestQuant = null;
  let modelMemGb = Infinity;
  let fullModelMemGb = 0;
  let runMode = "too_tight";

  for (const q of QUANT_HIERARCHY) {
    const memNeeded = (totalParams * q.bpp) / 8;
    const memWithOverhead = memNeeded * 1.1;
    const moeMemNeeded = model.is_moe && model.active_params_b
      ? (model.active_params_b * q.bpp) / 8 * 1.15
      : memWithOverhead;

    fullModelMemGb = memWithOverhead;

    if (unified_memory) {
      // Apple Silicon: unified memory pool, everything is "gpu" via Metal
      if (moeMemNeeded <= ram_gb) {
        bestQuant = q;
        modelMemGb = model.is_moe ? moeMemNeeded : memWithOverhead;
        runMode = model.is_moe ? "moe" : "gpu";
        break;
      } else if (memWithOverhead <= ram_gb) {
        bestQuant = q;
        modelMemGb = memWithOverhead;
        runMode = "gpu";
        break;
      }
    } else if (hasGpu && moeMemNeeded <= vram_gb) {
      bestQuant = q;
      modelMemGb = model.is_moe ? moeMemNeeded : memWithOverhead;
      runMode = model.is_moe ? "moe" : "gpu";
      break;
    } else if (hasGpu && memWithOverhead <= vram_gb + ram_gb * 0.7) {
      bestQuant = q;
      modelMemGb = memWithOverhead;
      runMode = "cpu+gpu";
      break;
    } else if (memWithOverhead * 1.1 <= ram_gb) {
      bestQuant = q;
      modelMemGb = memWithOverhead * 1.1;
      runMode = "cpu";
      break;
    }
  }

  if (!bestQuant) return null;

  // Quality score (0-100)
  const paramScore = Math.min(100, Math.log2(effectiveParams + 1) * 15);
  const quantPenalty = (1 - bestQuant.quality) * 30;
  const qualityScore = Math.max(0, Math.min(100, paramScore - quantPenalty));

  // Speed score (0-100) — use bandwidth-based estimation when available
  let tokPerSec;
  if (bandwidth_gb_s && modelMemGb > 0) {
    tokPerSec = (bandwidth_gb_s / modelMemGb) * 0.55;
    if (runMode === "cpu+gpu") tokPerSec *= 0.5;
    if (model.is_moe) tokPerSec *= 0.8;
  } else {
    const K = BACKEND_SPEEDS[backend] || 70;
    tokPerSec = (K / effectiveParams) * bestQuant.speed;
    if (runMode === "cpu+gpu") tokPerSec *= 0.5;
    if (runMode === "cpu") tokPerSec *= 0.3;
    if (model.is_moe) tokPerSec *= 0.8;
  }
  const speedScore = Math.min(100, tokPerSec * 2.5);

  // Fit score (0-100)
  const availableMem = unified_memory ? ram_gb : (hasGpu ? vram_gb : ram_gb);
  const utilization = modelMemGb / availableMem;
  let fitScore;
  if (utilization >= 0.5 && utilization <= 0.8) fitScore = 100;
  else if (utilization < 0.5) fitScore = Math.max(40, 100 - (0.5 - utilization) * 150);
  else if (utilization <= 0.95) fitScore = Math.max(30, 100 - (utilization - 0.8) * 300);
  else fitScore = Math.max(10, 100 - (utilization - 0.95) * 800);

  // Context score (0-100)
  const contextScore = Math.min(100, Math.log2(model.context + 1) * 6);

  // Composite
  const weights = USE_CASE_WEIGHTS[model.use_case] || USE_CASE_WEIGHTS.general;
  const composite = Math.round(
    qualityScore * weights.quality +
    speedScore  * weights.speed +
    fitScore    * weights.fit +
    contextScore * weights.context
  );

  // Fit level
  let fitLevel;
  if (runMode === "gpu" && utilization <= 0.8) fitLevel = "perfect";
  else if ((runMode === "gpu" || runMode === "moe") && utilization <= 0.95) fitLevel = "good";
  else if (runMode === "cpu") fitLevel = "marginal";
  else fitLevel = utilization > 0.95 ? "marginal" : "good";

  // MoE details
  let moe_details = null;
  if (model.is_moe && model.active_params_b) {
    const activeVram = (model.active_params_b * bestQuant.bpp) / 8;
    moe_details = {
      active_params_b: model.active_params_b,
      total_params_b: model.params_b,
      active_vram_gb: Math.round(activeVram * 10) / 10,
      full_vram_gb: Math.round(fullModelMemGb * 10) / 10,
      strategy: modelMemGb <= availableMem * 0.8
        ? "All experts loaded in VRAM (optimal)"
        : "Experts partially offloaded",
    };
  }

  // Runtime label
  const RUNTIME_LABELS = {
    metal: "MLX",
    cuda: "llama.cpp (CUDA)",
    rocm: "llama.cpp (ROCm)",
    sycl: "llama.cpp (SYCL)",
    cpu_arm: "llama.cpp (CPU ARM)",
    cpu_x86: "llama.cpp (CPU x86)",
  };

  return {
    name: model.name,
    provider: model.provider,
    params_b: model.params_b,
    context: model.context,
    use_case: model.use_case,
    is_moe: model.is_moe || false,
    active_params_b: model.active_params_b || null,
    quant: bestQuant.name,
    run_mode: runMode,
    mem_gb: Math.round(modelMemGb * 100) / 100,
    mem_pct: Math.round(utilization * 100),
    tok_per_sec: Math.round(tokPerSec * 10) / 10,
    score: composite,
    fit_level: fitLevel,
    scores: {
      quality: Math.round(qualityScore),
      speed:   Math.round(speedScore),
      fit:     Math.round(fitScore),
      context: Math.round(contextScore),
    },
    // Extended fields
    architecture: model.architecture || null,
    release_date: model.release_date || null,
    hf_downloads: model.hf_downloads || 0,
    runtime: RUNTIME_LABELS[backend] || backend,
    available_mem_gb: availableMem,
    full_model_mem_gb: Math.round(fullModelMemGb * 10) / 10,
    rec_ram_gb: Math.round(modelMemGb * 1.3 * 10) / 10,
    unified_memory: !!unified_memory,
    moe_details,
  };
}

function scoreAllModels(models, specs, options = {}) {
  const { fit_filter, use_case_filter, search, sort_by = "score", limit } = options;

  let results = models.map((m) => scoreModel(m, specs)).filter(Boolean);

  if (fit_filter && fit_filter !== "all")
    results = results.filter((m) => m.fit_level === fit_filter);
  if (use_case_filter && use_case_filter !== "all")
    results = results.filter((m) => m.use_case === use_case_filter);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.use_case.includes(q)
    );
  }

  results.sort((a, b) => {
    if (sort_by === "score")  return b.score - a.score;
    if (sort_by === "params") return b.params_b - a.params_b;
    if (sort_by === "speed")  return b.tok_per_sec - a.tok_per_sec;
    if (sort_by === "mem")    return a.mem_gb - b.mem_gb;
    return b.score - a.score;
  });

  if (limit) results = results.slice(0, limit);

  return results;
}

module.exports = { scoreModel, scoreAllModels, BACKEND_SPEEDS, USE_CASE_WEIGHTS };
