# Public Assets Directory

Place static website assets (images, logos, icons, fonts, PDFs) in this directory.

## Recommended Sub-folders

- `public/images/` — Hero images, course banners, background graphics
- `public/logos/` — Thread Security brand logos, partner logos, badges
- `public/icons/` — Custom SVG icons, favicons
- `public/fonts/` — Custom font files (if not loaded via Next.js Google Fonts)

## Usage in Next.js

Assets placed in `public/` are served at the root URL path `/`:

```tsx
// Example image usage in Next.js JSX
<img src="/logos/tse-logo.png" alt="TSE Logo" />

// Or using Next.js Image component
import Image from 'next/image';
<Image src="/images/hero-banner.jpg" alt="Hero" width={1200} height={600} />
```
