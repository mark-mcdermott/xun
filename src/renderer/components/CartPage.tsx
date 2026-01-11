import React from 'react';
import { ArrowLeft, ArrowRight, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart, formatPrice } from '../stores/cart';

interface CartPageProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
  onProductClick: (productId: string, size: string, color: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onCheckout, onContinueShopping, onProductClick, canGoBack, canGoForward, goBack, goForward }) => {
  const { items, updateQuantity, removeItem, getSubtotal, clear } = useCart();
  const subtotal = getSubtotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Header */}
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Your Cart
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            {itemCount === 0 ? 'Your cart is empty' : `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
          </p>

          {items.length === 0 ? (
            <div className="text-center" style={{ padding: '64px 0' }}>
              <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Your cart is empty
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Add some merch to get started!
              </p>
              <button
                onClick={onContinueShopping}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div style={{ marginBottom: '32px' }}>
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    {/* Item Image */}
                    <div
                      onClick={() => onProductClick(item.productId, item.size, item.color)}
                      style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <ShoppingBag size={32} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                      )}
                    </div>

                    {/* Item Details */}
                    <div style={{ flex: 1 }}>
                      <h3
                        onClick={() => onProductClick(item.productId, item.size, item.color)}
                        style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', cursor: 'pointer' }}
                      >
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {item.color} / {item.size}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center"
                          style={{
                            border: '1px solid var(--border-primary)',
                            borderRadius: '6px',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'var(--bg-primary)',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            style={{
                              padding: '6px 14px',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                              backgroundColor: 'var(--bg-primary)',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'var(--bg-primary)',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="flex items-center transition-all hover:opacity-70"
                          style={{
                            color: 'var(--status-error)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            marginLeft: '8px',
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Item Price */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatPrice(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  marginBottom: '24px',
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Calculated at checkout</span>
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{ paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex">
                <button
                  onClick={onContinueShopping}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                    cursor: 'pointer',
                    marginRight: '12px',
                  }}
                >
                  Continue Shopping
                </button>
                <button
                  onClick={onCheckout}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
