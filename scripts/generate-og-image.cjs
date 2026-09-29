const fs = require('fs');
const sharp = require('sharp');

async function generateOgImage() {
  const width = 1200;
  const height = 630;
  
  // Load the transparent shield
  const shieldTrimmed = await sharp('scripts/shield_transparent.png').trim().toBuffer();
  // Resize shield to height 450px
  const shieldResized = await sharp(shieldTrimmed).resize({ height: 450, fit: 'inside' }).toBuffer();
  
  // Vector SVG overlay without problematic emoji characters
  const textSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="45%" stop-color="#091224"/>
        <stop offset="100%" stop-color="#030712"/>
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10B981"/>
        <stop offset="50%" stop-color="#06B6D4"/>
        <stop offset="100%" stop-color="#38BDF8"/>
      </linearGradient>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(30, 41, 59, 0.8)"/>
        <stop offset="100%" stop-color="rgba(15, 23, 42, 0.6)"/>
      </linearGradient>
      <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#10B981" stop-opacity="0.3"/>
        <stop offset="60%" stop-color="#06B6D4" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    
    <!-- Cybersecurity Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    
    <!-- Cyber Grid Line Pattern -->
    <g opacity="0.08" stroke="#38BDF8" stroke-width="1">
      <line x1="0" y1="105" x2="1200" y2="105"/>
      <line x1="0" y1="210" x2="1200" y2="210"/>
      <line x1="0" y1="315" x2="1200" y2="315"/>
      <line x1="0" y1="420" x2="1200" y2="420"/>
      <line x1="0" y1="525" x2="1200" y2="525"/>
      <line x1="240" y1="0" x2="240" y2="630"/>
      <line x1="480" y1="0" x2="480" y2="630"/>
      <line x1="720" y1="0" x2="720" y2="630"/>
      <line x1="960" y1="0" x2="960" y2="630"/>
    </g>

    <!-- Radial Glow Behind Logo Shield -->
    <circle cx="240" cy="315" r="230" fill="url(#shieldGlow)" />
    
    <!-- Top Pill Category Badge -->
    <rect x="470" y="68" width="360" height="34" rx="17" fill="rgba(16, 185, 129, 0.12)" stroke="#10B981" stroke-width="1.2"/>
    <circle cx="488" cy="85" r="4.5" fill="#10B981"/>
    <text x="502" y="90" fill="#34D399" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2">
      PREMIER CYBER DEFENSE INSTITUTE
    </text>

    <!-- Brand Title -->
    <text x="470" y="165" fill="#FFFFFF" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="46" font-weight="900" letter-spacing="-0.5">
      THREAD SECURITY
    </text>
    <text x="470" y="224" fill="url(#glowGrad)" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="46" font-weight="900" letter-spacing="-0.5">
      EDUCATION
    </text>

    <!-- Value Proposition -->
    <text x="470" y="280" fill="#F1F5F9" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="700">
      Expert-Led Cybersecurity &amp; AI Training
    </text>
    <text x="470" y="318" fill="#94A3B8" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="500">
      Ethical Hacking  •  SOC Analyst  •  DevSecOps  •  AI Security
    </text>

    <!-- Key Offerings Badges -->
    <g transform="translate(470, 360)">
      <!-- Badge 1 -->
      <rect x="0" y="0" width="195" height="38" rx="8" fill="url(#badgeGrad)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1"/>
      <circle cx="18" cy="19" r="4" fill="#10B981"/>
      <text x="32" y="24" fill="#E2E8F0" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600">
        100% Practical Labs
      </text>

      <!-- Badge 2 -->
      <rect x="210" y="0" width="185" height="38" rx="8" fill="url(#badgeGrad)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1"/>
      <circle cx="228" cy="19" r="4" fill="#38BDF8"/>
      <text x="242" y="24" fill="#E2E8F0" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600">
        1-on-1 Mentorship
      </text>

      <!-- Badge 3 -->
      <rect x="410" y="0" width="195" height="38" rx="8" fill="url(#badgeGrad)" stroke="rgba(139, 92, 246, 0.3)" stroke-width="1"/>
      <circle cx="428" cy="19" r="4" fill="#A78BFA"/>
      <text x="442" y="24" fill="#E2E8F0" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600">
        Placement Support
      </text>
    </g>

    <!-- Authority & Proof Footer Bar -->
    <g transform="translate(470, 445)">
      <rect x="0" y="0" width="670" height="92" rx="14" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.2"/>
      
      <!-- Left Column: Certifications -->
      <text x="25" y="38" fill="#F8FAFC" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="700">
        Govt. of India DPIIT Recognized
      </text>
      <text x="25" y="64" fill="#64748B" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="500">
        ISO 9001:2015 Quality Certified
      </text>

      <!-- Divider 1 -->
      <line x1="280" y1="20" x2="280" y2="72" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

      <!-- Center Column: Rating -->
      <text x="305" y="38" fill="#FBBF24" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="800">
        ★ 4.9 / 5.0 Rating
      </text>
      <text x="305" y="64" fill="#94A3B8" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="500">
        1,280+ Certified Students
      </text>

      <!-- Divider 2 -->
      <line x1="495" y1="20" x2="495" y2="72" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

      <!-- Right Column: Domain -->
      <text x="518" y="44" fill="#38BDF8" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="800">
        threadsecurity.in
      </text>
      <text x="518" y="64" fill="#64748B" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="1">
        LEARN • BUILD • DEFEND
      </text>
    </g>
  </svg>
  `;

  const finalOgImage = await sharp(Buffer.from(textSvg))
    .composite([
      {
        input: shieldResized,
        left: 55,
        top: 90
      }
    ])
    .png({ quality: 95 })
    .toBuffer();

  fs.writeFileSync('public/images/og-thread-security-education.png', finalOgImage);
  fs.writeFileSync('app/opengraph-image.png', finalOgImage);
  console.log('Regenerated clean, pixel-perfect og-thread-security-education.png and app/opengraph-image.png!');
}

generateOgImage().catch(console.error);
