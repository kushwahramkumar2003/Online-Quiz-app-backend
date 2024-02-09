FROM node:18


COPY package.json package.json
COPY package-lock.json package-lock.json
COPY src src
COPY .gitignore .gitignore
COPY index.js index.js


RUN npm install

ENTRYPOINT [ "node", "index.js" ]