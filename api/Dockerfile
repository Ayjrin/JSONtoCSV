FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy server files
COPY server.js ./

# Expose the API port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
