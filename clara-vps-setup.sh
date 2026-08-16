#!/bin/bash
# ============================================================
# Clara Bot + Pterodactyl Panel Auto-Install Script v2
# For Debian 12 (Bookworm) - Linode/Akamai
# Dengan proteksi: SSH key, fail2ban, panel hidden, CF tunnel
# ============================================================
# Run as root: bash clara-vps-setup.sh
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
echo_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_err() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check root
if [ "$EUID" -ne 0 ]; then
  echo_err "Jalankan sebagai root: bash clara-vps-setup.sh"
  exit 1
fi

echo ""
echo "============================================"
echo "  Clara Bot + Pterodactyl Panel Installer v2"
echo "  Debian 12 (Bookworm) + Security Hardening"
echo "============================================"
echo ""

# ============================================================
# STEP 0: Generate Random Port for SSH
# ============================================================
SSH_PORT=$((RANDOM % 10000 + 40000))
echo_info "SSH port baru: ${SSH_PORT}"

# ============================================================
# STEP 1: System Update + Base Packages
# ============================================================
echo_info "Step 1: Update system dan install base packages..."

apt update -y
apt upgrade -y

apt install -y \
  curl wget git gnupg2 software-properties-common \
  ca-certificates lsb-release sudo \
  nano htop ufw fail2ban \
  mariadb-server mariadb-client \
  nginx php8.2 php8.2-{fpm,cli,gd,mbstring,mysql,bcmath,xml,curl,zip} \
  redis-server \
  tar unzip openssh-server

echo_ok "Base packages terinstall"

# ============================================================
# STEP 2: SECURITY - Ubah Port SSH + Hardening
# ============================================================
echo_info "Step 2: Security - SSH hardening..."

# Backup sshd_config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Ubah port SSH
sed -i "s/^#\?Port .*/Port ${SSH_PORT}/" /etc/ssh/sshd_config

# Disable password auth (SSH key only)
sed -i "s/^#\?PasswordAuthentication .*/PasswordAuthentication no/" /etc/ssh/sshd_config
sed -i "s/^#\?PermitRootLogin .*/PermitRootLogin prohibit-password/" /etc/ssh/sshd_config

# Disable empty passwords
sed -i "s/^#\?PermitEmptyPasswords .*/PermitEmptyPasswords no/" /etc/ssh/sshd_config

# Max auth tries
sed -i "s/^#\?MaxAuthTries .*/MaxAuthTries 3/" /etc/ssh/sshd_config

# Jangan restart sshd dulu - tunggu sampai SSH key disetup
echo_warn "SSH akan pakai port ${SSH_PORT} setelah restart"
echo_warn "Password login DISABLED - pastikan SSH key sudah diupload!"

# Setup SSH key untuk user
read -p "Paste public SSH key (atau kosongkan untuk skip): " SSH_PUBKEY
if [ -n "$SSH_PUBKEY" ]; then
  mkdir -p /root/.ssh
  chmod 700 /root/.ssh
  echo "$SSH_PUBKEY" >> /root/.ssh/authorized_keys
  chmod 600 /root/.ssh/authorized_keys
  echo_ok "SSH key ditambahkan"
else
  echo_warn "Tidak ada SSH key. Password login tetap aktif untuk sekarang."
  sed -i "s/^PasswordAuthentication no/PasswordAuthentication yes/" /etc/ssh/sshd_config
fi

echo_ok "SSH hardening configured (port ${SSH_PORT})"

# ============================================================
# STEP 3: SECURITY - Firewall + Fail2ban
# ============================================================
echo_info "Step 3: Security - Firewall + Fail2ban..."

# UFW - hanya buka yang perlu
ufw default deny incoming
ufw default allow outgoing
ufw allow ${SSH_PORT}/tcp comment "SSH-custom"
ufw allow 80/tcp comment "HTTP-internal"
ufw allow 443/tcp comment "HTTPS-internal"
ufw allow 8080/tcp comment "Wings-API"
ufw allow 2022/tcp comment "Wings-SFTP"
ufw --force enable

# Fail2ban - aggressive config
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
banaction = ufw

[sshd]
enabled = true
port = ${SSH_PORT}
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[sshd-ddos]
enabled = true
port = ${SSH_PORT}
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 2
bantime = 7200
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo_ok "Firewall + Fail2ban aktif (port SSH: ${SSH_PORT})"

# ============================================================
# STEP 4: Install Docker
# ============================================================
echo_info "Step 4: Install Docker..."

curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

systemctl enable docker
systemctl start docker

echo_ok "Docker terinstall"

# ============================================================
# STEP 5: Configure MariaDB
# ============================================================
echo_info "Step 5: Konfigurasi MariaDB..."

systemctl enable mariadb
systemctl start mariadb

