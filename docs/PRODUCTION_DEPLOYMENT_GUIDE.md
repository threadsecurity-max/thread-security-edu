# Thread Security Education (TSE) LMS — Production Deployment Manual
**Target Platforms**: Hostinger (VPS / Node.js Application Manager) & Render (Web Services)

---

## 🚀 1. Production Architecture Overview

The TSE LMS is an enterprise-grade Next.js application designed to run statelessly and scale horizontally behind reverse proxies and CDNs.

```text
               Internet (Clients / Browsers)
                            │
                            ▼
               Cloudflare / Hostinger CDN / SSL
                            │
                            ▼
                  Nginx Reverse Proxy
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
   TSE Next.js Application        FastAPI Chatbot / AI
    (Port 3000 / PM2 / Docker)      (Port 8000 - Optional)
            │                               │
            └───────────────┬───────────────┘
                            │
                            ▼
              PostgreSQL Database (Prisma)
              Cloudinary Media CDN
              Google Cloud / Gemini AI APIs
```

---

## 📋 2. Environment Variables Checklist (`.env.production`)

Configure these in your Render or Hostinger Environment Manager:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Production environment | `production` |
| `PORT` | Application listener port | `3000` |
| `NEXTAUTH_URL` | Canonical public URL | `https://threadsecurity.in` |
| `NEXT_PUBLIC_APP_URL` | Frontend API domain | `https://threadsecurity.in` |
| `NEXTAUTH_SECRET` | 32+ character JWT secret | `generate-random-32-chars-secret` |
| `DATABASE_URL` | PostgreSQL connection pool | `postgres://user:pass@host:5432/db?sslmode=require` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your-cloudinary-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret | `your-cloudinary-api-secret` |
| `GEMINI_API_KEY` | Google Gemini AI Key | `AIzaSy...your-gemini-key` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | `your-google-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | `GOCSPX-your-oauth-secret` |
| `RESEND_API_KEY` | Resend email key | `re_your_resend_api_key` |
| `RESEND_FROM_EMAIL` | Outbound email sender | `Thread Security Education <onboarding@resend.dev>` |
| `FACULTY_NOTIFY_EMAIL` | Faculty alert receiver | `faculty@yourdomain.com` |
| `ADMIN_PASSKEY` | Admin bypass passkey | `your-secure-admin-passkey` |
| `ADMIN_SECRET_KEY` | Admin verification key | `your-secure-admin-secret-key` |

---

## 🌐 3. Deploying on Render

### Option A — 1-Click Blueprint (Recommended)
1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Select your `threads-edu` repository.
5. Render reads [`render.yaml`](file:///e:/threads-edu/render.yaml) and configures the web service automatically.
6. Fill in the required environment secret values in the Render UI.

### Option B — Standard Web Service
1. In Render, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure:
   - **Name**: `threads-edu-lms`
   - **Environment**: `Node`
   - **Build Command**: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health/liveness`
4. Add environment variables under the **Environment** tab.
5. Click **Create Web Service**.

---

## 🏢 4. Deploying on Hostinger

### Method 1: Hostinger VPS (Ubuntu / Debian with Docker or PM2) — *Highest Performance*

#### Step 1: Connect to your VPS
```bash
ssh root@your-vps-ip
```

#### Step 2: Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2
```

#### Step 3: Clone & Build
```bash
cd /var/www
git clone https://github.com/your-org/threads-edu.git
cd threads-edu

# Install dependencies and build
npm install --legacy-peer-deps
npx prisma generate
npm run build
```

#### Step 4: Run with PM2
```bash
pm2 start npm --name "threads-edu" -- start -- -p 3000
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx Reverse Proxy & SSL
Edit `/etc/nginx/sites-available/threadsecurity.in`:
```nginx
server {
    listen 80;
    server_name threadsecurity.in www.threadsecurity.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site & generate free SSL with Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/threadsecurity.in /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d threadsecurity.in -d www.threadsecurity.in
```

---

### Method 2: Hostinger Cloud / cPanel Node.js Application Manager

1. In hPanel, go to **Node.js** → **Create Application**.
2. **Node.js version**: `20.x`.
3. **Application mode**: `Production`.
4. **Application root**: `threads-edu`.
5. **Application URL**: `threadsecurity.in`.
6. **Application startup file**: `server.js` (copy `.next/standalone/server.js` and `.next/standalone/node_modules` to root).
7. Under **Environment variables**, input all variables from the checklist above.
8. Click **Run NPM Install** and **Restart**.

---

## 🔍 5. Post-Deployment Verification Checklist

Verify your production deployment by testing:
- [ ] **Liveness Check**: `curl -I https://threadsecurity.in/api/health/liveness` → Returns HTTP 200 `status: UP`.
- [ ] **Readiness Check**: `curl -I https://threadsecurity.in/api/health/readiness` → Returns HTTP 200 `database: HEALTHY`.
- [ ] **Robots & Sitemap**: `https://threadsecurity.in/robots.txt` & `https://threadsecurity.in/sitemap.xml`.
- [ ] **AI Assistant**: Click floating bot launcher on bottom-right and test greeting or curriculum query.
- [ ] **Lead Capture Form**: Submit a test inquiry and verify it reaches your database & notification email.
- [ ] **Security Headers**: Verify presence of `Content-Security-Policy`, `X-Frame-Options: DENY`, and `Strict-Transport-Security`.
