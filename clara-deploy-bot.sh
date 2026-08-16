#!/bin/bash
# ============================================================
# Clara Bot Deploy Script
# Jalankan SETELAH Pterodactyl Panel selesai terinstall
# Run as root: bash clara-deploy-bot.sh
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
  echo_err "Jalankan sebagai root: bash clara-deploy-bot.sh"
  exit 1
fi

echo ""
echo "============================================"
echo "  Clara Bot Deploy Script"
echo "============================================"
echo ""

# ============================================================
# STEP 1: Install Node.js 20 LTS
# ============================================================
echo_info "Step 1: Install Node.js 20 LTS..."

if command -v node &> /dev/null; then
  NODE_VER=$(node -v)
  echo_warn "Node.js sudah terinstall: ${NODE_VER}"
  read -p "Reinstall/update? (y/n): " REINSTALL
  if [ "$REINSTALL" = "y" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
  fi
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

echo_ok "Node.js: $(node -v)"
echo_ok "npm: $(npm -v)"

# ============================================================
# STEP 2: Install System Dependencies (canvas, sharp, dll)
# ============================================================
echo_info "Step 2: Install system dependencies..."

apt install -y \
  build-essential \
  python3 \
  python3-dev \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  libsharp-dev \
  ffmpeg \
  imagemagick \
  webp \
  libwebp-dev \
  git \
  wget \
  curl

echo_ok "System dependencies terinstall"

# ============================================================
# STEP 3: Install PM2
# ============================================================
echo_info "Step 3: Install PM2..."

npm install -g pm2

echo_ok "PM2 terinstall: $(pm2 -v)"

# ============================================================
# STEP 4: Clone Clara Bot
# ============================================================
echo_info "Step 4: Clone Clara Bot..."

BOT_DIR="/opt/clara-bot"

if [ -d "$BOT_DIR/.git" ]; then
  echo_warn "Bot sudah ada, update ke latest..."
  cd "$BOT_DIR"
  git pull origin main
else
  git clone https://github.com/itsmeeaizat/Clara-Whatsapp-Bot-Multi-Device.git "$BOT_DIR"
  cd "$BOT_DIR"
fi

echo_ok "Bot cloned ke $BOT_DIR"

# ============================================================
# STEP 5: Install Dependencies
# ============================================================
echo_info "Step 5: Install npm dependencies..."

cd "$BOT_DIR"

# Install dengan flag untuk build native modules
npm install --build-from-source

# Install paket tambahan yang sering missing
npm install sharp @napi-rs/canvas canvas fs-extra moment qrcode 2>/dev/null || true

echo_ok "Dependencies terinstall"

# ============================================================
# STEP 6: Setup Environment
# ============================================================
echo_info "Step 6: Setup environment..."

# Copy .env jika belum ada
if [ ! -f "$BOT_DIR/.env" ]; then
  if [ -f "$BOT_DIR/.env.example" ]; then
    cp "$BOT_DIR/.env.example" "$BOT_DIR/.env"
    echo_warn "File .env dibuat dari example. Edit sesuai kebutuhan."
  else
    # Create basic .env
    cat > "$BOT_DIR/.env" <<'EOF'
# Clara Bot Environment
NODE_ENV=production
PREFIX=.
OWNER_NUMBER=628311880113
SESSION_ID=clara-session
AUTO_READ=false
AUTO_TYPING=false
AUTO_RECORDING=false
EOF
    echo_ok "File .env dibuat dengan default config"
  fi
else
  echo_warn ".env sudah ada, skip"
fi

# ============================================================
# STEP 7: Setup PM2 Ecosystem
# ============================================================
echo_info "Step 7: Setup PM2 ecosystem..."

cat > "$BOT_DIR/ecosystem.config.js" <<'EOF'
module.exports = {
  apps: [{
    name: "clara-bot",
    script: "index.js",
    cwd: "/opt/clara-bot",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
    },
    env_development: {
      NODE_ENV: "development",
    },
    error_file: "/var/log/clara-bot/error.log",
    out_file: "/var/log/clara-bot/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
  }]
};
EOF

# Create log directory
mkdir -p /var/log/clara-bot

echo_ok "PM2 ecosystem configured"

# ============================================================
# STEP 8: Setup PM2 Startup
# ============================================================
echo_info "Step 8: Setup PM2 auto-start on boot..."

pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save 2>/dev/null || true

echo_ok "PM2 startup configured (auto-start on boot)"

# ============================================================
# STEP 9: Create Helper Scripts
# ============================================================
echo_info "Step 9: Buat helper scripts..."

# Start script
cat > "$BOT_DIR/start.sh" <<'EOF'
#!/bin/bash
cd /opt/clara-bot
pm2 start ecosystem.config.js
pm2 save
echo "Clara Bot started! Cek log: pm2 logs clara-bot"
EOF
chmod +x "$BOT_DIR/start.sh"

# Stop script
cat > "$BOT_DIR/stop.sh" <<'EOF'
#!/bin/bash
pm2 stop clara-bot
echo "Clara Bot stopped."
EOF
chmod +x "$BOT_DIR/stop.sh"

# Restart script
cat > "$BOT_DIR/restart.sh" <<'EOF'
#!/bin/bash
pm2 restart clara-bot
echo "Clara Bot restarted!"
EOF
chmod +x "$BOT_DIR/restart.sh"

# Log viewer
cat > "$BOT_DIR/log.sh" <<'EOF'
#!/bin/bash
pm2 logs clara-bot --lines 50
EOF
chmod +x "$BOT_DIR/log.sh"

echo_ok "Helper scripts dibuat (start.sh, stop.sh, restart.sh, log.sh)"

# ============================================================
# STEP 10: Start Bot
# ============================================================
echo_info "Step 10: Start Clara Bot..."

echo ""
echo "============================================"
echo "  DEPLOY SELESAI!"
echo "============================================"
echo ""
echo "Bot location: /opt/clara-bot"
echo ""
echo "Cara pakai:"
echo "  Start:    bash /opt/clara-bot/start.sh"
echo "  Stop:     bash /opt/clara-bot/stop.sh"
echo "  Restart:  bash /opt/clara-bot/restart.sh"
echo "  Log:      bash /opt/clara-bot/log.sh"
echo "  PM2:      pm2 status"
echo ""
echo "============================================"
echo "  LANGKAH SELANJUTNYA:"
echo "============================================"
echo ""
echo "1. Edit config bot:"
echo "   nano /opt/clara-bot/.env"
echo "   nano /opt/clara-bot/config.js"
echo ""
echo "2. Start bot untuk pertama kali:"
echo "   cd /opt/clara-bot"
echo "   node index.js"
echo ""
echo "3. Scan QR code yang muncul:"
echo "   Buka WhatsApp > Settings > Linked Devices > Link a Device"
echo "   Scan QR code di terminal"
echo ""
echo "4. Setelah berhasil scan, pakai PM2 untuk auto-restart:"
echo "   bash /opt/clara-bot/start.sh"
echo ""
echo "5. Cek status bot:"
echo "   pm2 status"
echo "   pm2 logs clara-bot"
echo ""
echo "============================================"
