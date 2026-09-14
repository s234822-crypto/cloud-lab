FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install cors express mongoose dotenv
COPY . .
EXPOSE 5000
CMD ["node", "server/server.js"]