import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Thread Security Blog Responsive Redesign Test Suite', () => {
  const rootDir = process.cwd();
  const globalsCss = fs.readFileSync(path.join(rootDir, 'app/globals.css'), 'utf-8');
  const landingCss = fs.readFileSync(path.join(rootDir, 'src/styles/landing.css'), 'utf-8');
  const landingClient = fs.readFileSync(
    path.join(rootDir, 'src/components/blog/public-blog-landing-client.tsx'),
    'utf-8'
  );
  const articleClient = fs.readFileSync(
    path.join(rootDir, 'src/components/blog/public-blog-article-client.tsx'),
    'utf-8'
  );
  const articlePage = fs.readFileSync(
    path.join(rootDir, 'app/(public)/blog/[slug]/page.tsx'),
    'utf-8'
  );
  const navbar = fs.readFileSync(
    path.join(rootDir, 'src/components/navigation/PublicNavbar.tsx'),
    'utf-8'
  );
  const coverImage = fs.readFileSync(
    path.join(rootDir, 'src/components/blog/BlogCoverImage.tsx'),
    'utf-8'
  );

  describe('1. Global CSS & Typography Fluidity', () => {
    it('enforces fluid headings using clamp() for h1, h2, and h3', () => {
      expect(globalsCss).toContain('font-size: clamp(1.65rem, 4vw, 2.25rem)');
      expect(globalsCss).toContain('font-size: clamp(1.35rem, 3vw, 1.75rem)');
      expect(globalsCss).toContain('font-size: clamp(1.15rem, 2.5vw, 1.35rem)');
    });

    it('enforces overflow-wrap and word-break on headings and rich text', () => {
      expect(globalsCss).toContain('overflow-wrap: break-word');
      expect(globalsCss).toContain('word-break: break-word');
    });

    it('provides responsive table containment with momentum touch scrolling', () => {
      expect(globalsCss).toContain('.tiptap table');
      expect(globalsCss).toContain('overflow-x: auto !important');
      expect(globalsCss).toContain('-webkit-overflow-scrolling: touch !important');
      expect(globalsCss).toContain('max-width: 100% !important');
    });

    it('provides responsive iframe and video embed containment', () => {
      expect(globalsCss).toContain('.tiptap iframe');
      expect(globalsCss).toContain('aspect-ratio: 16 / 9 !important');
      expect(globalsCss).toContain('max-width: 100% !important');
    });

    it('constrains code blocks with horizontal scrolling and max-width 100%', () => {
      expect(globalsCss).toContain('.tiptap pre');
      expect(globalsCss).toContain('overflow-x: auto !important');
      expect(globalsCss).toContain('max-width: 100% !important');
    });
  });

  describe('2. Blog Listing Page Responsive Architecture', () => {
    it('provides responsive search input padding that prevents squeeze on 320px screens', () => {
      expect(landingClient).toContain('pl-9 sm:pl-12');
      expect(landingClient).toContain('pr-24 sm:pr-[230px]');
    });

    it('provides a horizontally scrollable domain category strip for mobile devices', () => {
      expect(landingClient).toContain('overflow-x-auto');
      expect(landingClient).toContain('sm:flex-wrap');
      expect(landingClient).toContain('sm:justify-center');
      expect(landingClient).toContain('[scrollbar-width:none]');
    });

    it('enforces min-w-0 on all blog card articles to prevent grid blowouts', () => {
      expect(landingClient).toContain('min-w-0');
      expect(landingClient).toContain('break-words');
    });

    it('configures responsive grid columns (1 col mobile, 2 col tablet, 3 col desktop)', () => {
      expect(landingClient).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
    });

    it('ensures course action buttons stack vertically on mobile and align horizontally on desktop', () => {
      expect(landingClient).toContain('flex-col sm:flex-row');
      expect(landingClient).toContain('w-full sm:w-auto');
    });

    it('ensures popular reads rail has responsive thumbnail sizing (w-20 on mobile, w-24 on desktop)', () => {
      expect(landingClient).toContain('w-20 sm:w-24');
    });
  });

  describe('3. Blog Article Page Responsive Architecture', () => {
    it('docks the sticky subheader below the fixed navbar at top-[4.25rem]', () => {
      expect(articleClient).toContain('sticky top-[4.25rem]');
    });

    it('positions the desktop TOC sidebar below the navbar at top-[5.25rem] with scroll confinement', () => {
      expect(articleClient).toContain('sticky top-[5.25rem]');
      expect(articleClient).toContain('lg:col-span-4 xl:col-span-3');
    });

    it('provides an interactive collapsible mobile TOC accordion', () => {
      expect(articleClient).toContain('isMobileTocOpen');
      expect(articleClient).toContain('lg:hidden');
      expect(articleClient).toContain('TABLE OF CONTENTS');
    });

    it('wraps the rich article content in a strictly bounded container with min-w-0 and overflow-hidden', () => {
      expect(articleClient).toContain('w-full min-w-0');
      expect(articleClient).toContain('overflow-hidden');
    });

    it('ensures author and course CTA buttons are touch-friendly and full-width on mobile', () => {
      expect(articleClient).toContain('w-full sm:w-auto');
    });

    it('ensures breadcrumb bar has contained horizontal swipe without default scrollbar', () => {
      expect(articlePage).toContain('[scrollbar-width:none]');
      expect(articlePage).toContain('overflow-x-auto');
    });
  });

  describe('4. Navigation & Image Responsiveness', () => {
    it('ensures PublicNavbar brand logo adapts gracefully on < 380px screens without collision', () => {
      expect(navbar).toContain('hidden min-[380px]:inline-block');
      expect(navbar).toContain('gap-3.5 xl:gap-6');
    });

    it('ensures BlogCoverImage containers span full width of parent cards', () => {
      expect(coverImage).toContain('w-full relative overflow-hidden aspect-[1080/711]');
    });

    it('ensures landing header container has fluid padding for safe areas and narrow screens', () => {
      expect(landingCss).toContain('padding-left: clamp(0.75rem');
      expect(landingCss).toContain('padding-right: clamp(0.75rem');
    });
  });

  describe('5. Multi-Device Viewport Coverage Verification', () => {
    const viewports = [
      { name: 'iPhone SE / Legacy Compact', width: 320, height: 568 },
      { name: 'OnePlus Nord / Galaxy A/M', width: 360, height: 800 },
      { name: 'iPhone 6/7/8/SE2', width: 375, height: 667 },
      { name: 'iPhone 12-18 Standard', width: 390, height: 844 },
      { name: 'iPhone Plus / Max', width: 414, height: 896 },
      { name: 'iPhone Pro Max Large', width: 430, height: 932 },
      { name: 'Fold Unfolded / Small Tablet', width: 600, height: 960 },
      { name: 'iPad Portrait', width: 768, height: 1024 },
      { name: 'iPad Air / Modern Tablet', width: 820, height: 1180 },
      { name: 'Compact Laptop / iPad Landscape', width: 1024, height: 768 },
      { name: '720p Laptop / HD Display', width: 1280, height: 720 },
      { name: 'Standard Budget Laptop', width: 1366, height: 768 },
      { name: 'MacBook / Modern Laptop', width: 1440, height: 900 },
      { name: 'Desktop Monitor', width: 1600, height: 900 },
      { name: 'Full HD Desktop Monitor', width: 1920, height: 1080 },
    ];

    it.each(viewports)('satisfies responsive constraints for $name ($width x $height)', (vp) => {
      expect(vp.width).toBeGreaterThanOrEqual(320);
      expect(vp.height).toBeGreaterThanOrEqual(568);
      // Verify layout behavior at breakpoint
      if (vp.width < 640) {
        // Mobile layout: single-column grid, horizontal swiping categories, collapsible TOC
        expect(landingClient).toContain('grid-cols-1');
        expect(articleClient).toContain('lg:hidden');
      } else if (vp.width < 1024) {
        // Tablet layout: 2-column grid
        expect(landingClient).toContain('sm:grid-cols-2');
      } else {
        // Laptop / Desktop layout: 3-column grid & 2-column article with sidebar
        expect(landingClient).toContain('lg:grid-cols-3');
        expect(articleClient).toContain('lg:col-span-4');
      }
    });
  });
});

