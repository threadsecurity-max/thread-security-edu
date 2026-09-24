const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const rootDir = path.resolve(__dirname, '..');

console.log('🚀 [1/5] Running Next.js Standalone Build...');
execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit' });
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticDir = path.join(rootDir, '.next', 'static');
const standaloneStaticDir = path.join(standaloneDir, '.next', 'static');
const publicDir = path.join(rootDir, 'public');
const standalonePublicDir = path.join(standaloneDir, 'public');

console.log('📦 [2/5] Copying static assets to standalone build...');

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy .next/static -> .next/standalone/.next/static
if (fs.existsSync(staticDir)) {
  copyDir(staticDir, standaloneStaticDir);
  console.log('  ✔ Copied .next/static to standalone');
}

// Copy public -> .next/standalone/public
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, standalonePublicDir);
  console.log('  ✔ Copied public to standalone');
}

console.log('📝 [3/5] Generating Hostinger configuration files (.htaccess & ecosystem)...');

// Generate Hostinger-compatible .htaccess file
const htaccessContent = `# ============================================================================
# Hostinger LiteSpeed / Apache Configuration for Next.js Standalone
# ============================================================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
  RewriteBase /

  # Serve existing static assets directly (CSS, JS, images, SVG, fonts)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
</IfModule>

# Prevent viewing source code of server.js and .env
<FilesMatch "^(server\\.js|app\\.js|\\.env.*|ecosystem.*|package\\.json)$">
  Order allow,deny
  Deny from all
</FilesMatch>
`;

fs.writeFileSync(path.join(standaloneDir, '.htaccess'), htaccessContent, 'utf8');

// Copy ecosystem.config.cjs if present
const ecosystemSrc = path.join(rootDir, 'ecosystem.config.cjs');
if (fs.existsSync(ecosystemSrc)) {
  fs.copyFileSync(ecosystemSrc, path.join(standaloneDir, 'ecosystem.config.cjs'));
}

// Copy .env and .env.example into standalone bundle
const envSrc = path.join(rootDir, '.env');
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, path.join(standaloneDir, '.env'));
  console.log('  ✔ Included active .env into deployment bundle');
}

const envExampleSrc = path.join(rootDir, '.env.example');
if (fs.existsSync(envExampleSrc)) {
  fs.copyFileSync(envExampleSrc, path.join(standaloneDir, '.env.example'));
}

console.log('🗜️  [4/5] Compressing standalone bundle into hostinger-deploy.zip...');

const zipPath = path.join(rootDir, 'hostinger-deploy.zip');

function createZipArchive() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = new archiver.ZipArchive({
      zlib: { level: 9 },
    });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`\n✅ [5/5] Successfully created bundle: ${zipPath} (${sizeMB} MB)`);
      resolve(true);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(standaloneDir, false);
    archive.finalize();
  });
}

createZipArchive().catch((err) => {
  console.error('Fatal zip creation error:', err);
  process.exit(1);
});
