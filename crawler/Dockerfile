FROM node:14-alpine as development_build

# Get the necessary build tools
RUN apk add yarn build-base autoconf automake libtool pkgconfig nasm g++ make libpng-dev zlib-dev

RUN apk add chromium
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Copying source files
COPY . /usr/src/app

# build files to serve in production
FROM development_build as production_build

# Building app
RUN yarn build
