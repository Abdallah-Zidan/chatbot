FROM node:16-alpine

RUN  apk add git && npm config set cache /tmp --global

WORKDIR /home/node/app

COPY package.json . 

RUN npm i

COPY . /home/node/app

ENV PORT=3000

EXPOSE ${PORT}

CMD [ "npm" , "start"]