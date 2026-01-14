#!/bin/bash

# HabitFlow Installation Script
# This script installs all dependencies and builds the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║   ██╗  ██╗ █████╗ ██████╗ ██╗████████╗███████╗██╗      ╗  ║"
    echo "║   ██║  ██║██╔══██╗██╔══██╗██║╚══██╔══╝██╔════╝██║      ║  ║"
    echo "║   ███████║███████║██████╔╝██║   ██║   █████╗  ██║      ║  ║"
    echo "║   ██╔══██║██╔══██║██╔══██╗██║   ██║   ██╔══╝  ██║      ║  ║"
    echo "║   ██║  ██║██║  ██║██████╔╝██║   ██║   ██║     ███████╗ ║  ║"
    echo "║   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝   ╚═╝   ╚═╝     ╚══════╝ ║  ║"
    echo "║                     INSTALLER                           ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

print_header

echo ""
print_info "Checking system requirements..."
echo ""

# Check for Node.js
if check_command node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_step "Node.js $(node -v) found"
    else
        print_warning "Node.js version is below 18. Updating recommended."
    fi
else
    print_error "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_step "Node.js installed"
fi

# Check for Rust
if check_command rustc; then
    print_step "Rust $(rustc --version | cut -d' ' -f2) found"
else
    print_error "Rust not found. Installing..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    print_step "Rust installed"
fi

# Check for Tauri dependencies
print_info "Checking Tauri dependencies..."

MISSING_DEPS=""

# Check for required packages (Ubuntu/Debian)
if [ -f /etc/debian_version ]; then
    REQUIRED_PACKAGES="libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev"

    for pkg in $REQUIRED_PACKAGES; do
        if ! dpkg -l | grep -q "^ii  $pkg "; then
            MISSING_DEPS="$MISSING_DEPS $pkg"
        fi
    done

    if [ -n "$MISSING_DEPS" ]; then
        print_warning "Installing missing system dependencies..."
        sudo apt update
        sudo apt install -y $MISSING_DEPS
        print_step "System dependencies installed"
    else
        print_step "All system dependencies found"
    fi
else
    print_warning "Non-Debian system detected. Please ensure Tauri dependencies are installed."
    print_info "See: https://tauri.app/v1/guides/getting-started/prerequisites"
fi

echo ""
print_info "Installing npm dependencies..."
npm install
print_step "npm dependencies installed"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
print_step "Installation complete!"
echo ""
echo -e "  ${BLUE}To start developing:${NC}"
echo "    npm run tauri dev"
echo ""
echo -e "  ${BLUE}To build for production:${NC}"
echo "    npm run tauri build"
echo ""
echo -e "  ${BLUE}Built app location:${NC}"
echo "    src-tauri/target/release/bundle/"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
print_info "Thank you for using HabitFlow!"
echo ""
