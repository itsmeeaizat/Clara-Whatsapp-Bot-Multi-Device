#!/bin/bash
# ============================================================
# VPS Security Hardening Script (Anti-DDoS + Anti-Brute Force)
# Jalankan SETELAH panel terinstall
# Run as root: bash vps-security.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
echo_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_err() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then
  echo_err "Jalankan sebagai root: bash vps-security.sh"
  exit 1
fi

echo ""
echo "============================================"
echo "  VPS Security Hardening Script"
echo "  Anti-DDoS + Anti-Brute Force"
echo "============================================"
echo ""

# ============================================================
# STEP 1: Install DDOS-Protect + Network Tools
# ============================================================
echo_info "Step 1: Install network protection tools..."

apt update -y
apt install -y \
  ufw fail2ban \
  iptables ipset \
  net-tools \
  curl wget \
  nano htop

echo_ok "Network tools terinstall"

# ============================================================
# STEP 2: Konfigurasi UFW Firewall (Strict Mode)
# ============================================================
echo_info "Step 2: Konfigurasi firewall (strict)..."

ufw default deny incoming
ufw default allow outgoing

# SSH (tanya port)
read -p "Port SSH saat ini (default 22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}
ufw allow ${SSH_PORT}/tcp comment "SSH"

# HTTP/HTTPS untuk panel
ufw allow 80/tcp comment "HTTP"
ufw allow 443/tcp comment "HTTPS"

# Pterodactyl Wings
ufw allow 8080/tcp comment "Wings-API"
ufw allow 2022/tcp comment "Wings-SFTP"

# DENY semua port lain
ufw deny 3306/tcp comment "MySQL-DENIED"
ufw deny 6379/tcp comment "Redis-DENIED"
ufw deny 27017/tcp comment "MongoDB-DENIED"

ufw --force enable
echo_ok "Firewall aktif - hanya port perlu yang kebuka"

# ============================================================
# STEP 3: Fail2ban (Aggressive Anti-Brute Force)
# ============================================================
echo_info "Step 3: Konfigurasi Fail2ban aggressive..."

cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 7200
findtime = 600
maxretry = 3
banaction = ufw
ignoreip = 127.0.0.1/8 ::1

# SSH brute force
[sshd]
enabled = true
port = ${SSH_PORT}
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
findtime = 300

# SSH DDoS
[sshd-ddos]
enabled = true
port = ${SSH_PORT}
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 2
bantime = 14400
findtime = 300

# Nginx auth
[nginx-auth]
enabled = true
port = http,https
filter = nginx-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

