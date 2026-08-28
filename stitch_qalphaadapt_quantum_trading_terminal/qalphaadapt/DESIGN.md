---
name: QAlphaAdapt
colors:
  surface: '#13131a'
  surface-dim: '#13131a'
  surface-bright: '#393840'
  surface-container-lowest: '#0e0e14'
  surface-container-low: '#1b1b22'
  surface-container: '#1f1f26'
  surface-container-high: '#2a2931'
  surface-container-highest: '#34343c'
  on-surface: '#e4e1eb'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e4e1eb'
  inverse-on-surface: '#303037'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#13131a'
  on-background: '#e4e1eb'
  surface-variant: '#34343c'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-reg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-sm: 12px
  margin-md: 24px
  container-max: 100%
  density: compact
---

## Brand & Style

The design system is engineered for an institutional-grade quantum fintech environment. The brand personality is hyper-precise, cold, and authoritative, designed to instill confidence in algorithmic execution and high-frequency data processing. 

The aesthetic is **Space-Grade Glassmorphism** layered over a **Minimalist / Dark** obsidian foundation. It avoids traditional skeuomorphism in favor of depth created through light-refraction simulations and spectral glows. The interface is high-density, prioritizing information throughput over white space, tailored for professional traders and quantitative analysts. Every visual element must feel like part of a sophisticated, high-performance instrument.

## Colors

This design system utilizes a "Deep Space" palette. The foundation is built on **#0a0a0f (Base)** for total immersion, with **#111118 (Surface)** used for glass containers to provide structural definition.

Accents are strictly functional:
- **Quantum Violet (#8b5cf6):** Used for primary actions, quantum state indicators, and AI-driven insights.
- **High-Frequency Cyan (#06b6d4):** Used for live data streams, connectivity status, and secondary navigation.
- **Semantic Colors:** Emerald Green, Amber, and Rose Red are reserved exclusively for financial performance metrics (Profit/Loss), risk alerts, and system warnings.

Borders utilize **#1f1f2e** to maintain low-contrast structural integrity, occasionally enhanced with subtle 1px glows using the primary accent color to indicate active states.

## Typography

Typography is bifurcated by function: **Inter** handles all UI labels, navigation, and structural messaging, while **JetBrains Mono** is mandatory for all numerical data, currency (₹), and algorithmic metrics.

The monospaced font ensures that high-frequency data updates do not cause layout shifts (tabular figures) and allows for rapid vertical scanning of price columns. Headlines use tight letter spacing and heavy weights to appear "instrument-like," while labels utilize uppercase tracking for increased legibility at small scales. All currency values must be prefixed with the ₹ symbol and formatted to a minimum of two decimal places.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a 12-column structure, optimized for multi-monitor setups. It favors a "Dashboard-First" approach where margins are kept lean (12-16px) to maximize the "Data-to-Ink" ratio.

The spacing rhythm follows a 4px base unit. Component density is set to "Compact," minimizing vertical padding to ensure the maximum amount of tabular data is visible without scrolling. 

- **Desktop:** Sidebar navigation (64px collapsed / 240px expanded), 16px gutters.
- **Tablet:** 12px gutters, horizontal scroll for wide data tables.
- **Mobile:** Single column, 12px margins, critical metrics only.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows. 

1. **Base Layer:** #0a0a0f (The void).
2. **Surface Layer:** #111118 with 60% opacity and a 20px backdrop-blur.
3. **Interactive Layer:** 1px solid border (#1f1f2e). When active or hovered, the border transitions to a 1px glow of #8b5cf6 with a subtle outer spread of 4px.

Elements do not "float" in a physical sense; they appear as backlit glass panes integrated into the cockpit of the application.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This slight rounding prevents the UI from feeling aggressive while maintaining a technical, structured appearance. 

Containers use 4px radii, while internal elements like input fields or buttons utilize the same for consistency. The only exception is the "Pill" shape, used exclusively for status indicators (e.g., "Live," "Executing," "Halted") to differentiate them from interactive buttons.

## Components

- **Buttons:** Strictly flat. Primary buttons use a solid #8b5cf6 background with white text. Secondary buttons use a #1f1f2e border with no background. Ghost buttons are reserved for utility actions.
- **Data Tables:** Zebra-striping is forbidden. Use 1px #1f1f2e horizontal dividers. The header row must use `label-caps` typography with a #111118 background.
- **Cards/Modules:** Must use the glassmorphic style (Backdrop-blur: 20px, Background: #111118 at 80% opacity).
- **Input Fields:** Recessed appearance. Background: #0a0a0f, Border: #1f1f2e. On focus, the border glows Cyan (#06b6d4).
- **Chips:** Monospaced text only. No icons. Used for tags like "QUANTUM-7" or "HFT-CORE".
- **Financial Sparklines:** 1.5px stroke width. Emerald Green for positive trends, Rose Red for negative. No fills.
- **Currency Display:** Always JetBrains Mono. Use color coding for the entire value (including symbol) based on price movement relative to the previous tick.