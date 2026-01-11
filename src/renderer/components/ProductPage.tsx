import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ShoppingBag, Check, ShoppingCart } from 'lucide-react';
import { getProduct, getAvailableSizes, getAvailableColors, getVariantByOptions, formatPrice, Product } from '../data/products';
import { useCart } from '../stores/cart';

interface ProductPageProps {
  slug: string;
  onCartClick: () => void;
  onCheckout: () => void;
  initialSize?: string;
  initialColor?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ slug, onCartClick, onCheckout, initialSize, initialColor, canGoBack, canGoForward, goBack, goForward }) => {
  const product = getProduct(slug);
  const { addItem, openCart, getItemCount } = useCart();
  const cartItemCount = getItemCount();

  const sizes = useMemo(() => (product ? getAvailableSizes(product) : []), [product]);
  const colors = useMemo(() => (product ? getAvailableColors(product) : []), [product]);

  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize || (sizes.includes('M') ? 'M' : sizes[0] || '')
  );
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || colors[0]?.color || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const ZOOM_LEVEL = 2.5;

  // Get the array of images for the selected color
  const colorImageArray = useMemo(() => {
    if (!product) return [];
    if (product.colorImages && selectedColor && product.colorImages[selectedColor]) {
      return product.colorImages[selectedColor];
    }
    return product.images;
  }, [product, selectedColor]);

  // Reset image index when color changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedColor]);

  const currentImage = colorImageArray[selectedImageIndex] || colorImageArray[0] || '';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const selectedVariant = useMemo(
    () => (product ? getVariantByOptions(product, selectedSize, selectedColor) : undefined),
    [product, selectedSize, selectedColor]
  );

  if (!product) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Navigation bar */}
        <div className="flex items-center" style={{ paddingTop: '16px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '24px' }}>
          <div className="flex items-center gap-2">
            <button
              className={`p-1 rounded transition-colors ${canGoBack ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
              style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
              title="Back"
              onClick={goBack}
              disabled={!canGoBack}
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              className={`p-1 rounded transition-colors ${canGoForward ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
              style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
              title="Forward"
              onClick={goForward}
              disabled={!canGoForward}
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: '24px 48px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      printfulSyncVariantId: selectedVariant.printfulSyncVariantId,
      name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.price,
      image: colorImageArray[0] || currentImage,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    openCart();
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation bar */}
      <div className="flex items-center justify-between" style={{ paddingTop: '16px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '24px' }}>
        <div className="flex items-center gap-2">
          <button
            className={`p-1 rounded transition-colors ${canGoBack ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
            style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
            title="Back"
            onClick={goBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            className={`p-1 rounded transition-colors ${canGoForward ? 'hover:bg-[var(--hover-bg)]' : 'opacity-40 cursor-default'}`}
            style={{ color: 'var(--sidebar-icon)', backgroundColor: 'transparent' }}
            title="Forward"
            onClick={goForward}
            disabled={!canGoForward}
          >
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </div>
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

      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Product Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Left Column: Image + Thumbnails + Product Details */}
          <div style={{ position: 'relative' }}>
            {/* Main Product Image */}
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              style={{
                aspectRatio: '1',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                maxWidth: '320px',
                cursor: currentImage ? 'crosshair' : 'default',
                position: 'relative',
              }}
            >
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt={`${product.name} - ${selectedColor}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }}
                  />
                  {/* Lens indicator */}
                  {isZooming && (
                    <div
                      style={{
                        position: 'absolute',
                        width: '80px',
                        height: '80px',
                        border: '2px solid var(--accent-primary)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        pointerEvents: 'none',
                        left: `${zoomPosition.x}%`,
                        top: `${zoomPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '4px',
                      }}
                    />
                  )}
                </>
              ) : (
                <ShoppingBag size={64} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              )}
            </div>

            {/* Zoom Panel */}
            {isZooming && currentImage && (
              <div
                style={{
                  position: 'absolute',
                  left: '340px',
                  top: 0,
                  width: '320px',
                  height: '320px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-primary)',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${currentImage})`,
                    backgroundSize: `${ZOOM_LEVEL * 100}%`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>
            )}

            {/* Thumbnail Gallery */}
            {colorImageArray.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', maxWidth: '320px' }}>
                {colorImageArray.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedImageIndex === index ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                      cursor: 'pointer',
                      padding: 0,
                      backgroundColor: 'var(--bg-tertiary)',
                      opacity: selectedImageIndex === index ? 1 : 0.7,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Details */}
            <div
              style={{
                marginTop: '12px',
                padding: '3px 20px 20px 20px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                maxWidth: '320px',
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
                {product.category === 'hoodie' && product.id === 'xun-youth-hoodie' && (
                  <>
                    <li>50% cotton, 50% polyester</li>
                    <li>Midweight fleece fabric</li>
                    <li>Air jet yarn for a softer feel</li>
                    <li>No drawcords for child safety</li>
                  </>
                )}
                {product.category === 'hoodie' && product.id !== 'xun-youth-hoodie' && (
                  <>
                    <li>52% cotton, 48% poly fleece</li>
                    <li>Heather colors are 60%/40%</li>
                    <li>Thin, lightweight, soft</li>
                  </>
                )}
                {product.category === 'sticker' && (
                  <>
                    <li>Kiss-cut to white vinyl</li>
                    <li>Waterproof and durable</li>
                    <li>3 sizes available</li>
                    <li>Easy peel backing</li>
                  </>
                )}
              </ul>
            </div>
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
                <div className="flex">
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
                        marginRight: '2px',
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
              <div className="flex flex-wrap">
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
                      marginRight: '4px',
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

            {/* Checkout Button - shows when cart has items */}
            {cartItemCount > 0 && (
              <button
                onClick={onCheckout}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginTop: '12px',
                }}
              >
                Checkout
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
