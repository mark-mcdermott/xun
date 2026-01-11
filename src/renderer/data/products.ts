export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  printfulSyncVariantId: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // in cents
  images: string[];
  colorImages?: Record<string, string[]>; // color name -> array of image URLs
  category: 'tshirt' | 'hoodie' | 'sticker';
  printfulProductId: number;
  variants: ProductVariant[];
}

export const products: Product[] = [
  {
    id: 'xun-mech-hoodie',
    slug: 'xun-mech-hoodie',
    name: 'Soft Mech Pullover Hoodie',
    description: 'Super comfy pullover hoodie. The front has the Xun mech small saying, "form is emptiness, emptiness is form". The back has the mech large with "XUN" under it.',
    price: 3500, // $35.00
    images: [
      new URL('../assets/merch/hoodie-black-front.png', import.meta.url).href,
    ],
    colorImages: {
      'Black': [
        new URL('../assets/merch/hoodie-black-front.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-black-back.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-black-left.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-black-front-solo.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-black-back-solo.png', import.meta.url).href,
      ],
      'Heather Navy': [
        new URL('../assets/merch/hoodie-navy-front.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-navy-back.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-navy-left.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-navy-front-solo.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-navy-back-solo.png', import.meta.url).href,
      ],
      'Heather Forest': [
        new URL('../assets/merch/hoodie-forest-front.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-forest-back.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-forest-left.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-forest-front-solo.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-forest-back-solo.png', import.meta.url).href,
      ],
      'White': [
        new URL('../assets/merch/hoodie-white-front.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-white-back.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-white-left.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-white-front-solo.png', import.meta.url).href,
        new URL('../assets/merch/hoodie-white-back-solo.png', import.meta.url).href,
      ],
    },
    category: 'hoodie',
    printfulProductId: 0,
    variants: [
      // Black
      { id: 'hoodie-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '6906a05f07fa2', inStock: true },
      { id: 'hoodie-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '6906a05f07242', inStock: true },
      { id: 'hoodie-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '6906a05f07298', inStock: true },
      { id: 'hoodie-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '6906a05f072a3', inStock: true },
      // Heather Forest
      { id: 'hoodie-forest-s', size: 'S', color: 'Heather Forest', colorHex: '#2d4a3e', printfulSyncVariantId: '6906a05f07416', inStock: true },
      { id: 'hoodie-forest-m', size: 'M', color: 'Heather Forest', colorHex: '#2d4a3e', printfulSyncVariantId: '6906a05f07525', inStock: true },
      { id: 'hoodie-forest-l', size: 'L', color: 'Heather Forest', colorHex: '#2d4a3e', printfulSyncVariantId: '6906a05f07561', inStock: true },
      { id: 'hoodie-forest-xl', size: 'XL', color: 'Heather Forest', colorHex: '#2d4a3e', printfulSyncVariantId: '6906a05f07512', inStock: true },
      // Heather Navy
      { id: 'hoodie-navy-s', size: 'S', color: 'Heather Navy', colorHex: '#374151', printfulSyncVariantId: '6906a05f07379', inStock: true },
      { id: 'hoodie-navy-m', size: 'M', color: 'Heather Navy', colorHex: '#374151', printfulSyncVariantId: '6906a05f073a5', inStock: true },
      { id: 'hoodie-navy-l', size: 'L', color: 'Heather Navy', colorHex: '#374151', printfulSyncVariantId: '6906a05f07406', inStock: true },
      { id: 'hoodie-navy-xl', size: 'XL', color: 'Heather Navy', colorHex: '#374151', printfulSyncVariantId: '6906a05f07452', inStock: true },
      // White
      { id: 'hoodie-white-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6906a05f07642', inStock: true },
      { id: 'hoodie-white-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6906a05f076a5', inStock: true },
      { id: 'hoodie-white-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6906a05f07707', inStock: true },
      { id: 'hoodie-white-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6906a05f07737', inStock: true },
    ]
  },
  {
    id: 'xun-youth-hoodie',
    slug: 'xun-youth-hoodie',
    name: 'Pink Mech Pullover Hoodie',
    description: 'Beautiful light pink pullover hoodie. The front has the Xun mech small saying, "form is emptiness, emptiness is form". The back has the mech large with "XUN" under it.',
    price: 2800, // $28.00
    images: [
      new URL('../assets/merch/youth-hoodie-pink-front-closeup.png', import.meta.url).href,
    ],
    colorImages: {
      'Light Pink': [
        new URL('../assets/merch/youth-hoodie-pink-front-closeup.png', import.meta.url).href,
        new URL('../assets/merch/youth-hoodie-pink-back-closeup.png', import.meta.url).href,
        new URL('../assets/merch/youth-hoodie-pink-front-solo.png', import.meta.url).href,
        new URL('../assets/merch/youth-hoodie-pink-back-solo.png', import.meta.url).href,
        new URL('../assets/merch/youth-hoodie-pink-details.png', import.meta.url).href,
      ],
    },
    category: 'hoodie',
    printfulProductId: 0,
    variants: [
      // Light Pink
      { id: 'youth-hoodie-pink-xs', size: 'XS', color: 'Light Pink', colorHex: '#FFB6C1', printfulSyncVariantId: '6961d95013e4d1', inStock: true },
      { id: 'youth-hoodie-pink-s', size: 'S', color: 'Light Pink', colorHex: '#FFB6C1', printfulSyncVariantId: '6961d95013e572', inStock: true },
      { id: 'youth-hoodie-pink-m', size: 'M', color: 'Light Pink', colorHex: '#FFB6C1', printfulSyncVariantId: '6961d95013e5f2', inStock: true },
      { id: 'youth-hoodie-pink-l', size: 'L', color: 'Light Pink', colorHex: '#FFB6C1', printfulSyncVariantId: '6961d95013e676', inStock: true },
      { id: 'youth-hoodie-pink-xl', size: 'XL', color: 'Light Pink', colorHex: '#FFB6C1', printfulSyncVariantId: '6961d95013e707', inStock: true },
    ]
  },
  {
    id: 'xun-mech-sticker',
    slug: 'xun-mech-sticker',
    name: 'Xun Mech Form Is Emptiness Stickers',
    description: 'High-quality kiss-cut stickers featuring the Xun mech with "form is emptiness, emptiness is form". Available in 3 sizes. Perfect for laptops, water bottles, and notebooks.',
    price: 350, // $3.50 (5.5" is $4.00)
    images: [
      new URL('../assets/merch/sticker-4x4-default.png', import.meta.url).href,
    ],
    colorImages: {
      'White': [
        new URL('../assets/merch/sticker-4x4-default.png', import.meta.url).href,
        new URL('../assets/merch/sticker-4x4-front.png', import.meta.url).href,
        new URL('../assets/merch/sticker-4x4-lifestyle.png', import.meta.url).href,
        new URL('../assets/merch/sticker-3x3-default.png', import.meta.url).href,
        new URL('../assets/merch/sticker-5x5-default.png', import.meta.url).href,
      ],
    },
    category: 'sticker',
    printfulProductId: 0,
    variants: [
      { id: 'sticker-3x3', size: '3"×3"', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6962c110e371f3', inStock: true },
      { id: 'sticker-4x4', size: '4"×4"', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6962c110e37255', inStock: true },
      { id: 'sticker-5x5', size: '5.5"×5.5"', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6962c110e372a6', inStock: true },
    ]
  },
  {
    id: 'xun-mech-sticker-2',
    slug: 'xun-mech-sticker-2',
    name: 'Xun Mech Sticker',
    description: 'High-quality kiss-cut sticker featuring the Xun mech with "XUN" underneath. Available in 3 sizes. Perfect for laptops, water bottles, and notebooks.',
    price: 350, // $3.50 (5.5" is $4.00)
    images: [
      new URL('../assets/merch/sticker2-4x4-default.png', import.meta.url).href,
    ],
    colorImages: {
      'White': [
        new URL('../assets/merch/sticker2-4x4-default.png', import.meta.url).href,
        new URL('../assets/merch/sticker2-4x4-front.png', import.meta.url).href,
        new URL('../assets/merch/sticker2-4x4-lifestyle1.png', import.meta.url).href,
        new URL('../assets/merch/sticker2-4x4-lifestyle2.png', import.meta.url).href,
        new URL('../assets/merch/sticker2-4x4-lifestyle3.png', import.meta.url).href,
      ],
    },
    category: 'sticker',
    printfulProductId: 0,
    variants: [
      { id: 'sticker2-3x3', size: '3"×3"', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6962c246862c98', inStock: true },
      { id: 'sticker2-4x4', size: '4"×4"', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6962c246862cf6', inStock: true },
      { id: 'sticker2-5x5', size: '5.5"×5.5"', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '6962c246862d43', inStock: true },
    ]
  },
];

// Helper functions
export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductVariant(productId: string, variantId: string): ProductVariant | undefined {
  const product = products.find((p) => p.id === productId);
  return product?.variants.find((v) => v.id === variantId);
}

export function getAvailableSizes(product: Product): string[] {
  return [...new Set(product.variants.filter((v) => v.inStock).map((v) => v.size))];
}

export function getAvailableColors(product: Product): { color: string; hex: string }[] {
  const colors = new Map<string, string>();
  product.variants
    .filter((v) => v.inStock)
    .forEach((v) => colors.set(v.color, v.colorHex));
  return Array.from(colors.entries()).map(([color, hex]) => ({ color, hex }));
}

export function getVariantByOptions(product: Product, size: string, color: string): ProductVariant | undefined {
  return product.variants.find((v) => v.size === size && v.color === color && v.inStock);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return products.filter((p) => p.category === category);
}
