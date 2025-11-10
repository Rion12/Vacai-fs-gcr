# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

# Install python, py3-venv etc if needed by your scripts
RUN apk add --no-cache python3 py3-pip py3-virtualenv

COPY . .

RUN chmod +x ./scripts/setup-agent.sh || true

RUN chmod +x ./scripts/run-agent.sh || true


RUN npm install

RUN npm run build

# Expose port 8080 for cloud run
EXPOSE 8080

# Start Next.js server on port 8080
ENV PORT 8080
CMD ["npm", "start"]
# CMD ["npm", "run", "prod"]
# CMD ["npm", "run", "dev"]

# CMD sh -c './scripts/run-agent.sh & npm start'