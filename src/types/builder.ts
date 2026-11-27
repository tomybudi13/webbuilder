export type SectionType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'split'
  | 'pricing'
  | 'testimonials'
  | 'faq'
  | 'cta'
  | 'footer';

export type SurfaceTone = 'light' | 'muted' | 'dark';
export type SpacingSize = 'compact' | 'standard' | 'spacious';
export type FontPairingId = 'jakarta-dm' | 'playfair-public' | 'outfit-dm';
export type AccentPresetId = 'cobalt' | 'emerald' | 'slate' | 'amber';
export type ViewportDevice = 'desktop' | 'tablet' | 'mobile';

export type ButtonShape =
  | 'square'
  | 'rounded'
  | 'pill'
  | 'outline'
  | 'pill-outline'
  | 'soft'
  | 'ghost';

export type NavLinkStyle = 'plain' | 'underline' | 'boxed' | 'pill';

export type BackgroundPattern = 'none' | 'grid' | 'dots' | 'gradient-soft' | 'gradient-warm';
export type BackgroundOverlay = 'none' | 'dark' | 'light';

export interface NavLinkItem {
  label: string;
  href: string;
  icon?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  description: string;
  meta?: string;
  price?: string;
  ctaLabel?: string;
  icon?: string;
  features?: string[];
  highlighted?: boolean;
}

export interface BuilderSection {
  id: string;
  type: SectionType;
  label: string;
  variant: 'default' | 'centered' | 'split-left' | 'split-right' | 'columns-2' | 'columns-3';
  surface: SurfaceTone;
  spacing: SpacingSize;
  align: 'left' | 'center';
  brandName?: string;
  brandIcon?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string;
  primaryCta?: string;
  ctaIcon?: string;
  secondaryCta?: string;
  buttonShape?: ButtonShape;
  navLinkStyle?: NavLinkStyle;
  imageUrl?: string;
  imageAlt?: string;
  backgroundImage?: string;
  backgroundOverlay?: BackgroundOverlay;
  backgroundPattern?: BackgroundPattern;
  links?: NavLinkItem[];
  items?: SectionItem[];
}

export interface PageTheme {
  accentId: AccentPresetId;
  accentColor: string;
  fontPairing: FontPairingId;
  radius: 'sharp' | 'rounded' | 'soft';
  buttonShape: ButtonShape;
}

export interface CustomTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  isCustom?: boolean;
  theme: PageTheme;
  sections: BuilderSection[];
}

export interface BuilderProject {
  title: string;
  theme: PageTheme;
  sections: BuilderSection[];
}

export interface UploadedBackground {
  id: string;
  label: string;
  category: string;
  recommendedOverlay: BackgroundOverlay;
  url: string;
}

