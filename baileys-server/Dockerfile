FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "index.js"]
