# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

(nothing here - leave empty for future changes)

## [1.2.0] - 2026-04-08

### Removed
- Credibility strip section from index.html, workshops.html, and related CSS

## [1.1.0] - 2026-04-07

### Added
- Separate Google Apps Script endpoints for each form (contact, workshop, partner)
- Submit button disable/enable during form submission to prevent double-submits
- `.btn:disabled` CSS style for visual feedback during submission
- `--color-success` and `--color-error` CSS custom properties for both light and dark themes
- Subtle box shadows on all card elements (service items, grid cards, workshop cards, partner form, CTA card)
- Dark mode overrides for CTA card section (proper background, text, and link colors)
- Explicit `h3` font sizing (1.375rem) for clear typographic hierarchy
- 480px breakpoint for CTA card padding on small screens

### Changed
- Border color tokens from solid hex to semi-transparent `rgba` values for softer appearance
- Button hover states: primary buttons now darken on hover with consistent white text
- Dark mode primary buttons use dark text on light accent background for better contrast
- Touch targets (`.btn-sm`, `.theme-toggle`, `.mobile-nav-toggle`) now meet 44×44px minimum
- Body text minimum enforced: `.service-desc` and `.workshop-desc` bumped from 0.95rem to 1rem
- `.workshop-badge` font size bumped from 0.75rem to 0.8rem with improved padding
- `.workshop-grid` minimum column width reduced from 320px to 280px for better mobile fit
- Mobile hamburger menu gap normalized to 8px spacing grid
- Hero buttons now full-width on mobile (≤768px)
- Header "Contact Us" button hidden on mobile to reduce nav crowding

### Fixed
- Invalid CSS in `.section-subtitle`: `-var(--space-md)` corrected to `calc(-1 * var(--space-md))`
- Dark mode CTA card section no longer inverts to light background

### Removed
- `inquiryType` field from workshop and partner form payloads (no longer needed with separate endpoints)

## [1.0.0] - 2026-04-06

### Added
- Initial landing page release
- Three-page structure: index, partner, workshops
- Dark mode support with localStorage persistence
- Mobile responsive navigation
- Google Apps Script form integration
- CSS custom properties design system
