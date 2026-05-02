export const brandsColors = {
  kromi: {
    bg: "#0166D3",
    cta: "#00162E",
    ctaColor: "#FFFFFF",
    color: "#FFFFFF",
  },
} as const;

export type BrandSlug = keyof typeof brandsColors;
