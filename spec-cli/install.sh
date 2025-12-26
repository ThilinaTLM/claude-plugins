#!/bin/bash
set -e

REPO="tlmtech/claude-plugins"
INSTALL_DIR="${HOME}/.local/bin"
BINARY_NAME="spec"

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$OS" in
  linux)  OS="linux" ;;
  darwin) OS="darwin" ;;
  *)
    echo "Error: Unsupported operating system: $OS"
    exit 1
    ;;
esac

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  ARCH="x64" ;;
  aarch64) ARCH="arm64" ;;
  arm64)   ARCH="arm64" ;;
  *)
    echo "Error: Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

ASSET_NAME="spec-${OS}-${ARCH}"

echo "Detected: ${OS}-${ARCH}"
echo "Installing spec CLI..."

# Get latest release URL
RELEASE_URL=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep "browser_download_url.*${ASSET_NAME}\"" | cut -d '"' -f 4)

if [ -z "$RELEASE_URL" ]; then
  echo "Error: Could not find release asset for ${ASSET_NAME}"
  echo "Available assets:"
  curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep "browser_download_url" | cut -d '"' -f 4
  exit 1
fi

# Create install directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Download binary
echo "Downloading from: ${RELEASE_URL}"
curl -fsSL "$RELEASE_URL" -o "${INSTALL_DIR}/${BINARY_NAME}"

# Make executable
chmod +x "${INSTALL_DIR}/${BINARY_NAME}"

echo ""
echo "Installed: ${INSTALL_DIR}/${BINARY_NAME}"

# Check if install directory is in PATH
if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
  echo ""
  echo "Note: ${INSTALL_DIR} is not in your PATH."
  echo "Add it by running:"
  echo ""
  echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
  echo "  source ~/.bashrc"
fi

echo ""
echo "Run 'spec --help' to get started."
