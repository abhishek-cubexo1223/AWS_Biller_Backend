FROM node:18.17.1

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
