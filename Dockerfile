FROM node:latest

# Start
ENV NODE_ENV="production"

WORKDIR ./app
COPY ./ ./

RUN npm install

# Finish
CMD npm start
