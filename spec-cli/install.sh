#!/bin/bash
set -e

REPO="ThilinaTLM/claude-plugins"
INSTALL_DIR="${HOME}/.local/bin"
BINARY_NAME="spec"

# Detect OS (including Git Bash/MSYS/Cygwin on Windows)
OS_RAW=$(uname -s)
case "$OS_RAW" in
  Linux*)   OS="linux" ;;
  Darwin*)  OS="darwin" ;;
  MINGW*|MSYS*|CYGWIN*)
    OS="windows"
    BINARY_NAME="spec.exe"
    ;;
  *)
    echo "Error: Unsupported operating system: $OS_RAW"
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

# Windows assets have .exe suffix
if [ "$OS" = "windows" ]; then
  ASSET_NAME="spec-${OS}-${ARCH}.exe"
else
  ASSET_NAME="spec-${OS}-${ARCH}"
fi

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
  if [ "$OS" = "windows" ]; then
    echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bash_profile"
    echo "  source ~/.bash_profile"
  else
    echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
    echo "  source ~/.bashrc"
  fi
fi

echo ""
echo "Run 'spec --help' to get started."
