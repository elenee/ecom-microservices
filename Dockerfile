FROM node:20-alpine AS builder 

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG SERVICE
RUN echo "Building service: $SERVICE"
RUN mkdir -p apps/$SERVICE/generated/prisma
RUN if [ -f apps/$SERVICE/prisma/schema.prisma ]; then \
      npx prisma generate --schema=apps/$SERVICE/prisma/schema.prisma; \
    fi
RUN npx nest build $SERVICE

FROM node:20-alpine AS production

WORKDIR /app
COPY package*.json ./

RUN npm ci --omit=dev

ARG SERVICE
ENV SERVICE=$SERVICE

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/$SERVICE/generated/prisma ./apps/$SERVICE/generated/prisma

EXPOSE 3000

CMD [ "sh", "-c", "node dist/apps/$SERVICE/main.js" ]