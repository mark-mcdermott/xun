import React, { useState } from 'react';
import { ArrowLeft, CreditCard, ShoppingBag, Lock } from 'lucide-react';
import { useCart, formatPrice } from '../stores/cart';

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onComplete }) => {
  const { items, getSubtotal, clear } = useCart();
  const subtotal = getSubtotal();
  const [isProcessing, setIsProcessing] = useState(false);

  // Placeholder shipping cost - in production this would come from Printful
  const shippingEstimate = 599; // $5.99
  const total = subtotal + shippingEstimate;

  const handleCheckout = async () => {
    setIsProcessing(true);

    // TODO: Integrate with Stripe
    // This will redirect to Stripe Checkout or use Stripe Payment Links
    // For now, simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would redirect to Stripe
    // For now, show a message
    alert('Stripe checkout integration coming soon! This is a placeholder.');
    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ padding: '40px 48px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-all hover:opacity-70"
            style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', marginBottom: '32px', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to Cart
          </button>
          <div className="text-center" style={{ padding: '64px 0' }}>
            <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Your cart is empty
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Add some items to checkout.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '40px 48px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 transition-all hover:opacity-70"
          style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', marginBottom: '32px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Cart
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '32px' }}>
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Order Summary */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Order Summary
            </h2>

            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex items-center gap-3"
                  style={{ marginBottom: '16px' }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <ShoppingBag size={24} strokeWidth={1} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {item.color} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '16px', marginTop: '8px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Shipping (estimated)</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{formatPrice(shippingEstimate)}</span>
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{ paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Payment
            </h2>

            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <CreditCard size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                You'll be redirected to Stripe for secure payment.
              </p>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  backgroundColor: isProcessing ? 'var(--text-muted)' : 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: isProcessing ? 'wait' : 'pointer',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <Lock size={18} />
                    Pay {formatPrice(total)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2" style={{ marginTop: '16px' }}>
                <Lock size={12} style={{ color: 'var(--text-muted)', marginRight: '4px' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Secure checkout powered by Stripe
                </span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center' }}>
              By completing your purchase, you agree to our terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
