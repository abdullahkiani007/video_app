FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy project files
COPY . .


# Build for production with more lenient TypeScript checking
RUN  npm run build

# Install serve to serve the built app
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start server
CMD ["serve", "-s", "dist", "-l", "5173", "--single"]
