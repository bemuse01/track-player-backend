# FROM ubuntu:20.04

# WORKDIR /app

# RUN apt-get update && apt-get install -y \
#     python3 \
#     python3-pip \
#     nodejs \
#     npm \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# RUN pip3 install --no-cache-dir yt-dlp

# COPY package*.json ./

# RUN npm install

# COPY . .

# CMD ["node", "src/utils/videoProcessor.js"]

FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    iputils-ping \
    iproute2 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* 

WORKDIR /app

RUN pip3 install --no-cache-dir yt-dlp

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/app.js"]