---
name: Earth & Air
colors:
  surface: '#fbfbe2'
  surface-dim: '#dbdcc3'
  surface-bright: '#fbfbe2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f5dc'
  surface-container: '#efefd7'
  surface-container-high: '#eaead1'
  surface-container-highest: '#e4e4cc'
  on-surface: '#1b1d0e'
  on-surface-variant: '#56423d'
  inverse-surface: '#303221'
  inverse-on-surface: '#f2f2d9'
  outline: '#89726c'
  outline-variant: '#dcc0b9'
  surface-tint: '#9d4227'
  primary: '#9a4025'
  on-primary: '#ffffff'
  primary-container: '#ba573b'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a0'
  secondary: '#486730'
  on-secondary: '#ffffff'
  secondary-container: '#c9eea9'
  on-secondary-container: '#4e6d36'
  tertiary: '#745800'
  on-tertiary: '#ffffff'
  tertiary-container: '#926f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#7e2b12'
  secondary-fixed: '#c9eea9'
  secondary-fixed-dim: '#aed18f'
  on-secondary-fixed: '#0b2000'
  on-secondary-fixed-variant: '#314e1b'
  tertiary-fixed: '#ffdf98'
  tertiary-fixed-dim: '#f5bf22'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#fbfbe2'
  on-background: '#1b1d0e'
  surface-variant: '#e4e4cc'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

The design system is centered on "Tactile Elegance." It targets a sophisticated audience seeking comfort and artisanal quality. The emotional response should be one of immediate calm, warmth, and a "home-first" mentality.

The style is **Modern Organic**, blending high-end editorial aesthetics with soft, tactile interfaces. It utilizes generous whitespace to allow product photography to breathe, combined with a sophisticated color palette that mimics natural dyes and textile fibers. UI elements are approachable but polished, avoiding clinical sharpness in favor of organic softness.

## Colors

The palette is inspired by natural pigments and clay. 

- **Primary (Terracotta):** Used for high-priority actions and brand accents.
- **Secondary (Sage Green):** Used for "Eco-friendly" or "Natural Material" callouts and secondary buttons.
- **Tertiary (Mustard):** Used sparingly for alerts, badges, or special "Limited Edition" markers.
- **Surface Colors:** Light Beige and Off-White form the foundation of the UI to ensure a soft, non-stark reading experience. Powder Pink and Soft Orange act as subtle background washes for product categories.

## Typography

This design system uses a high-contrast typographic pairing. **Playfair Display** provides an editorial, premium feel for headlines, suggesting craftsmanship and heritage. **Montserrat** provides a clean, modern balance for functional text, ensuring high legibility for product descriptions and e-commerce flows.

Apply a slight negative letter spacing to large headings to maintain a tight, professional look. Labels should use uppercase with increased letter spacing to distinguish them from body copy.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a 1280px max-width container on desktop, centered with generous margins. 

- **Grid:** 12-column grid for desktop, 4-column for mobile.
- **Rhythm:** Use an 8px base unit. Section vertical spacing should be aggressive (80px+) to maintain the premium, airy feel.
- **Mobile:** Margins shrink to 16px, and stack gaps reduce to 24px to maintain density without clutter.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Soft Ambient Shadows**. 

1. **Surface Tiers:** Use the Off-White as the base background. Use Light Beige for cards and secondary containers to create a "recessed" or "layered" effect without harsh lines.
2. **Shadows:** Avoid pure black shadows. Use a 10-15% opacity version of the Terracotta or a warm Grey (#4A4A4A) for shadows. Shadows should have a large blur radius (20px-40px) and a subtle Y-offset to mimic natural overhead lighting on a soft surface.
3. **Interactive Depth:** On hover, product cards should slightly lift (increase shadow spread) and scale (1.02x) to mimic a physical response.

## Shapes

The shape language is consistently **Rounded**. 

- Standard components (inputs, buttons) use a 12px radius.
- Product cards and featured containers use a 16px radius (`rounded-lg`).
- Promotional banners or high-impact imagery can use 24px (`rounded-xl`) to emphasize the "soft" brand identity.
- Avoid 0px corners entirely; even "sharp" imagery should have a 4px micro-radius.

## Components

### Buttons
- **Primary:** Terracotta background, white text. 12px border-radius. Padding: 16px 32px. Montserrat Bold.
- **Secondary:** Transparent with a 2px Terracotta border or Sage Green background.
- **Tertiary/Ghost:** Light Beige background with Terracotta text.

### Product Cards
- Background: Off-White or Light Beige.
- Images: Should have a subtle 1px inner border in a darker beige to define the edges against white backgrounds.
- Hover state: Image zoom and subtle elevation increase.

### Input Fields
- Background: Off-White.
- Border: 1px Light Beige, turning Terracotta on focus.
- Labels: Small, uppercase Montserrat placed above the field.

### Navigation
- Top-bar: Centered logo in Playfair Display. Links in Montserrat Medium with subtle underline on hover.
- Sticky state: Use a glassmorphic blur (10px) with 90% opacity Off-White background.

### Chips & Tags
- Use for "New Arrival" or "100% Linen."
- Rounded-pill shape with Sage Green or Powder Pink backgrounds and dark-tinted text.