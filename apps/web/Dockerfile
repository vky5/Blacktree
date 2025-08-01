# Dockerfile for frontend (in Next.js & pnpm package manager)
# this is multi stage docker build
# Builder Stage base image (Stage 1)
FROM node:22-alpine AS builder


# Defining the working directory
WORKDIR /app 


# Install pnpm 
RUN npm install -g pnpm

# Copy package.json 
COPY package.json .

# Install packages in the pnpm
RUN pnpm install 

COPY . .
RUN pnpm build


# FInal sgtage (using alpine)
FROM node:22-alpine AS runner

WORKDIR /app 
# when u say workdir we craate a dir app and sets it as the working directory


#Install pnppm globally for runtime image
RUN npm install -g pnpm

# Copy built files and dependencies from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
CMD ["pnpm", "start"]


# What happens during docker build?

# Docker builds Stage 1 (builder) → compiles, bundles, etc.
# Then Docker builds Stage 2 (runner) → copies just the needed files.77
# Docker throws away the builder image after the final image is created.
# But build cache for builder layers is saved — so it can rebuild faster later.

