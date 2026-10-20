#!/usr/bin/env bash
# ==============================================================================
# RoboVault - Automated Cloud Deployment Script (Ubuntu / AWS EC2)
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "    Starting RoboVault Production Deployment on Ubuntu    "
echo "=========================================================="

# 1. Update OS packages
echo "[1/5] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Docker and Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "[2/5] Installing Docker Engine..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    echo "[✓] Docker installed successfully."
else
    echo "[2/5] Docker is already installed."
fi

# 3. Pull or configure RoboVault repo
echo "[3/5] Setting up RoboVault repository..."
REPO_DIR="$HOME/RoboVault"
if [ ! -d "$REPO_DIR" ]; then
    git clone https://github.com/sabarivasan2308/RoboVault.git "$REPO_DIR"
fi

cd "$REPO_DIR"
git pull origin main

# 4. Prepare production environment file
echo "[4/5] Preparing environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

# 5. Build and launch containers
echo "[5/5] Building and starting RoboVault containers..."
sudo docker compose down || true
sudo docker compose build --no-cache
sudo docker compose up -d

echo ""
echo "=========================================================="
echo " [✓] RoboVault is successfully deployed and running!      "
echo "=========================================================="
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo " Web Application: http://$SERVER_IP:3000"
echo " REST API Docs:   http://$SERVER_IP:8080/api/dashboard/summary"
echo " MongoDB Port:    $SERVER_IP:27017"
echo "=========================================================="

