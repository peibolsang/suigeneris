export const categories = [
  {
    slug: "workwear",
    label: "Workwear",
    navLabel: "Workwear",
    kicker: "Origen utilitario",
    description:
      "Chaquetas de faena, denim, botas, chambray y el imaginario industrial que todavía estructura buena parte del menswear.",
  },
  {
    slug: "vintage-americana",
    label: "Vintage Americana",
    navLabel: "Americana",
    kicker: "Archivo americano",
    description:
      "De la iconografía del Oeste al denim japonés, una lectura del mito americano y sus reinterpretaciones contemporáneas.",
  },
  {
    slug: "military-heritage",
    label: "Military Heritage",
    navLabel: "Militaria",
    kicker: "Rastro militar",
    description:
      "Prendas nacidas para la función que acabaron definiendo códigos de estilo civil: parkas, chinos, flight jackets y más.",
  },
  {
    slug: "elevated-casual",
    label: "Elevated Casual",
    navLabel: "Elevated Casual",
    kicker: "Casual afinado",
    description:
      "El terreno donde conviven Aaron Levine, el sportswear civilizado y una noción más madura de la ropa cotidiana.",
  },
  {
    slug: "ivy",
    label: "Ivy",
    navLabel: "Ivy",
    kicker: "Tradición colegial",
    description:
      "Soft tailoring, mocasines, oxford cloth y el largo viaje de un uniforme universitario convertido en lenguaje global.",
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category["slug"];

export const storyTypes = [
  {
    slug: "lo-basico",
    label: "Lo Básico",
    description:
      "Puertas de entrada para entender una prenda, un tejido o un lenguaje del menswear desde sus ideas esenciales.",
  },
  {
    slug: "historia",
    label: "Historia",
    description:
      "Piezas donde el arco principal pasa por el origen, la evolución y la vida cultural de una prenda, marca o material.",
  },
  {
    slug: "variantes",
    label: "Variantes",
    description:
      "Artículos que ordenan familias cercanas y enseñan a distinguir versiones, ramas y diferencias que suelen mezclarse.",
  },
  {
    slug: "iconos",
    label: "Iconos",
    description:
      "Perfiles de prendas, modelos, tejidos y objetos que siguen importando por su forma, su lógica y su peso cultural.",
  },
  {
    slug: "como-llevarlo",
    label: "Cómo llevarlo",
    description:
      "Lecturas orientadas al uso real: combinaciones, equilibrio visual y criterios para integrar una pieza en el armario.",
  },
  {
    slug: "opinion",
    label: "Opinión",
    description:
      "Textos donde manda una tesis editorial clara sobre gusto, método o cultura material dentro del menswear.",
  },
] as const;

export type StoryType = (typeof storyTypes)[number]["label"];
export type StoryTypeSlug = (typeof storyTypes)[number]["slug"];

export function isCategorySlug(value: string): value is CategorySlug {
  return categories.some((category) => category.slug === value);
}

export function isStoryType(value: string): value is StoryType {
  return storyTypes.some((storyType) => storyType.label === value);
}

export function getCategoryBySlug(slug: CategorySlug) {
  return categories.find((category) => category.slug === slug) ?? null;
}

export function getStoryTypeBySlug(slug: string) {
  if (slug === "icono") {
    return storyTypes.find((storyType) => storyType.slug === "iconos") ?? null;
  }

  return storyTypes.find((storyType) => storyType.slug === slug) ?? null;
}

export function getStoryTypeByLabel(label: StoryType) {
  return storyTypes.find((storyType) => storyType.label === label) ?? null;
}
