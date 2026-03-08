const express = require("express");
const path = require("path");
const { loadModels } = require("./src/models");
const { scoreAllModels } = require("./src/scoring");

const app = express();
const PORT = process.env.PORT || 3000;

// Load model database
const MODELS_PATH = process.env.MODELS_JSON || path.join(__dirname, "data", "hf_models.json");
let models = [];
try {
  models = loadModels(MODELS_PATH);
  console.log(`Loaded ${models.length} models from ${MODELS_PATH}`);
} catch (err) {
  console.error(`Failed to load models from ${MODELS_PATH}: ${err.message}`);
  console.log("Starting with empty model database. Place hf_models.json in ./data/");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- API Routes ---

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", models_loaded: models.length });
});

// List all models (unscored)
app.get("/api/models", (_req, res) => {
  res.json({
    count: models.length,
    providers: [...new Set(models.map((m) => m.provider))].sort(),
    use_cases: [...new Set(models.map((m) => m.use_case))].sort(),
    models: models.map((m) => ({
      name: m.name,
      provider: m.provider,
      params_b: m.params_b,
      context: m.context,
      use_case: m.use_case,
      is_moe: m.is_moe,
    })),
  });
});

// Score models against user-specified hardware
app.post("/api/score", (req, res) => {
  const {
    ram_gb = 16,
    vram_gb = 0,
    cpu_cores = 4,
    backend = "cpu_x86",
    bandwidth_gb_s,
    unified_memory = false,
    fit_filter,
    use_case_filter,
    search,
    sort_by = "score",
    limit,
  } = req.body;

  // Validate
  if (ram_gb < 1 || ram_gb > 2048) return res.status(400).json({ error: "ram_gb must be 1-2048" });
  if (vram_gb < 0 || vram_gb > 512) return res.status(400).json({ error: "vram_gb must be 0-512" });

  const specs = { ram_gb, vram_gb, cpu_cores, backend, bandwidth_gb_s, unified_memory };
  const results = scoreAllModels(models, specs, { fit_filter, use_case_filter, search, sort_by, limit });

  res.json({
    specs,
    total_models: models.length,
    matched: results.length,
    results,
  });
});

// Catch-all: serve index.html for SPA routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`llmfit-web listening on http://0.0.0.0:${PORT}`);
  console.log(`Models loaded: ${models.length}`);
});
