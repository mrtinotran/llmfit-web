# llmfit-web

Web UI for [llmfit](https://github.com/AlexsJones/llmfit) — a hardware-aware LLM model finder. Select your exact hardware configuration and get ranked recommendations for which LLM models will run well on your machine, with side-by-side comparisons against hosted cloud APIs.

**Live:** [https://llmfit.dev.tinotran.com](https://llmfit.dev.tinotran.com)

## What It Does

- **Local model scoring** — Scores 150+ open-weight LLMs against your specific hardware using bandwidth-based speed estimation, quantization-aware memory fitting, and multi-dimensional quality/speed/fit/context scoring
- **Hardware presets** — Every Apple Silicon chip (M1 through M4 Max) with real memory configs and bandwidth, specific x86 CPUs (Intel/AMD), and discrete GPUs (RTX 3060 through H100)
- **Hosted API comparison** — 25 cloud models (OpenAI, Anthropic, Google, Meta, xAI, Mistral, DeepSeek, Qwen) with pricing, throughput, benchmarks (MMLU-Pro, HumanEval, SWE-bench, Arena ELO)
- **Side-by-side compare** — Pick any local model and compare it head-to-head against any hosted API across quality, speed, cost, privacy, context, and latency
- **Cost calculator** — Input your usage profile (prompts/day, token sizes) to see monthly cost for every hosted model vs $0 for local

## Architecture

```
Browser (React SPA via CDN)
  ├── Hardware preset selector (Apple Silicon / x86+GPU)
  ├── Local Models tab ──→ POST /api/score ──→ Express server
  │                                              ├── hf_models.json (from llmfit repo)
  │                                              └── Scoring engine (bandwidth-aware)
  ├── Hosted APIs tab ──→ GET /api/hosted ───→ Static hosted model data + benchmarks
  │                    └─→ POST /api/hosted/calculate ──→ Cost projections
  └── Compare tab ──→ Side-by-side local vs hosted
```

### Scoring Engine

Reimplements llmfit's documented formulas in JavaScript with enhancements:

- **Bandwidth-based speed estimation** — Uses real memory bandwidth for each hardware profile (`bandwidth_GB_s / model_size_GB * 0.55`) instead of flat constants
- **Unified memory support** — Apple Silicon treats the entire memory pool as GPU-accessible via Metal
- **Dynamic quantization** — Walks Q8_0 down to Q2_K, picking the highest quality quant that fits
- **MoE-aware** — Calculates active expert VRAM separately from total parameters
- **Composite scoring** — Four dimensions (Quality, Speed, Fit, Context) weighted by use case (coding weights quality at 0.4, chat weights speed at 0.35, etc.)

### Tech Stack

- **Backend:** Node.js + Express (single dependency)
- **Frontend:** React 18 via CDN, Babel standalone for JSX — no build step
- **Model data:** JSON database from upstream llmfit, embedded at Docker build time
- **Deployment:** Docker + Traefik reverse proxy + Let's Encrypt TLS
- **CI/CD:** GitHub Actions — deploy on push to main + weekly scheduled rebuild

## Project Structure

```
├── server.js              Express API server (6 routes)
├── src/
│   ├── models.js          Model database loader + MoE/use-case detection
│   ├── scoring.js         Scoring engine (bandwidth-aware, unified memory)
│   └── hosted.js          25 hosted model profiles + benchmarks + cost calculator
├── public/
│   └── index.html         Full React SPA (inline JSX, dark theme)
├── Dockerfile             Multi-stage: clone llmfit for model DB, then Node app
├── docker-compose.yml     Traefik integration, auto-restart
└── .github/workflows/
    └── deploy.yml         Deploy on push + weekly cron (Mon 6AM UTC)
```

## API

### `POST /api/score`

Score local models against hardware specs.

```json
{
  "ram_gb": 128,
  "vram_gb": 128,
  "cpu_cores": 16,
  "backend": "metal",
  "bandwidth_gb_s": 546,
  "unified_memory": true,
  "fit_filter": "all",
  "use_case_filter": "coding",
  "search": "qwen",
  "sort_by": "score"
}
```

Returns scored results with quantization, run mode, memory usage, tok/s estimate, fit level, component scores (Q/S/F/C), MoE details, and memory breakdown.

**Backends:** `cuda`, `rocm`, `metal`, `sycl`, `cpu_arm`, `cpu_x86`

### `GET /api/hosted`

Returns all 25 hosted model profiles with pricing, benchmarks, throughput, and context window.

### `POST /api/hosted/calculate`

Cost projection for hosted models given a usage profile.

```json
{
  "prompts_per_day": 100,
  "avg_input_tokens": 500,
  "avg_output_tokens": 1000
}
```

### `GET /api/models`

List all local models in the database (unscored).

### `GET /api/health`

Health check — returns model count.

## Hardware Presets

### Apple Silicon (unified memory, Metal/MLX)

| Chip | Memory Options | Bandwidth |
|------|---------------|-----------|
| M1 | 8, 16 GB | 68 GB/s |
| M1 Pro | 16, 32 GB | 200 GB/s |
| M1 Max | 32, 64 GB | 400 GB/s |
| M1 Ultra | 64, 128 GB | 800 GB/s |
| M2 | 8, 16, 24 GB | 100 GB/s |
| M2 Pro | 16, 32 GB | 200 GB/s |
| M2 Max | 32, 64, 96 GB | 400 GB/s |
| M2 Ultra | 64, 128, 192 GB | 800 GB/s |
| M3 | 8, 16, 24 GB | 100 GB/s |
| M3 Pro | 18, 36 GB | 150 GB/s |
| M3 Max | 36, 48, 64, 96, 128 GB | 400 GB/s |
| M4 | 16, 24, 32 GB | 120 GB/s |
| M4 Pro | 24, 48 GB | 273 GB/s |
| M4 Max | 36, 48, 64, 128 GB | 546 GB/s |

### GPUs (CUDA)

RTX 3060–3090 Ti, RTX 4060–4090, RTX 5070 Ti–5090, A100 (40/80GB), H100 80GB

### x86 CPUs

Intel i5-13600K through i9-14900K, AMD Ryzen 7 7800X3D through Threadripper 7980X

## Hosted Models (25)

| Provider | Models | Benchmarks |
|----------|--------|------------|
| OpenAI | GPT-4.1, 4.1 Mini, 4.1 Nano, GPT-4o, 4o Mini, o3, o4-mini | MMLU-Pro, HumanEval, SWE-bench, Arena ELO |
| Anthropic | Opus 4.6, Sonnet 4.6, Sonnet 4.5, Sonnet 4, Opus 4, Haiku 4.5 | All four benchmarks |
| Google | Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash | All four benchmarks |
| Meta | Llama 4 Maverick, Llama 4 Scout | All four benchmarks |
| xAI | Grok 3, Grok 3 Mini | All four benchmarks |
| Mistral | Mistral Large, Mistral Small | All four benchmarks |
| DeepSeek | DeepSeek V3, DeepSeek R1 | All four benchmarks |
| Alibaba | Qwen 2.5 72B | All four benchmarks |

## Local Development

```bash
mkdir -p data
curl -sL https://raw.githubusercontent.com/AlexsJones/llmfit/main/data/hf_models.json \
  -o data/hf_models.json

npm install
node server.js
# Open http://localhost:3000
```

## Deployment

Deployed to VPS via Docker with Traefik reverse proxy:

```bash
ssh -p 2222 deploy@<VPS_HOST>
cd ~/apps/llmfit
git pull origin main
docker compose up -d --build --remove-orphans
```

Live at **https://llmfit.dev.tinotran.com**

### Automatic Updates

The GitHub Actions workflow rebuilds every Monday at 6 AM UTC, pulling the latest model database from upstream llmfit. Manual deploys happen on every push to `main` or via workflow dispatch.

## Relationship to Upstream llmfit

This project is a **JavaScript web port** of [AlexsJones/llmfit](https://github.com/AlexsJones/llmfit)'s scoring engine. The upstream is a Rust CLI/TUI tool with auto hardware detection and provider integrations (Ollama, llama.cpp, MLX). This project trades those native features for:

- Browser-based UI accessible from any device
- Hardware preset selection instead of auto-detection
- Hosted API comparison and cost analysis
- No installation required
