# Stage 1
FROM node:18-alpine As development

USER node

WORKDIR /app

COPY --chown=node:node . .

RUN npm ci

# Stage 2
FROM node:18-alpine As build

USER node

WORKDIR /app

COPY --chown=node:node . .

COPY --chown=node:node --from=development /app/node_modules ./node_modules

RUN npm run build

RUN npm ci --only=production

# Stage 3
FROM node:18-alpine As production

WORKDIR /app

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

CMD [ "node", "dist/main.js" ]
