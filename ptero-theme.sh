#!/bin/bash
# ============================================================
# Pterodactyl Theme Installer
# Jalankan SETELAH panel Pterodactyl selesai terinstall
# Run as root: bash ptero-theme.sh
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
  echo_err "Jalankan sebagai root: bash ptero-theme.sh"
  exit 1
fi

PANEL_DIR="/var/www/pterodactyl"

if [ ! -d "$PANEL_DIR" ]; then
  echo_err "Pterodactyl panel belum terinstall di $PANEL_DIR"
  exit 1
fi

echo ""
echo "============================================"
echo "  Pterodactyl Theme Installer"
echo "============================================"
echo ""
echo "Pilih tema:"
echo ""
echo "  1. Blueprint (Modern + Announcement System)"
echo "  2. Stellar (Dark + Popup Notifications)"
echo "  3. Flare (Elegant + Banner Alert)"
echo "  4. MilkyWay (Dark + Glass Effect)"
echo "  5. Revert ke Default (Remove Theme)"
echo ""
read -p "Pilihan (1-5): " THEME_CHOICE

cd "$PANEL_DIR"

# ============================================================
# BACKUP dulu sebelum install tema
# ============================================================
echo_info "Backup panel sebelum install tema..."
tar -czf /root/pterodactyl-backup-$(date +%Y%m%d).tar.gz \
  --exclude="node_modules" \
  --exclude="vendor" \
  --exclude="storage/logs" \
  . 2>/dev/null || true
echo_ok "Backup disimpan di /root/pterodactyl-backup-$(date +%Y%m%d).tar.gz"

case $THEME_CHOICE in

# ============================================================
# 1. BLUEPRINT THEME
# ============================================================
1)
  echo_info "Install Blueprint Theme..."
  
  # Download Blueprint installer
  curl -Lo blueprint.zip https://github.com/TeamBlueFox/Pr-Blueprint-Installer/releases/latest/download/blueprint.zip
  unzip -o blueprint.zip -d blueprint-install
  rm blueprint.zip
  
  # Run Blueprint installer
  cd blueprint-install
  bash blueprint.sh install
  
  cd "$PANEL_DIR"
  
  # Clear cache
  php artisan view:clear
  php artisan cache:clear
  php artisan config:clear
  
  chown -R www-data:www-data "$PANEL_DIR"
  
  echo_ok "Blueprint Theme terinstall!"
  echo ""
  echo "Cara setup announcement/popup:"
  echo "  php artisan blueprint:announcement"
  echo ""
  echo "  Contoh:"
  echo "  php artisan blueprint:announcement --message='Selamat datang di Panel Clara Bot!'"
  echo "  php artisan blueprint:announcement --message='Maintenance jam 00:00 WIB' --type=warning"
  echo ""
  echo "  Type options: info, warning, success, danger"
  echo ""
  echo "Hapus announcement:"
  echo "  php artisan blueprint:announcement --remove"
  ;;

# ============================================================
# 2. STELLAR THEME
# ============================================================
2)
  echo_info "Install Stellar Theme..."
  
  # Backup views
  cp -r resources/views /root/pterodactyl-views-backup
  
  # Download Stellar
  curl -Lo stellar.zip https://github.com/PrSeo3/Pterodactyl-Stellar/archive/refs/heads/main.zip
  unzip -o stellar.zip
  rm stellar.zip
  
  # Copy theme files
  cp -rf Pterodactyl-Stellar-main/* "$PANEL_DIR/"
  rm -rf Pterodactyl-Stellar-main
  
  # Install dependencies
  php artisan view:clear
  php artisan cache:clear
  
  # Compile assets
  npm install
  npm run build
  
  chown -R www-data:www-data "$PANEL_DIR"
  
  echo_ok "Stellar Theme terinstall!"
  echo ""
  echo "Config popup di: Admin > Settings > Stellar"
  ;;

# ============================================================
# 3. FLARE THEME
# ============================================================
3)
  echo_info "Install Flare Theme..."
  
  cp -r resources/views /root/pterodactyl-views-backup
  
  curl -Lo flare.zip https://github.com/PrSeo3/Pterodactyl-Flare/archive/refs/heads/main.zip
  unzip -o flare.zip
  rm flare.zip
  
  cp -rf Pterodactyl-Flare-main/* "$PANEL_DIR/"
  rm -rf Pterodactyl-Flare-main
  
  php artisan view:clear
  php artisan cache:clear
  
  npm install
  npm run build
  
  chown -R www-data:www-data "$PANEL_DIR"
  
  echo_ok "Flare Theme terinstalled!"
  echo ""
  echo "Config banner di: Admin > Settings > Flare"
  ;;

# ============================================================
# 4. MILKYWAY THEME
# ============================================================
4)
  echo_info "Install MilkyWay Theme..."
  
  cp -r resources/views /root/pterodactyl-views-backup
  
  curl -Lo milkyway.zip https://github.com/PrSeo3/Pterodactyl-Milky-Way/archive/refs/heads/main.zip
  unzip -o milkyway.zip
  rm milkyway.zip
  
  cp -rf Pterodactyl-Milky-Way-main/* "$PANEL_DIR/"
  rm -rf Pterodactyl-Milky-Way-main
  
  php artisan view:clear
  php artisan cache:clear
  
  npm install
  npm run build
  
  chown -R www-data:www-data "$PANEL_DIR"
  
  echo_ok "MilkyWay Theme terinstalled!"
  ;;

# ============================================================
# 5. REVERT TO DEFAULT
# ============================================================
5)
  echo_info "Revert ke tema default..."
  
  if [ -d /root/pterodactyl-views-backup ]; then
    rm -rf "$PANEL_DIR/resources/views"
    cp -r /root/pterodactyl-views-backup "$PANEL_DIR/resources/views"
    
    php artisan view:clear
    php artisan cache:clear
    
    npm install
    npm run build
    
    chown -R www-data:www-data "$PANEL_DIR"
    
    echo_ok "Reverted ke tema default!"
  else
    echo_err "Backup views tidak ditemukan. Tidak bisa revert."
    echo_warn "Restore manual dari backup: /root/pterodactyl-backup-*.tar.gz"
  fi
  ;;

*)
  echo_err "Pilihan tidak valid."
  exit 1
  ;;

esac

# ============================================================
# RESTART SERVICES
# ============================================================
echo_info "Restart services..."
systemctl restart nginx
systemctl restart php8.2-fpm
systemctl restart pteroq

echo_ok "Selesai!"
echo ""
echo "Buka panel di browser untuk lihat tema baru."
echo "Refresh dengan Ctrl+F5 kalau tampilan belum berubah."
