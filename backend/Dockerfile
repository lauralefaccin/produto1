FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/ .
COPY api.yaml ./api.yaml

EXPOSE 5000

CMD ["npm", "start"]