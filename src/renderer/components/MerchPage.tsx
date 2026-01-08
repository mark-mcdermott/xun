import React from 'react';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { products, formatPrice } from '../data/products';
import { useCart } from '../stores/cart';

interface MerchPageProps {
  onProductClick: (slug: string) => void;
  onCartClick: () => void;
}

export const MerchPage: React.FC<MerchPageProps> = ({ onProductClick, onCartClick }) => {
  const cartItemCount = useCart((state) => state.getItemCount());

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '40px 48px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header with cart button */}
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div>
            <h1 className="font-semibold" style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Merch
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              High quality hoodies, T-shirts and stickers with the Xun mech logo.
            </p>
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

        {/* Product Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(125px, 1fr))',
            gap: '24px',
          }}
        >
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onProductClick(product.slug)}
              className="text-left transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {/* Product Image */}
              <div
                style={{
                  aspectRatio: '1',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '16px' }}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  {product.name}
                </h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatPrice(product.price)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {product.variants.filter((v) => v.inStock).length} options
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center" style={{ padding: '64px 0' }}>
            <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Coming Soon
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Our merch store is being set up. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
