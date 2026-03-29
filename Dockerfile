FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Install dependencies
RUN cd frontend && npm install

# Copy the rest of the application
COPY frontend/ ./frontend/

# Build the Next.js app
RUN cd frontend && npm run build

# Expose port and start
EXPOSE 3000
WORKDIR /app/frontend
CMD ["npm", "start"]
