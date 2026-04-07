# Use the official Microsoft Playwright image as the base
# This ensures all browser dependencies (Chromium/Webkit) are available for scraping
FROM mcr.microsoft.com/playwright:v1.49.1-noble AS base

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install project dependencies
# Note: npm ci is faster and more reliable in CI/Docker environments
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the Next.js application (optimizes for production)
RUN npm run build

# Expose port 3000 for the Next.js server
EXPOSE 3000

# Metadata/Environment labeling
ENV NODE_ENV=production

# Start the application in production mode
CMD ["npm", "start"]
