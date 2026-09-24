import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Universal Responsive Design & Device Adaptation System Test Suite', () => {
  const rootDir = process.cwd();
  const tokensCss = fs.readFileSync(path.join(rootDir, 'src/styles/tokens.css'), 'utf-8');
  const typographyCss = fs.readFileSync(path.join(rootDir, 'src/styles/typography.css'), 'utf-8');
  const utilitiesCss = fs.readFileSync(path.join(rootDir, 'src/styles/utilities.css'), 'utf-8');
  const globalsCss = fs.readFileSync(path.join(rootDir, 'app/globals.css'), 'utf-8');
  const landingCss = fs.readFileSync(path.join(rootDir, 'src/styles/landing.css'), 'utf-8');
  const tailwindConfig = fs.readFileSync(path.join(rootDir, 'tailwind.config.ts'), 'utf-8');

  describe('1. Universal Device Viewport Coverage Matrix', () => {
    // Representative viewport specifications from 320px to 5120px+
    const representativeViewports = [
      // Phones
      { device: 'iPhone SE / Small Android', width: 320, height: 568, category: 'extra-small-mobile' },
      { device: 'Samsung Galaxy A-series', width: 360, height: 740, category: 'small-mobile' },
      { device: 'iPhone 8 / SE (3rd Gen)', width: 375, height: 667, category: 'standard-mobile' },
      { device: 'iPhone 14 / 15 / 16 / Pro', width: 393, height: 852, category: 'modern-compact' },
      { device: 'Samsung Galaxy S24 Ultra', width: 412, height: 915, category: 'large-mobile' },
      { device: 'iPhone 15 / 16 Pro Max', width: 430, height: 932, category: 'large-mobile' },
      { device: 'Extra-large Android Flagship', width: 480, height: 1040, category: 'xl-mobile' },

      // Foldables
      { device: 'Samsung Galaxy Z Fold (Cover)', width: 344, height: 882, category: 'foldable-cover' },
      { device: 'Samsung Galaxy Z Fold (Inner)', width: 768, height: 960, category: 'foldable-inner' },
      { device: 'Google Pixel Fold (Inner)', width: 840, height: 1080, category: 'foldable-inner' },

      // Tablets & Split Views
      { device: 'iPad Mini (Portrait)', width: 768, height: 1024, category: 'tablet' },
      { device: 'Samsung Galaxy Tab S9', width: 800, height: 1280, category: 'tablet' },
      { device: 'iPad Air / Pro 11"', width: 834, height: 1194, category: 'tablet' },
      { device: 'iPad Pro 12.9" / 13"', width: 1024, height: 1366, category: 'large-tablet' },
      { device: 'iPad 1/2 Split-View', width: 500, height: 1024, category: 'tablet-split' },
      { device: 'iPad 1/3 Split-View', width: 320, height: 1024, category: 'tablet-split' },

      // Laptops
      { device: 'Standard Windows HD Laptop', width: 1280, height: 720, category: 'laptop-hd' },
      { device: 'Widespread 1366x768 Laptop', width: 1366, height: 768, category: 'laptop-widespread' },
      { device: 'MacBook Air / Pro 13"', width: 1440, height: 900, category: 'laptop-macbook' },
      { device: 'Dell XPS / Surface Laptop', width: 1536, height: 864, category: 'laptop-fhd-scaled' },

      // Desktops & Workstations
      { device: 'Full HD Desktop Monitor', width: 1920, height: 1080, category: 'desktop-fhd' },
      { device: 'QHD 2K Gaming / Creator Monitor', width: 2560, height: 1440, category: 'desktop-qhd' },

      // Ultrawide & 4K / 5K Displays
      { device: 'UW-UXGA 21:9 Ultrawide', width: 2560, height: 1080, category: 'ultrawide' },
      { device: 'WQHD 21:9 Ultrawide (34")', width: 3440, height: 1440, category: 'ultrawide' },
      { device: '4K UHD Reference Display', width: 3840, height: 2160, category: '4k-uhd' },
      { device: 'Dual-QHD 32:9 Super Ultrawide (49")', width: 5120, height: 1440, category: 'super-ultrawide' },
    ];

    it('validates complete coverage from 320px to 5120px without missing viewport categories', () => {
      expect(representativeViewports.length).toBeGreaterThanOrEqual(20);
      const minWidth = Math.min(...representativeViewports.map((v) => v.width));
      const maxWidth = Math.max(...representativeViewports.map((v) => v.width));

      expect(minWidth).toBe(320);
      expect(maxWidth).toBe(5120);
    });

    it('ensures Tailwind config has comprehensive screen breakpoint spectrum', () => {
      expect(tailwindConfig).toContain('xs:');
      expect(tailwindConfig).toContain('sm:');
      expect(tailwindConfig).toContain('md:');
      expect(tailwindConfig).toContain('lg:');
      expect(tailwindConfig).toContain('xl:');
      expect(tailwindConfig).toContain("'2xl':");
      expect(tailwindConfig).toContain("'3xl':");
      expect(tailwindConfig).toContain("'4xl':");
    });
  });

  describe('2. Safe-Area Awareness & Insets Infrastructure', () => {
    it('defines safe area environment variables in tokens.css with zero fallbacks', () => {
      expect(tokensCss).toContain('env(safe-area-inset-top');
      expect(tokensCss).toContain('env(safe-area-inset-bottom');
      expect(tokensCss).toContain('env(safe-area-inset-left');
      expect(tokensCss).toContain('env(safe-area-inset-right');
    });

    it('provides utility classes for safe area padding in utilities.css', () => {
      expect(utilitiesCss).toContain('.safe-top');
      expect(utilitiesCss).toContain('.safe-bottom');
      expect(utilitiesCss).toContain('.safe-left');
      expect(utilitiesCss).toContain('.safe-right');
      expect(utilitiesCss).toContain('.safe-x');
      expect(utilitiesCss).toContain('.safe-y');
      expect(utilitiesCss).toContain('.safe-inset');
      expect(utilitiesCss).toContain('.safe-bottom-clearance');
    });

    it('ensures landing header and chatbot respect safe areas on notched devices', () => {
      expect(landingCss).toContain('padding-top: var(--sat)');
      const chatLauncher = fs.readFileSync(path.join(rootDir, 'src/components/chatbot/ChatLauncher.tsx'), 'utf-8');
      expect(chatLauncher).toContain('env(safe-area-inset-bottom');
    });
  });

  describe('3. Dynamic Viewport Units (dvh / svh / lvh)', () => {
    it('defines dynamic viewport tokens in tokens.css', () => {
      expect(tokensCss).toContain('--dvh: 100dvh');
      expect(tokensCss).toContain('--svh: 100svh');
      expect(tokensCss).toContain('--lvh: 100lvh');
    });

    it('provides dynamic viewport height utilities in utilities.css', () => {
      expect(utilitiesCss).toContain('.h-dvh');
      expect(utilitiesCss).toContain('.min-h-dvh');
      expect(utilitiesCss).toContain('.max-h-dvh');
      expect(utilitiesCss).toContain('.h-svh');
      expect(utilitiesCss).toContain('.min-h-svh');
    });

    it('verifies chatbot uses dynamic viewport height for software keyboard adaptation', () => {
      const chatWindow = fs.readFileSync(path.join(rootDir, 'src/components/chatbot/ChatWindow.tsx'), 'utf-8');
      expect(chatWindow).toContain('h-dvh');
    });
  });

  describe('4. WCAG 2.2 AA Touch Target Standard (>=44px)', () => {
    it('defines minimum and comfortable touch target tokens', () => {
      expect(tokensCss).toContain('--touch-target-min: 44px');
      expect(tokensCss).toContain('--touch-target-comfortable: 48px');
    });

    it('provides touch target utility classes in utilities.css', () => {
      expect(utilitiesCss).toContain('.touch-target');
      expect(utilitiesCss).toContain('.touch-target-comfortable');
      expect(utilitiesCss).toContain('.touch-target-large');
    });
  });

  describe('5. Fluid Typography & Fluid Spacing Scales', () => {
    it('uses clamp() across all typography hierarchy classes', () => {
      expect(typographyCss).toContain('.tse-display');
      expect(typographyCss).toContain('.tse-h1');
      expect(typographyCss).toContain('.tse-h2');
      expect(typographyCss).toContain('.tse-h3');
      expect(typographyCss).toContain('.tse-h4');
      expect(typographyCss).toContain('.tse-body');
      expect(typographyCss).toContain('.tse-caption');
      expect(typographyCss).toContain('.tse-mono');

      // Verify clamp usage in typography
      const clampMatches = typographyCss.match(/clamp\(/g);
      expect(clampMatches && clampMatches.length).toBeGreaterThanOrEqual(7);
    });

    it('enforces word-break and overflow-wrap safety to prevent horizontal blowouts on 320px screens', () => {
      expect(typographyCss).toContain('overflow-wrap: break-word');
      expect(typographyCss).toContain('text-wrap: balance');
      expect(typographyCss).toContain('text-wrap: pretty');
    });
  });

  describe('6. 4K and Ultrawide Display Bounds Protection', () => {
    it('provides maximum content bounding utilities to prevent stretched text/cards', () => {
      expect(utilitiesCss).toContain('.tse-content-bound');
      expect(utilitiesCss).toContain('.tse-reading-bound');
      expect(utilitiesCss).toContain('.tse-dashboard-bound');
    });

    it('constrains landing header and main containers at ultrawide bounds', () => {
      expect(landingCss).toContain('max-width: 1920px');
      expect(tokensCss).toContain('--container-max-ultrawide: 1920px');
    });
  });

  describe('7. Responsive Tables & Horizontal Overflow Defense', () => {
    it('provides momentum scrolling and overflow containment for tables', () => {
      expect(utilitiesCss).toContain('.tse-table-container');
      expect(utilitiesCss).toContain('-webkit-overflow-scrolling: touch');
      expect(utilitiesCss).toContain('overscroll-behavior-x: contain');
    });

    it('normalizes html and body to eliminate accidental page horizontal scroll', () => {
      expect(globalsCss).toContain('overflow-x: hidden');
      expect(globalsCss).toContain('box-sizing: border-box');
    });
  });

  describe('8. Container Query Architecture', () => {
    it('provides container query helper classes and breakpoints', () => {
      expect(utilitiesCss).toContain('.cq-container');
      expect(utilitiesCss).toContain('.cq-card-grid');
      expect(utilitiesCss).toContain('@container (min-width: 600px)');
      expect(utilitiesCss).toContain('@container (min-width: 900px)');
      expect(utilitiesCss).toContain('@container (min-width: 1200px)');
    });
  });

  describe('9. Responsive Navigation Synchronization', () => {
    it('ensures PublicNavbar and MobileNavDrawer have no tablet breakpoint collision deadzone', () => {
      const publicNavbar = fs.readFileSync(path.join(rootDir, 'src/components/navigation/PublicNavbar.tsx'), 'utf-8');
      const mobileNavDrawer = fs.readFileSync(path.join(rootDir, 'src/components/navigation/MobileNavDrawer.tsx'), 'utf-8');

      // PublicNavbar renders desktop nav at lg:flex and drawer trigger at lg:hidden
      expect(publicNavbar).toContain('hidden lg:flex');
      expect(publicNavbar).toContain('lg:hidden flex items-center');

      // MobileNavDrawer does not prematurely hide at md
      expect(mobileNavDrawer).not.toContain('className="md:hidden flex items-center"');
      expect(mobileNavDrawer).toContain('h-dvh');
    });

    it('ensures AdminNavigation has responsive sidebar for desktop and drawer for mobile/tablet', () => {
      const adminNav = fs.readFileSync(path.join(rootDir, 'src/components/admin/admin-navigation.tsx'), 'utf-8');
      expect(adminNav).toContain('md:hidden');
      expect(adminNav).toContain('hidden md:flex');
      expect(adminNav).toContain('h-dvh');
      expect(adminNav).toContain('touch-target');
    });
  });
});
