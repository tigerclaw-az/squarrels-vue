FROM node:12

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

COPY package.json /app/
COPY package-lock.json /app/
WORKDIR /app
RUN npm install

COPY .env nodemon.json ./
COPY bin/* bin/
COPY config/ config/
COPY lib/ lib/
COPY routes/ routes/
COPY public/ public/

EXPOSE 3100
EXPOSE 5858

RUN ls -la
# CMD /wait && node --inspect=127.0.0.1:4000 bin/server.js
CMD /wait && npm run serve:debug