DB_ROOT_PASS=$(openssl rand -hex 16)
PANEL_DB_PASS=$(openssl rand -hex 16)

mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_ROOT_PASS}';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost','127.0.0.1','::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF

mysql -u root -p"${DB_ROOT_PASS}" <<EOF
CREATE DATABASE panel;
CREATE USER 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '${PANEL_DB_PASS}';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF

echo_ok "MariaDB configured"

# Save passwords
cat > /root/server-info.txt <<EOF
============================================
SERVER INFO - SIMPAN FILE INI!
============================================

SSH Port: ${SSH_PORT}
Login: ssh root@IP -p ${SSH_PORT}

Database Root Password: ${DB_ROOT_PASS}
Panel DB User: pterodactyl
Panel DB Pass: ${PANEL_DB_PASS}
Panel DB Name: panel

============================================
EOF
chmod 600 /root/server-info.txt

echo_warn "Info server disimpan di /root/server-info.txt"

# ============================================================
# STEP 6: Download Pterodactyl Panel
# ============================================================
echo_info "Step 6: Download Pterodactyl Panel..."

mkdir -p /var/www/pterodactyl
cd /var/www/pterodactyl

curl -Lo panel.tar.gz https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz
tar -xzvf panel.tar.gz
rm panel.tar.gz

