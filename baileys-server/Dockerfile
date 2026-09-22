FROM node:20-alpine

WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache git

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Persistent session directory
VOLUME ["/app/auth_info_baileys"]

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

CMD ["npm", "start"]
