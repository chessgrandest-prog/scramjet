#!/bin/sh
set -e

# Install Rust
curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install wasm-pack
$HOME/.cargo/bin/cargo install wasm-pack

# Build the WASM rewriter
cd rewriter/wasm

# Explicitly tell wasm-pack where cargo is
CARGO="$HOME/.cargo/bin/cargo" \
$HOME/.cargo/bin/wasm-pack build --target web --out-dir out

cd ../../
