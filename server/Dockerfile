FROM node:10
RUN mkdir -p /usr/src/squarrels
WORKDIR /usr/src/squarrels
COPY package.json /usr/src/squarrels/
RUN yarn install
COPY . /usr/src/squarrels
EXPOSE 3000
EXPOSE 3100
CMD ["yarn", "start"]
