#!/bin/sh

# this build script is for cloudflare pages
# which doesn't have rust support in its base image
# https://github.com/cloudflare/cloudflare-docs/issues/849

# download rust
yarn installrust
# update path to find rustup
export PATH="$HOME/.cargo/bin:$PATH"
# download wasm-pack
yarn installwasm
# build
yarn build