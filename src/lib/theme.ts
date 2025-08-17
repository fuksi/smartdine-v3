// Theme configuration for SmartDine
// This file contains the brand colors and theme settings

export const theme = {
  colors: {
    // Primary brand color - can be easily changed here
    primary: {
      main: "#5EB1BF", // Teal blue
      hover: "#4A9BAB",
      light: "#E8F4F6",
      dark: "#3A7A86",
    },

    // Secondary brand color (orange from the UI)
    secondary: {
      main: "#FF6B35", // Orange
      hover: "#E55A2B",
      light: "#FFF1EC",
      dark: "#CC5429",
    },

    // Status colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Neutral colors
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  },

  // Spacing and sizing
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },

  // Border radius
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  // Typography
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },

  // Shadows
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
};

// Helper function to convert hex to HSL for CSS variables
export function hexToHSL(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
    l * 100
  )}%`;
}

// Generate CSS custom properties
export function generateCSSCustomProperties(): Record<string, string> {
  return {
    "--brand-primary": hexToHSL(theme.colors.primary.main),
    "--brand-primary-hover": hexToHSL(theme.colors.primary.hover),
    "--brand-primary-light": hexToHSL(theme.colors.primary.light),
    "--brand-secondary": hexToHSL(theme.colors.secondary.main),
    "--brand-secondary-hover": hexToHSL(theme.colors.secondary.hover),
    "--brand-secondary-light": hexToHSL(theme.colors.secondary.light),
    "--success": hexToHSL(theme.colors.success),
    "--warning": hexToHSL(theme.colors.warning),
    "--error": hexToHSL(theme.colors.error),
    "--info": hexToHSL(theme.colors.info),
  };
}
