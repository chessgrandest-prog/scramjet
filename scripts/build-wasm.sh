#!/bin/sh
set -e

# Install Rust
curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install wasm-pack
$HOME/.cargo/bin/cargo install wasm-pack

# Build the WASM rewriter
cd rewriter/wasm
$HOME/.cargo/bin/wasm-pack build --target web --out-dir out
cd ../../
