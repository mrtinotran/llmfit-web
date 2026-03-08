# Stage 1: Fetch the model database from llmfit
FROM alpine:3.20 AS models
RUN apk add --no-cache git
RUN git clone --depth 1 https://github.com/AlexsJones/llmfit.git /llmfit

# Stage 2: Node.js app
FROM node:20-alpine
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci --production

# Copy model database from llmfit repo
COPY --from=models /llmfit/data/hf_models.json ./data/hf_models.json

# Copy app source
COPY server.js ./
COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "server.js"]
