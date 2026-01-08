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
  category: 'tshirt' | 'hoodie' | 'sticker';
  printfulProductId: number;
  variants: ProductVariant[];
}

export const products: Product[] = [
  {
    id: 'xun-mech-hoodie',
    slug: 'xun-mech-hoodie',
    name: 'Xun Mech Hoodie',
    description: 'A cozy premium hoodie featuring the Xun mech logo. Perfect for late-night coding sessions.',
    price: 4500, // $45.00
    images: [], // Placeholder - will add actual images later
    category: 'hoodie',
    printfulProductId: 0,
    variants: [
      { id: 'xun-mech-hoodie-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-hoodie-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-hoodie-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-hoodie-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-hoodie-white-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-hoodie-white-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-hoodie-white-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-hoodie-white-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
    ]
  },
  {
    id: 'xun-mech-tee',
    slug: 'xun-mech-tee',
    name: 'Xun Mech T-Shirt',
    description: 'A comfortable cotton t-shirt featuring the Xun mech logo. Show your love for note-taking.',
    price: 2500, // $25.00
    images: [],
    category: 'tshirt',
    printfulProductId: 0,
    variants: [
      { id: 'xun-mech-tee-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-white-s', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-white-m', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-white-l', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-white-xl', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-gray-s', size: 'S', color: 'Heather Gray', colorHex: '#9ca3af', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-gray-m', size: 'M', color: 'Heather Gray', colorHex: '#9ca3af', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-gray-l', size: 'L', color: 'Heather Gray', colorHex: '#9ca3af', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-tee-gray-xl', size: 'XL', color: 'Heather Gray', colorHex: '#9ca3af', printfulSyncVariantId: '', inStock: true },
    ]
  },
  {
    id: 'xun-mech-sticker-pack',
    slug: 'xun-mech-sticker-pack',
    name: 'Xun Mech Sticker Pack',
    description: 'A pack of high-quality vinyl stickers featuring various Xun mech designs. Perfect for laptops and water bottles.',
    price: 800, // $8.00
    images: [],
    category: 'sticker',
    printfulProductId: 0,
    variants: [
      { id: 'xun-mech-sticker-pack-standard', size: 'Standard', color: 'Multi', colorHex: '#ec4899', printfulSyncVariantId: '', inStock: true },
    ]
  },
  {
    id: 'xun-mech-die-cut-sticker',
    slug: 'xun-mech-die-cut-sticker',
    name: 'Xun Mech Die-Cut Sticker',
    description: 'A large die-cut vinyl sticker of the Xun mech. Weatherproof and durable.',
    price: 500, // $5.00
    images: [],
    category: 'sticker',
    printfulProductId: 0,
    variants: [
      { id: 'xun-mech-die-cut-small', size: 'Small (3")', color: 'Standard', colorHex: '#ec4899', printfulSyncVariantId: '', inStock: true },
      { id: 'xun-mech-die-cut-large', size: 'Large (5")', color: 'Standard', colorHex: '#ec4899', printfulSyncVariantId: '', inStock: true },
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
