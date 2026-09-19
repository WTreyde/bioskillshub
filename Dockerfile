FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN mkdir -p .local && chown node:node .local
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["npm", "start"]
