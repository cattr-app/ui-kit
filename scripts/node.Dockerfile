# Runner image for scripts/node.sh: node + everything pnpm lifecycle scripts
# commonly need (archive tools for prebuilt binaries, toolchain for node-gyp, git for
# git dependencies). pnpm itself is NOT baked in: scripts/node.sh installs it through
# corepack into the shared cache, so bumping packageManager needs no image rebuild.
ARG NODE_IMAGE=node:24-slim
FROM ${NODE_IMAGE}

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates curl wget git openssh-client \
      bzip2 xz-utils unzip zip tar gzip \
      python3 make g++ pkg-config \
      procps \
 && rm -rf /var/lib/apt/lists/*
