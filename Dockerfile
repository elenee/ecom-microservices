FROM node:20-alpine as builder 

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG SERVICE
RUN echo "Building service: $SERVICE"
RUN npx nest build $SERVICE

FROM node:20-alpine as production

WORKDIR /app
COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ARG SERVICE

ENV SERVICE=$SERVICE

EXPOSE 3000

CMD [ "sh", "-c", "node dist/apps/$SERVICE/main.js" ]