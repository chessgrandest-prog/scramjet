#!/bin/bash
set -e

# Install Rust
curl https://sh.rustup.rs -sSf | sh -s -- -y
source $HOME/.cargo/env

# Install wasm-pack
cargo install wasm-pack

# Build the WASM rewriter
cd rewriter/wasm
wasm-pack build --target web --out-dir out
cd ../../
