#!/usr/bin/env sh
# Run any node/pnpm command inside a throwaway container with shared caches.
#
#   scripts/node.sh pnpm install --frozen-lockfile
#   scripts/node.sh pnpm lint
#   CATTR_UI_DOCKER_ARGS="-p 7200:7200" scripts/node.sh pnpm dev
#
# The container is removed on exit (--rm). Caches survive in $CATTR_UI_NODE_CACHE
# (default ~/.cache/cattr-ui-node): corepack shims + pnpm binary, pnpm content store
# (downloaded packages, shared by all worktrees; node_modules are hard-linked from it),
# pnpm metadata cache,
# npm cache. Runs as the current host user so files it writes (node_modules, dist)
# are owned by you, not root. Works from any git worktree: the worktree root is
# mounted at /work.
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
CACHE=${CATTR_UI_NODE_CACHE:-$HOME/.cache/cattr-ui-node}
IMAGE=${CATTR_UI_NODE_IMAGE:-node:24-slim}
NAME=cattr-ui-node-$$

mkdir -p "$CACHE/home/bin" "$CACHE/corepack" "$CACHE/pnpm-store" "$CACHE/pnpm-cache" "$CACHE/pnpm-state" "$CACHE/npm"

TTY=""
if [ -t 0 ] && [ -t 1 ]; then TTY="-t"; fi

# shellcheck disable=SC2086
exec docker run --rm -i $TTY --name "$NAME" \
  --user "$(id -u):$(id -g)" \
  -v "$ROOT:/work" -w /work \
  -v "$CACHE:/cache" \
  -e HOME=/cache/home \
  -e PATH="/cache/home/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
  -e COREPACK_HOME=/cache/corepack \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e COREPACK_ENABLE_STRICT=0 \
  -e pnpm_config_store_dir=/cache/pnpm-store \
  -e pnpm_config_cache_dir=/cache/pnpm-cache \
  -e pnpm_config_state_dir=/cache/pnpm-state \
  -e npm_config_cache=/cache/npm \
  -e CI=1 \
  ${CATTR_UI_DOCKER_ARGS:-} \
  "$IMAGE" sh -c '
    if [ ! -x /cache/home/bin/pnpm ]; then
      if command -v corepack >/dev/null 2>&1; then
        corepack enable --install-directory /cache/home/bin
      else
        npm install -g --prefix /cache/home corepack >/dev/null 2>&1
        /cache/home/bin/corepack enable --install-directory /cache/home/bin
      fi
    fi
    exec "$@"' sh "$@"
