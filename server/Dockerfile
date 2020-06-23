FROM node:10

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

RUN mkdir -p /usr/src/squarrels
WORKDIR /usr/src/squarrels
COPY . /usr/src/squarrels
RUN npm install

EXPOSE 3000
EXPOSE 3100

CMD /wait && npm run start
