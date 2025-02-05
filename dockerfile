FROM node:18.17.1

WORKDIR /app 

COPY package*.json ./

RUN npm config set timeout 600000

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

