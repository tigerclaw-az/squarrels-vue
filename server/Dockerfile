FROM node:12

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

COPY package*.json /app/
WORKDIR /app
RUN npm install

COPY .env nodemon.json ./
COPY bin/* bin/
COPY config/ config/
COPY lib/ lib/
COPY models/ models/
COPY routes/ routes/
COPY public/ public/

ENV PORT 3100
EXPOSE 3100

RUN ls -la
CMD /wait && node bin/server.js
