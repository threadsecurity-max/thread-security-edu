# Hostinger Deployment Guide for Thread Security Education LMS

This repository has been verified and pre-configured for deployment on **Hostinger**.

---

## Pre-Deployment Verification Summary
- **TypeScript Check**: `0 errors` (Clean)
- **Next.js 16 Standalone Build**: `Passed` (All 26 dynamic & static routes compiled cleanly)
- **Prisma Schema**: PostgreSQL (`@prisma/client 6.3.1`)
- **Docker Support**: Multi-stage standalone `Dockerfile` & `docker-compose.yml` verified.

---

## 🚀 Option 1: Hostinger VPS (Recommended)

Hostinger VPS provides full root access, Docker support, and dedicated PostgreSQL instance compatibility.

### Step 1: Connect to your Hostinger VPS via SSH
```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Install Docker & Docker Compose (if not already installed)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose-plugin
```

### Step 3: Clone Repository & Setup Environment
```bash
git clone <YOUR_GIT_REPOSITORY_URL> /var/www/threads-edu
cd /var/www/threads-edu

# Copy template and edit environment variables
cp .env.example .env
nano .env
```

### Step 4: Run with Docker Compose
```bash
# Start both PostgreSQL and Next.js Application
docker compose up -d --build

# Run database schema migration
docker compose exec app npx prisma db push

# (Optional) Seed initial data
docker compose exec app npm run prisma:seed
```

### Step 5: Configure Nginx & SSL (Certbot)
Point your domain (e.g. `edu.threadsecurity.in` or `yourdomain.com`) to your Hostinger VPS IP:
```nginx
# /etc/nginx/sites-available/threads-edu
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and install SSL certificate:
```bash
ln -s /etc/nginx/sites-available/threads-edu /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ⚡ Option 2: Hostinger VPS via PM2 (No Docker)

If running directly on Node.js:
1. Install Node.js 20+:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs postgresql postgresql-contrib
   npm install -g pm2
   ```
2. Build and run:
   ```bash
   cd /var/www/threads-edu
   npm install --legacy-peer-deps
   npx prisma generate
   npx prisma db push
   npm run build
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

---

## 🌐 Option 3: Hostinger Cloud / Shared Web Hosting (hPanel Node.js)

If you have Hostinger Cloud Web Hosting with the **Node.js Application Manager**:
1. **Node.js Version**: Select `Node.js 20.x` or `22.x`.
2. **Application Root**: `/public_html` (or subfolder).
3. **Application Startup File**: `server.js` or `node_modules/next/dist/bin/next`.
4. **Database Note**: Hostinger shared hosting natively offers MySQL. Since this LMS uses PostgreSQL features in Prisma:
   - Use a cloud PostgreSQL instance (e.g., [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Aiven](https://aiven.io)).
   - Set `DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"` in the hPanel Environment Variables.
5. In the SSH terminal of hPanel:
   ```bash
   npm install --legacy-peer-deps
   npx prisma generate
   npx prisma db push
   npm run build
   ```

---

## 🔑 Critical Environment Variables Checklist

Ensure these variables are filled in your production `.env` file on Hostinger:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URI |
| `NEXTAUTH_URL` | Full URL (e.g., `https://yourdomain.com`) |
| `NEXTAUTH_SECRET` | 32+ character random string |
| `NODE_ENV` | `production` |
| `RESEND_API_KEY` | For OTP and email delivery |
| `ADMIN_PASSKEY` / `ADMIN_SECRET_KEY` | Admin portal credentials |
| `MENTOR_PASSKEY` / `MENTOR_SECRET_KEY` | Mentor portal credentials |
| `SECURITY_ADMIN_PASSKEY` / `SECURITY_ADMIN_SECRET_KEY` | Security lead portal credentials |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary name for image assets |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary backend keys |
