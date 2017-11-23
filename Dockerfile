FROM node:latest

# Start
WORKDIR ./app
COPY ./ ./

RUN npm install

# Finish
CMD npm start
