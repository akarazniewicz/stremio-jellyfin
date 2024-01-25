FROM node:21-slim

ENV JELLYFIN_USER "changeme"
ENV JELLYFIN_PASSWORD "changeme"
ENV SERVER_PORT "changeme"

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
COPY *.js ./

USER node
RUN npm install

EXPOSE $SERVER_PORT
ENTRYPOINT ["nodejs", "server.js"]
