# Use a multi-stage build to support both development and production workflows
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source
COPY . .

# -------- Development image --------
FROM base AS dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -------- Production build --------
FROM base AS build
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy only what we need for production runtime
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
