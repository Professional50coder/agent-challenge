export const theme = {
  primary: {
    DEFAULT: "hsl(222.2 47.4% 11.2%)",
    foreground: "hsl(210 40% 98%)",
  },
  secondary: {
    DEFAULT: "hsl(210 40% 96.1%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  muted: {
    DEFAULT: "hsl(210 40% 96.1%)",
    foreground: "hsl(215.4 16.3% 46.9%)",
  },
  accent: {
    DEFAULT: "hsl(210 40% 96.1%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  popover: {
    DEFAULT: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  card: {
    DEFAULT: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  risk: {
    critical: "hsl(0 84.2% 60.2%)",
    high: "hsl(20 84.2% 60.2%)",
    medium: "hsl(48 96.5% 53.9%)",
    low: "hsl(142.1 76.2% 36.3%)",
    info: "hsl(221.2 83.2% 53.3%)",
  },
} as const;

export type Theme = typeof theme;