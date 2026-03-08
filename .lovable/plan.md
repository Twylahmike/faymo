

# F🩵ymo — Infloww-style SaaS Landing Site

## What we're building

A complete marketing/landing website for **F🩵ymo**, replicating the Infloww.com design and structure. This is the foundation before adding backend functionality.

## Pages & Components

### 1. Landing Page (/)
- **Navbar** — Logo "F🩵ymo", nav links (Features, Pricing, FAQ), CTA buttons (Login, Get Started)
- **Hero Section** — Bold headline about creator/influencer management, subtext, CTA button, hero image/mockup
- **Features Grid** — Cards showcasing key features (Analytics, Messaging, AI Copilot, Vault, etc.) with icons
- **Social Proof** — Testimonials or partner logos
- **How It Works** — 3-step process section
- **CTA Banner** — Final call-to-action before footer

### 2. Pricing Page (/pricing)
- Pricing tiers (Free, Pro, Enterprise) with feature comparison
- Toggle for monthly/yearly billing
- FAQ accordion

### 3. Shared Components
- **Footer** — Links, social icons, copyright
- **Layout wrapper** — Consistent nav + footer across pages

## Design System
- Dark theme primary (matching Infloww's dark aesthetic)
- Accent color: cyan/blue (matching the 🩵 in the brand)
- Update CSS variables in `index.css` for the new palette
- Modern gradients, glass-morphism cards, smooth animations

## File Structure
```text
src/
  components/
    layout/Navbar.tsx, Footer.tsx, Layout.tsx
    landing/Hero.tsx, Features.tsx, HowItWorks.tsx, Testimonials.tsx, CTABanner.tsx
    pricing/PricingCard.tsx, PricingToggle.tsx, PricingFAQ.tsx
  pages/
    Index.tsx (landing)
    Pricing.tsx
```

## Technical Details
- All client-side, no backend yet
- React Router for `/` and `/pricing`
- Tailwind for styling with custom CSS variables
- Lucide icons for feature icons
- Framer-motion-like animations via Tailwind CSS animate
- Fully responsive (mobile-first)