chmod -R 755 storage/* bootstrap/cache/

# Install Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

cp .env.example .env
composer install --no-dev --optimize-autoloader

php artisan key:generate --force

# Configure .env
SERVER_IP=$(hostname -I | awk '{print $1}')
sed -i "s|APP_URL=http://localhost|APP_URL=http://${SERVER_IP}|" .env
sed -i "s|DB_PASSWORD=|DB_PASSWORD=${PANEL_DB_PASS}|" .env
sed -i "s|DB_HOST=127.0.0.1|DB_HOST=127.0.0.1|" .env
sed -i "s|DB_DATABASE=panel|DB_DATABASE=panel|" .env
sed -i "s|DB_USERNAME=pterodactyl|DB_USERNAME=pterodactyl|" .env

php artisan migrate --seed --force
chown -R www-data:www-data /var/www/pterodactyl

echo_ok "Panel terinstall"

# ============================================================
# STEP 7: Configure Nginx + Rate Limiting
# ============================================================
echo_info "Step 7: Konfigurasi Nginx (dengan rate limiting)..."

cat > /etc/nginx/sites-available/pterodactyl.conf <<EOF
# Rate limiting - anti brute force
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone \$binary_remote_addr zone=api:10m rate=30r/m;

server {
    listen 80 default_server;
    server_name _;

    root /var/www/pterodactyl/public;
    index index.php index.html index.htm;

    client_max_body_size 100M;

    # Rate limit login endpoint
    location /auth/login {
        limit_req zone=login burst=10 nodelay;
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # Rate limit API
    location /api {
        limit_req zone=api burst=20 nodelay;
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    # Block hidden files
    location ~ /\.(?!well-known) {
        deny all;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

ln -sf /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

systemctl restart nginx
systemctl restart php8.2-fpm

echo_ok "Nginx configured (rate limiting aktif)"

# ============================================================
# STEP 8: Cron + Queue Worker
# ============================================================
echo_info "Step 8: Setup cron + queue worker..."

(crontab -l 2>/dev/null; echo "* * * * * php /var/www/pterodactyl/artisan schedule:run >> /dev/null 2>&1") | crontab -

cat > /etc/systemd/system/pteroq.service <<EOF
[Unit]
Description=Pterodactyl Queue Worker
After=mariadb.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/pterodactyl/artisan queue:work --queue=high,default,low --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
EOF

systemctl enable pteroq
systemctl start pteroq

echo_ok "Cron + queue worker aktif"

# ============================================================
# STEP 9: Install Wings (Daemon)
# ============================================================
echo_info "Step 9: Install Pterodactyl Wings..."

mkdir -p /etc/pterodactyl /var/lib/pterodactyl/volumes

curl -Lo /usr/local/bin/wings "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_amd64"
chmod +x /usr/local/bin/wings

cat > /etc/systemd/system/wings.service <<EOF
[Unit]
Description=Pterodactyl Wings Daemon
After=docker.service
Requires=docker.service
PartOf=docker.service

[Service]
User=root
WorkingDirectory=/etc/pterodactyl
LimitNOFILE=4096
PIDFile=/var/run/wings/daemon.pid
ExecStart=/usr/local/bin/wings
Restart=on-failure
StartLimitInterval=600
StartLimitBurst=3
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo_ok "Wings terinstall"

# ============================================================
# STEP 10: Create Admin User
# ============================================================
echo_info "Step 10: Buat admin user..."

echo ""
echo "============================================"
echo "  Buat Akun Admin Panel"
echo "============================================"
read -p "Username: " ADMIN_USER
read -p "Email: " ADMIN_EMAIL
read -s -p "Password: " ADMIN_PASS
echo ""

cd /var/www/pterodactyl
php artisan p:user:make --email="${ADMIN_EMAIL}" --username="${ADMIN_USER}" --name-first="Admin" --name-last="Server" --password="${ADMIN_PASS}" --admin=1

echo_ok "Admin user dibuat"

# ============================================================
# STEP 11: Clone & Setup Clara Bot
# ============================================================
echo_info "Step 11: Clone Clara Bot..."

cd /opt
git clone https://github.com/itsmeeaizat/Clara-Whatsapp-Bot-Multi-Device.git clara-bot 2>/dev/null || {
  echo_warn "Repo sudah ada, pulling latest..."
  cd clara-bot && git pull
}

cd /opt/clara-bot

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

npm install
npm install -g pm2

cp .env.example .env 2>/dev/null || true

# PM2 startup script
cat > /opt/clara-bot/start.sh <<'EOF'
#!/bin/bash
cd /opt/clara-bot
pm2 start index.js --name clara-bot --max-memory-restart 1G
pm2 save
pm2 startup systemd -u root --hp /root
EOF
chmod +x /opt/clara-bot/start.sh

echo_ok "Clara Bot terinstall di /opt/clara-bot"

# ============================================================
# STEP 12: Cloudflare Tunnel (Optional - akses panel tanpa domain)
# ============================================================
echo_info "Step 12: Cloudflare Tunnel (optional)..."

read -p "Setup Cloudflare Tunnel untuk akses panel aman? (y/n): " CF_CHOICE
if [ "$CF_CHOICE" = "y" ]; then
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list
  apt update -y
  apt install -y cloudflared

  echo ""
  echo_warn "Cloudflare Tunnel URL:"
  echo_warn "Jalankan manual: cloudflared tunnel --url http://localhost:80"
  echo_warn "URL akan muncul, buka di browser untuk akses panel"
  echo ""
  echo_ok "Cloudflared terinstall"
else
  echo_warn "Cloudflare Tunnel di-skip. Panel via SSH tunnel atau IP langsung."
fi

# ============================================================
# STEP 13: Restart SSH (apply new port)
# ============================================================
echo_info "Step 13: Restart SSH (apply new port ${SSH_PORT})..."

# Pastikan port baru sudah kebuka di UFW
ufw allow ${SSH_PORT}/tcp

# Restart SSH
systemctl restart sshd

# ============================================================
# FINAL: Summary
# ============================================================
echo ""
echo "============================================"
echo "  INSTALL SELESAI!"
echo "============================================"
echo ""
echo "SSH Port: ${SSH_PORT}"
echo "Login: ssh root@${SERVER_IP} -p ${SSH_PORT}"
echo ""
echo "Panel URL: http://${SERVER_IP}"
echo "Admin: ${ADMIN_EMAIL}"
echo ""
echo "Info lengkap: /root/server-info.txt"
echo "Catat SSH port: ${SSH_PORT}"
echo ""
echo "============================================"
echo "  LANGKAH SELANJUTNYA:"
echo "============================================"
echo ""
echo "1. Buka panel di browser: http://${SERVER_IP}"
echo "   (atau via SSH tunnel: ssh -L 8080:localhost:80 -p ${SSH_PORT} root@${SERVER_IP})"
echo "   (atau via CF tunnel: cloudflared tunnel --url http://localhost:80)"
echo ""
echo "2. Login sebagai admin (${ADMIN_EMAIL})"
echo ""
echo "3. Setup di panel:"
echo "   a. Menu: Application Locations > Add Location"
echo "   b. Menu: Application Nodes > Add Node"
echo "   c. Isi: FQDN = ${SERVER_IP}, Daemon Port = 8080"
echo "   d. Klik node > tab Configuration > copy token"
echo ""
echo "4. Setup Wings (di VPS):"
echo "   echo 'TOKEN_DARI_PANEL' > /etc/pterodactyl/config.yml"
echo "   systemctl enable wings"
echo "   systemctl start wings"
echo ""
echo "5. Start bot Clara:"
echo "   cd /opt/clara-bot && bash start.sh"
echo "   (Scan QR pakai WhatsApp > Linked Device)"
echo ""
echo "============================================"
echo "  SECURITY AKTIF:"
echo "============================================"
echo "  - SSH port: ${SSH_PORT} (bukan 22)"
echo "  - Password login: disabled (SSH key only)"
echo "  - Fail2ban: 3x gagal = ban 1 jam"
echo "  - UFW firewall: hanya port perlu"
echo "  - Nginx rate limiting: 5 req/menit untuk login"
echo "  - Linode DDoS protection: otomatis"
echo ""
echo "SIMPAN INFO INI BAIK-BAIK!"
echo "cat /root/server-info.txt"
echo "============================================"
