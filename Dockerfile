# Build Stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package configurations
COPY package.json pnpm-lock.yaml nest-cli.json tsconfig.json tsconfig.build.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy library and application source files
COPY libs/ ./libs/
COPY apps/ ./apps/

# Accept the service name as a build argument
ARG SERVICE
ENV SERVICE=${SERVICE}

# Build the specified service
RUN pnpm run build ${SERVICE}

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package configurations and install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Accept the service name as a build argument
ARG SERVICE
ENV SERVICE=${SERVICE}

# Copy built artifacts from builder stage
COPY --from=builder /usr/src/app/dist/apps/${SERVICE} ./dist/apps/${SERVICE}

# Expose port (will be overridden by docker-compose)
EXPOSE 3000

# Start the application
CMD node dist/apps/${SERVICE}/main.js
