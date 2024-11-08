FROM alpine:3.15

# working directory for the app
WORKDIR /app

# prepare downgrade of privileges
RUN addgroup -S node && adduser -S -G node node
# downgrade global privileges

# copy targeted files
COPY --chown=node:node package*.json /app
COPY --chown=node:node docker-compose.yml /app
COPY --chown=node:node src/ /app/src
COPY --chown=node:node logs.txt /app
RUN mkdir /app/database
RUN chown node:node /app/database
# COPY --chown=node:node database/database.db /app/database/

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

# downgrade privileges
USER node

# launch the API
CMD ["node", "src/index.js"]