
FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p /app/storage/documents \
    && chown -R node:node /app

USER node

EXPOSE 4000

CMD ["npm", "start"]
