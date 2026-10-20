# RoboVault Production Deployment Guide (Ubuntu & AWS EC2)

This guide covers provisioning, containerizing, securing, and deploying RoboVault onto an Ubuntu 22.04 LTS instance or AWS EC2 VM (e.g., `t3.medium`).

---

## 1. Cloud Instance Prerequisites

- **OS**: Ubuntu 22.04 LTS (x86_64)
- **Minimum Specs**: 2 vCPUs, 4GB RAM, 20GB SSD
- **Security Group / Firewall Ports**:
  - `22` (SSH)
  - `80` (HTTP)
  - `443` (HTTPS)

---

## 2. Server Provisioning

Execute the following commands to install Docker Engine, Docker Compose plugin, and Git:

```bash
# Update package repositories
sudo apt-get update && sudo apt-get upgrade -y

# Install prerequisite utilities
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# Install Docker GPG key & repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker and Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable Docker service and add user to docker group
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```
*(Log out and log back in for docker group permissions to take effect)*

---

## 3. Clone Repository & Environment Setup

```bash
# Clone the repository
git clone https://github.com/sabarivasan2308/RoboVault.git /opt/robovault
cd /opt/robovault

# Copy production environment configuration
cp .env.example .env
```

Edit `/opt/robovault/.env` with your secure production values:
```ini
NODE_ENV=production
SPRING_PROFILES_ACTIVE=prod

# Strong 256-bit+ HMAC Secret
JWT_SECRET=super_secret_production_key_minimum_32_characters_long_abc123!
JWT_EXPIRATION_MS=86400000

# MongoDB Configuration
MONGO_DATABASE=robovault
MONGO_PORT=27017

# Initial Administrator Credentials
ADMIN_DEFAULT_PASSWORD=StrongAdminPassword2026!
ADMIN_EMAIL=admin@robovault.io

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=https://robovault.yourdomain.com
```

---

## 4. Launching the Multi-Container Cluster

Build the multi-stage images and start all services in detached mode:

```bash
# Build and run containers
docker compose up -d --build
```

Check running services:
```bash
docker compose ps
docker compose logs -f backend
```

---

## 5. Automated Systemd Service

Create a systemd unit to ensure RoboVault automatically restarts upon VM reboot:

```bash
sudo tee /etc/systemd/system/robovault.service > /dev/null << 'EOF'
[Unit]
Description=RoboVault Docker Compose Application
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/robovault
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable robovault.service
```

---

## 6. SSL / TLS Configuration with Certbot

To enable HTTPS with Let's Encrypt:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d robovault.yourdomain.com
```

Update your Nginx configuration in `frontend/nginx.conf` or an outer host Nginx reverse proxy to forward traffic to `127.0.0.1:80`.

---

## 7. MongoDB Volume Backup & Restore

### Backup
```bash
docker compose exec mongodb mongodump --db robovault --out /data/db/backup_$(date +%F)
```

### Restore
```bash
docker compose exec mongodb mongorestore --db robovault /data/db/backup_2026-10-20/robovault
```
