#!/bin/sh

# This deployment script runs on cloudflare pages
#
# Settings:
#
# Build command: .bin/cloudflare-build.sh
# Build output directory: /demo/dist
# Root directory: /
# Environment variables:
# 	NODE_VERSION: 16
#
# Note that cloudflare build uses:
# GNU bash, version 4.3.48(1)-release (x86_64-pc-linux-gnu)

# install rust
which rustup > /dev/null || curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH="$HOME/.cargo/bin:$PATH"

# install wasm pack
which wasm-pack > /dev/null || curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# install yarn
which yarn > /dev/null || npm install --global yarn

# run yarn build in demo folder
cd demo
yarn
yarn build