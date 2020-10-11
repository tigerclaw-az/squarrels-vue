# squarrels-vue

> Squarrels card game done in Vue.js

# Setup

1. Add entry to your `/etc/hosts` file with: `squarrels 127.0.0.1`
1. Clone the repo
2. Start the server, must have `docker-compose` installed to run
3. Start the client
4. Open 2 different browser instances and navigate to `http://squarrels:8181`
5. Enter a different name for each player
6. Create games and join them with each player

## Server (nodemon, express, mongo)

``` bash
$ cd server
$ npm run start
```

## Client (vue-cli)

``` bash
$ cd client
$ npm install
$ npm run serve
```

## audiosprite

```
> brew install ffmpeg
> npm install -g audiosprite
> cd src/assets/sounds
> audiosprite --path /sounds/ --output audiosprite -f howler ../../../public/sounds/*.mp3
```

Copy audiosprite.* files into /public folder
