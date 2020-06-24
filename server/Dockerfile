FROM node:12

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

# RUN mkdir -p /usr/src/squarrels
COPY package*.json /home/squarrels/
WORKDIR /home/squarrels
RUN npm install

COPY .env app-server.js nodemon.json server.js ./
COPY bin/ bin/
COPY config/ config/
COPY lib/ lib/
COPY models/ models/
COPY routes/ routes/
COPY views/ views/
COPY public/ public/

EXPOSE 3000
EXPOSE 3100

RUN npm list --depth=0
CMD /wait && npm run start
