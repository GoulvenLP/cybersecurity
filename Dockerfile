FROM alpine:3.15

# working directory for the app
WORKDIR /app

# copy targeted files
COPY package*.json /app
COPY docker-compose.yml /app
COPY src/ /app/src
COPY logs.txt /app
COPY database/database.db /app/database

# install required components
RUN apk update
RUN apk add --no-cache nodejs
RUN apk add --no-cache npm 
RUN apk add --no-cache python3
RUN apk add --no-cache make g++

# restrict installation to production only (no devDependencies)
RUN npm install --only=production

# listening port of the app
EXPOSE 4500

# change rights for writable files: writable for group
RUN chmod 775 /app/logs.txt
RUN chmod -R 775 /app/database

# prepare downgrade of privileges
RUN addgroup -S node && adduser -S -G node node

# change the file owner so that node group can have extra privileges
RUN chown -R node:node /app/database

# downgrade global privileges
USER node


# launch the API
CMD ["node", "src/index.js"]