# squarrels-vue

> Squarrels card game done in Vue.js

# Server (nodemon, express, mongo)

``` bash
$ cd server
$ docker-compose up --build
```

# Client (vue-cli)

``` bash
$ cd client
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
