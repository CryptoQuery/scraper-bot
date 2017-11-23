FROM node:latest

# Start
ENV NODE_ENV="production"

WORKDIR ./app
COPY ./ ./

RUN npm install

# Finish
EXPOSE 3000
CMD npm start
