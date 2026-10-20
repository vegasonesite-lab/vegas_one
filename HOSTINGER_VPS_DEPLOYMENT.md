# Vegas One (`vegasone.games`) - Hostinger VPS Deployment Guide

This guide gives you the exact, production-ready steps to push your Vegas One project to GitHub and deploy it on a Hostinger VPS with Nginx, SSL, PM2 cluster, and MongoDB.

---

## 1. Push Code from Local Mac to GitHub
In your local terminal inside `/Users/apple/Desktop/vegas_one`:

```bash
cd /Users/apple/Desktop/vegas_one

# Initialize git commit
git add .
git commit -m "feat: initial production release of Vegas One Casino"

# Add your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/vegas-one.git
git branch -M main
git push -u origin main
```

---

## 2. Prepare Hostinger VPS (One-Time Setup)
SSH into your Hostinger VPS as `root`:
```bash
ssh root@<YOUR_VPS_IP>
```

Run the server setup commands:
```bash
# Update packages
apt update && apt upgrade -y

# Install Node.js 20 & Git
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx certbot python3-certbot-nginx

# Install PM2 Process Manager globally
npm install -g pm2

# Install MongoDB Community Server (if running local DB on VPS)
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

---

## 3. Clone and Build Vegas One on VPS
```bash
# Navigate to web root
cd /var/www
git clone https://github.com/<your-username>/vegas-one.git vegas_one
cd vegas_one

# Setup Production Environment
cp .env.example .env.local

# Edit .env.local with your real domain and secrets:
nano .env.local
# Set:
# MONGODB_URI=mongodb://localhost:27017/vegas_one
# NEXT_PUBLIC_APP_URL=https://vegasone.games
# BYPASS_GEO_LOCK=false  (for strict USA only in production)

# Install dependencies and build Next.js
npm install
npm run build
```

---

## 4. Launch PM2 Cluster Mode
Vegas One is pre-configured with `ecosystem.config.cjs` for clustering:

```bash
# Start the application
pm2 start ecosystem.config.cjs

# Save PM2 process list so it restarts automatically on server reboot:
pm2 save
pm2 startup
```

---

## 5. Configure Nginx Reverse Proxy
Create the Nginx configuration file:
```bash
nano /etc/nginx/sites-available/vegasone.games
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name vegasone.games www.vegasone.games;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Forward real client IP and Geo Headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Important for File & Video Uploads (Avoiding 413 Request Entity Too Large):**
> In `/etc/nginx/nginx.conf`, inside the `http { ... }` block (or inside both port 80 and port 443 SSL `server { ... }` blocks in `/etc/nginx/sites-available/vegasone.games`), ensure:
> ```nginx
> client_max_body_size 100M;
> ```
> Then run:
> ```bash
> nginx -t && systemctl reload nginx
> ```

Enable the site and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/vegasone.games /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 6. Install Free SSL Certificate (HTTPS)
```bash
certbot --nginx -d vegasone.games -d www.vegasone.games
```
Certbot will automatically install the Let's Encrypt SSL certificate and set up automatic renewal.

---

## 7. Default System Accounts (Auto-Seeded)
When you first run the server, the database auto-initializes with the following default accounts:

| Role | Username / Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@vegasone.games` | `VegasOne@2026!` | Full Unrestricted Access |
| **Financial Manager** | `finance@vegasone.games` | `Staff@2026!` | Finance, Deposits, Redemptions, Gateways |
| **Coin Allotment Officer** | `coins@vegasone.games` | `Staff@2026!` | Coin Vault Allotment & Deduction |
| **Live Chat Support** | `support@vegasone.games` | `Staff@2026!` | Live Chat Support Desk |

*(You can change any password or create additional staff members inside `/admin` under the Staff Management tab).*

---

## 8. 1-Click Update Command (For Future Updates)
Whenever you push new changes to GitHub, update your VPS in seconds:
```bash
cd /var/www/vegas_one && npm run deploy
```
*(This command automatically pulls the latest git commits, rebuilds the app, and reloads the PM2 cluster with zero downtime).*

---

## 9. Building Android APK & iOS Apps (Capacitor)
On your development machine:

```bash
cd /Users/apple/Desktop/vegas_one

# Sync mobile assets
npx cap add android
npx cap add ios
npx cap sync

# Open in Android Studio to build APK/AAB:
npm run android:open

# Open in Xcode to build iOS App:
npm run ios:open
```
The APK and iOS apps will connect directly to `https://vegasone.games` with full native push notification and splash screen support.
