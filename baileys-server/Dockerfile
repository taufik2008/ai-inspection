FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Persistent session directory
VOLUME ["/app/auth_info_baileys"]

EXPOSE 4000

ENV NODE_ENV=production

CMD ["npm", "start"]
