# llmfit-web

Web UI wrapper for [llmfit](https://github.com/AlexsJones/llmfit) — a hardware-aware LLM model finder.

Users input their hardware specs (RAM, VRAM, CPU, GPU backend) via an interactive dashboard and get ranked recommendations for which LLM models will run well on their machine.

## Architecture

```
Browser (React SPA)
  ├── Hardware spec sliders + filters
  └── POST /api/score → Node.js Express server
                           ├── Loads hf_models.json (from llmfit repo)
                           └── Scores models using llmfit's formulas
                                └── Returns ranked JSON results
```

The scoring engine reimplements llmfit's documented formulas in JavaScript, enabling **per-request hardware overrides** — something the native `llmfit serve` API doesn't support.

## Local Development

```bash
# You'll need the model database
mkdir -p data
curl -o data/hf_models.json \
  https://raw.githubusercontent.com/AlexsJones/llmfit/main/data/hf_models.json

npm install
node server.js
# Open http://localhost:3000
```

## Deploy to VPS

```bash
ssh -p 2222 deploy@5.78.179.61

# Clone this repo
cd ~/apps
git clone <your-repo-url> llmfit
cd llmfit

# Build and start (first build fetches model DB from GitHub)
docker compose up -d --build --remove-orphans
```

The app will be live at **https://llmfit.dev.tinotran.com**

## API

### `POST /api/score`

Score models against custom hardware specs.

```json
{
  "ram_gb": 32,
  "vram_gb": 12,
  "cpu_cores": 8,
  "backend": "cuda",
  "fit_filter": "all",
  "use_case_filter": "coding",
  "search": "qwen",
  "sort_by": "score",
  "limit": 10
}
```

**Backend options:** `cuda`, `rocm`, `metal`, `sycl`, `cpu_arm`, `cpu_x86`

### `GET /api/models`

List all models in the database (unscored).

### `GET /api/health`

Health check.

## Updating the Model Database

Rebuild the Docker image to pull the latest `hf_models.json` from llmfit's repo:

```bash
cd ~/apps/llmfit
docker compose build --no-cache
docker compose up -d
```
