FROM alpine:3.15

# working directory for the app
WORKDIR /app

# copy targeted files
COPY package*.json /app
COPY docker-compose.yml /app
COPY src/ /app

# install required components
RUN apk update
RUN apk add --no-cache nodejs npm python3 make g++

# restrict installation to production only (no devDependencies)
RUN npm install --only=production

# listening port of the app
EXPOSE 4500

# downgrade privileges
RUN addgroup -S node && adduser -S -G node node
USER node

# launch the API
CMD ["node", "/app/src/index.js"]