# Nginx limit request
[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 7200
findtime = 600

# Nginx 403/404 scan
[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

# Nginx bot search
[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 7200
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo_ok "Fail2ban aktif - 3x gagal = ban 2 jam"

# ============================================================
# STEP 4: Kernel Hardening (Anti-DDoS Network Level)
# ============================================================
echo_info "Step 4: Kernel hardening (SYN flood protection)..."

# Backup sysctl
cp /etc/sysctl.conf /etc/sysctl.conf.bak 2>/dev/null || true

cat > /etc/sysctl.d/99-anti-ddos.conf <<EOF
# ===========================================
# ANTI-DDOS KERNEL SETTINGS
# ===========================================

# SYN Flood Protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 3

# Connection Tracking
net.ipv4.tcp_max_tw_buckets = 1440000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# ICMP (Ping) Rate Limit
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_echo_ignore_all = 0
net.ipv4.icmp_ratelimit = 1
net.ipv4.icmp_ratemask = 0

# Drop packets from invalid sources
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Reverse path filtering
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable IP forwarding (unless running router/VPN)
net.ipv4.ip_forward = 0

# Connection timeout
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 30

# Increase file descriptor limits
fs.file-max = 2097152
fs.nr_open = 2097152

# Network buffer sizes
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.core.rmem_default = 1048576
net.core.wmem_default = 1048576
net.core.netdev_max_backlog = 250000
net.core.somaxconn = 65535

# TCP fastopen
net.ipv4.tcp_fastopen = 3

# TCP window scaling
net.ipv4.tcp_window_scaling = 1
net.ipv4.tcp_timestamps = 1
net.ipv4.tcp_sack = 1

# Disable redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
EOF

sysctl -p /etc/sysctl.d/99-anti-ddos.conf

echo_ok "Kernel hardening aktif - SYN flood + ICMP protected"

# ============================================================
# STEP 5: IPTables Rate Limiting (Layer 3/4 DDoS Protection)
# ============================================================
echo_info "Step 5: IPTables rate limiting..."

# Create iptables rules
iptables -F
iptables -X
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH with rate limit (max 4 new connections per 60 seconds)
iptables -A INPUT -p tcp --dport ${SSH_PORT} -m conntrack --ctstate NEW -m recent --set --name SSH
iptables -A INPUT -p tcp --dport ${SSH_PORT} -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP
iptables -A INPUT -p tcp --dport ${SSH_PORT} -j ACCEPT

# HTTP/HTTPS with connection limit (max 100 concurrent per IP)
iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 100 --connlimit-mask 32 -j DROP
iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 100 --connlimit-mask 32 -j DROP
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Wings
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 2022 -j ACCEPT

# Block spoofed/malicious packets
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags SYN,FIN SYN,FIN -j DROP
iptables -A INPUT -p tcp --tcp-flags SYN,RST SYN,RST -j DROP
iptables -A INPUT -p tcp --tcp-flags FIN,RST FIN,RST -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP

# ICMP rate limit (max 2 pings per second per IP)
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 2/s --limit-burst 5 -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP

# SYN flood protection
iptables -A INPUT -p tcp ! --syn -m state --state NEW -j DROP
iptables -A INPUT -p tcp --syn -m limit --limit 20/s --limit-burst 40 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

echo_ok "IPTables rate limiting aktif"

# Save iptables rules
apt install -y iptables-persistent
netfilter-persistent save

echo_ok "IPTables rules disimpan (persistent)"

# ============================================================
# STEP 6: Nginx Rate Limiting + Security Headers
# ============================================================
echo_info "Step 6: Nginx rate limiting..."

# Check if nginx config exists
NGINX_CONF="/etc/nginx/sites-available/pterodactyl.conf"
if [ -f "$NGINX_CONF" ]; then
  cp "$NGINX_CONF" "${NGINX_CONF}.bak"

  # Add rate limiting zones at top of nginx.conf http block
  NGINX_MAIN="/etc/nginx/nginx.conf"
  if ! grep -q "limit_req_zone" "$NGINX_MAIN"; then
    sed -i '/http {/a\\tlimit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;\n\tlimit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;\n\tlimit_req_zone $binary_remote_addr zone=general:10m rate=60r/m;\n\tlimit_conn_zone $binary_remote_addr zone=conn_limit:10m;' "$NGINX_MAIN"
  fi

  # Add limits to panel config
  if ! grep -q "limit_req" "$NGINX_CONF"; then
    sed -i '/location \/ {/a\\t\tlimit_req zone=general burst=20 nodelay;\n\t\tlimit_conn conn_limit 10;' "$NGINX_CONF"
    sed -i '/location \/auth\/login {/a\\t\tlimit_req zone=login burst=5 nodelay;' "$NGINX_CONF" 2>/dev/null || true
    sed -i '/location \/api {/a\\t\tlimit_req zone=api burst=10 nodelay;' "$NGINX_CONF" 2>/dev/null || true
  fi

  # Add security headers
  if ! grep -q "X-Frame-Options" "$NGINX_CONF"; then
    sed -i '/location ~ \/\\.(?!well-known) {/i\\tadd_header X-Frame-Options "SAMEORIGIN" always;\n\tadd_header X-Content-Type-Options "nosniff" always;\n\tadd_header X-XSS-Protection "1; mode=block" always;\n\tadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\tadd_header X-Download-Options "noopen" always;' "$NGINX_CONF" 2>/dev/null || true
  fi

  # Hide nginx version
  sed -i 's/# server_tokens off;/server_tokens off;/' "$NGINX_MAIN" 2>/dev/null || true
  sed -i 's/server_tokens on;/server_tokens off;/' "$NGINX_MAIN" 2>/dev/null || true

  nginx -t && systemctl restart nginx
  echo_ok "Nginx rate limiting + security headers aktif"
else
  echo_warn "Config nginx Pterodactyl tidak ditemukan, skip"
fi

# ============================================================
# STEP 7: SSH Hardening
# ============================================================
echo_info "Step 7: SSH hardening..."

cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak 2>/dev/null || true

# Disable root password login (SSH key only)
read -p "Disable password login (SSH key only)? (y/n): " DISABLE_PASS
if [ "$DISABLE_PASS" = "y" ]; then
  sed -i "s/^#\?PasswordAuthentication .*/PasswordAuthentication no/" /etc/ssh/sshd_config
  echo_ok "Password login disabled - SSH key only"
else
  echo_warn "Password login tetap aktif"
fi

# Disable unused SSH features
sed -i "s/^#\?PermitEmptyPasswords .*/PermitEmptyPasswords no/" /etc/ssh/sshd_config
sed -i "s/^#\?MaxAuthTries .*/MaxAuthTries 3/" /etc/ssh/sshd_config
sed -i "s/^#\?LoginGraceTime .*/LoginGraceTime 30/" /etc/ssh/sshd_config
sed -i "s/^#\?AllowTcpForwarding .*/AllowTcpForwarding no/" /etc/ssh/sshd_config
sed -i "s/^#\?X11Forwarding .*/X11Forwarding no/" /etc/ssh/sshd_config
sed -i "s/^#\?PermitRootLogin .*/PermitRootLogin prohibit-password/" /etc/ssh/sshd_config

systemctl restart sshd

echo_ok "SSH hardening selesai"

# ============================================================
# STEP 8: Install Cloudflare Tunnel (Optional)
# ============================================================
echo_info "Step 8: Cloudflare Tunnel (optional)..."

read -p "Install Cloudflare Tunnel (DDoS protection tambahan)? (y/n): " CF_CHOICE
if [ "$CF_CHOICE" = "y" ]; then
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list
  apt update -y
  apt install -y cloudflared
  echo_ok "Cloudflared terinstall"
  echo_warn "Jalankan: cloudflared tunnel --url http://localhost:80"
else
  echo_warn "Cloudflare Tunnel skip"
fi

# ============================================================
# STEP 9: Auto-Update Security Patches
# ============================================================
echo_info "Step 9: Auto-update security patches..."

apt install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

cat > /etc/apt/apt.conf.d/50unattended-upgrades <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}:\${distro_codename}-updates";
};
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
EOF

echo_ok "Auto security update aktif"

# ============================================================
# STEP 10: Create Status Checker Script
# ============================================================
echo_info "Step 10: Buat status checker..."

cat > /root/security-status.sh <<'EOF'
#!/bin/bash
echo "============================================"
echo "  VPS Security Status"
echo "============================================"
echo ""
echo "=== Firewall (UFW) ==="
ufw status | head -20
echo ""
echo "=== Fail2ban ==="
fail2ban-client status
echo ""
echo "=== SSH Login Attempts ==="
journalctl -u sshd --since "24 hours ago" | grep -i "failed\|invalid" | wc -l
echo "failed attempts in last 24h"
echo ""
echo "=== Banned IPs ==="
fail2ban-client status sshd 2>/dev/null | grep "Banned IP"
echo ""
echo "=== Active Connections ==="
ss -s
echo ""
echo "=== Top 10 IPs by Connection ==="
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -n | tail -10
echo ""
echo "============================================"
EOF
chmod +x /root/security-status.sh

echo_ok "Status checker dibuat: /root/security-status.sh"

# ============================================================
# FINAL SUMMARY
# ============================================================
echo ""
echo "============================================"
echo "  SECURITY HARDENING SELESAI!"
echo "============================================"
echo ""
echo "Proteksi aktif:"
echo "  1. UFW Firewall (strict mode)"
echo "  2. Fail2ban (3x gagal = ban 2 jam)"
echo "  3. Kernel anti-DDoS (SYN flood protection)"
echo "  4. IPTables rate limiting"
echo "  5. Nginx rate limiting (5 req/min login)"
echo "  6. Security headers (X-Frame, XSS, nosniff)"
echo "  7. SSH hardening (max 3 tries, 30s timeout)"
echo "  8. Auto security update"
echo ""
echo "Cek status: bash /root/security-status.sh"
echo ""
echo "============================================"
