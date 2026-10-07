FROM node:18-slim
WORKDIR /
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]