import React, { useState, useMemo } from 'react';
import { ArrowLeft, ShoppingBag, Check, ShoppingCart } from 'lucide-react';
import { getProduct, getAvailableSizes, getAvailableColors, getVariantByOptions, formatPrice, Product } from '../data/products';
import { useCart } from '../stores/cart';

interface ProductPageProps {
  slug: string;
  onBack: () => void;
  onCartClick: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ slug, onBack, onCartClick }) => {
  const product = getProduct(slug);
  const { addItem, openCart, getItemCount } = useCart();
  const cartItemCount = getItemCount();

  const sizes = useMemo(() => (product ? getAvailableSizes(product) : []), [product]);
  const colors = useMemo(() => (product ? getAvailableColors(product) : []), [product]);

  const [selectedSize, setSelectedSize] = useState<string>(
    sizes.includes('M') ? 'M' : sizes[0] || ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.color || '');
  const [addedToCart, setAddedToCart] = useState(false);

  const selectedVariant = useMemo(
    () => (product ? getVariantByOptions(product, selectedSize, selectedColor) : undefined),
    [product, selectedSize, selectedColor]
  );

  if (!product) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ padding: '40px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-all hover:opacity-70"
            style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', marginBottom: '32px', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to Merch
          </button>
          <div className="text-center" style={{ padding: '64px 0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Product Not Found
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              The product you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.price,
      image: product.images[0] || '',
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    openCart();
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '40px 48px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-all hover:opacity-70"
            style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to Merch
          </button>
          <button
            onClick={onCartClick}
            className="relative p-2 rounded-lg transition-all hover:bg-[var(--hover-bg)]"
            style={{ color: 'var(--text-icon)', backgroundColor: 'transparent' }}
            title="View cart"
          >
            <ShoppingCart size={24} strokeWidth={1.5} />
            {cartItemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Product Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          {/* Product Image */}
          <div
            style={{
              aspectRatio: '1',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ShoppingBag size={64} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {formatPrice(product.price)}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
              {product.description}
            </p>

            {/* Color Selector */}
            {colors.length > 1 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Color: {selectedColor}
                </label>
                <div className="flex gap-5">
                  {colors.map(({ color, hex }) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: hex,
                        border: selectedColor === color ? '3px solid var(--accent-primary)' : '2px solid var(--border-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {selectedColor === color && (
                        <Check
                          size={18}
                          strokeWidth={3}
                          style={{ color: hex === '#ffffff' || hex === '#fff' ? '#000' : '#fff' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Size
              </label>
              <div className="flex flex-wrap gap-4">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: selectedSize === size ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                      backgroundColor: selectedSize === size ? 'var(--accent-primary)' : 'var(--bg-primary)',
                      color: selectedSize === size ? '#fff' : 'var(--text-primary)',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '10px',
                backgroundColor: addedToCart ? 'var(--status-success)' : 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                cursor: selectedVariant ? 'pointer' : 'not-allowed',
                opacity: selectedVariant ? 1 : 0.5,
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            >
              {addedToCart ? 'Added to Cart!' : `Add to Cart · ${formatPrice(product.price)}`}
            </button>

            {/* Product Details */}
            <div
              style={{
                marginTop: '32px',
                padding: '20px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Product Details
              </h3>
              <ul style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
                {product.category === 'tshirt' && (
                  <>
                    <li>100% ring-spun cotton</li>
                    <li>Pre-shrunk fabric</li>
                    <li>Side-seamed construction</li>
                    <li>Shoulder-to-shoulder taping</li>
                  </>
                )}
                {product.category === 'hoodie' && (
                  <>
                    <li>80% ring-spun cotton, 20% polyester</li>
                    <li>Soft fleece interior</li>
                    <li>Double-lined hood</li>
                    <li>Front pouch pocket</li>
                  </>
                )}
                {product.category === 'sticker' && (
                  <>
                    <li>High-quality vinyl</li>
                    <li>Waterproof and weatherproof</li>
                    <li>UV resistant</li>
                    <li>Easy peel backing</li>
                  </>
                )}
                <li>Printed on demand - ships in 2-5 business days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
