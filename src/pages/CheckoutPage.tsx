import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCreateOrder } from '../hooks/useOrders';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  email: z.string().email('Valid email is required'),
  shippingAddress: z.string().min(5, 'Shipping address is required').trim(),
  city: z.string().min(2, 'City is required').trim(),
  postalCode: z.string().optional(),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY']),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

const STEPS = ['Shipping', 'Payment', 'Review'];

const CheckoutPage: React.FC = () => {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const [step, setStep] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: { paymentMethod: 'CREDIT_CARD' },
  });

  const nextStep = async () => {
    const fields: (keyof CheckoutForm)[][] = [
      ['fullName', 'email', 'shippingAddress', 'city', 'phoneNumber'],
      ['paymentMethod'],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: CheckoutForm) => {
    try {
      await createOrder({
        ...data,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });
      setOrderSuccess(true);
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (orderSuccess) return (
    <div className="page">
      <div className="order-success">
        <CheckCircle size={64} className="success-icon" />
        <h1>Order Placed!</h1>
        <p>Thank you for your purchase. You'll receive a confirmation shortly.</p>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    </div>
  );

  const values = getValues();

  return (
    <div className="page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`checkout-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <span className="step-number">{i + 1}</span>
            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-form" noValidate>
          {step === 0 && (
            <div className="form-section">
              <h2>Shipping Information</h2>
              <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} placeholder="John Doe" />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} placeholder="you@email.com" />
              <Input label="Shipping Address" error={errors.shippingAddress?.message} {...register('shippingAddress')} placeholder="123 Main St" />
              <div className="form-row">
                <Input label="City" error={errors.city?.message} {...register('city')} placeholder="New York" />
                <Input label="Postal Code (optional)" error={errors.postalCode?.message} {...register('postalCode')} placeholder="10001" />
              </div>
              <Input label="Phone Number" error={errors.phoneNumber?.message} {...register('phoneNumber')} placeholder="10-digit number" hint="Enter exactly 10 digits" />
              <Button type="button" onClick={nextStep} size="lg">Continue to Payment</Button>
            </div>
          )}

          {step === 1 && (
            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                {(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY'] as const).map((m) => (
                  <label key={m} className="payment-option">
                    <input type="radio" value={m} {...register('paymentMethod')} />
                    <span>{m.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="form-error">{errors.paymentMethod.message}</p>}
              <div className="form-actions">
                <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button type="button" onClick={nextStep} size="lg">Review Order</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <h2>Order Review</h2>
              <div className="review-info">
                <div className="review-block">
                  <h3>Shipping To</h3>
                  <p>{values.fullName}</p>
                  <p>{values.shippingAddress}, {values.city} {values.postalCode}</p>
                  <p>{values.phoneNumber}</p>
                </div>
                <div className="review-block">
                  <h3>Payment</h3>
                  <p>{values.paymentMethod?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="review-items">
                {items.map((item) => (
                  <div key={item.product.id} className="review-item">
                    <span>{item.product.title} × {item.quantity}</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="review-total">
                  <strong>Total: ${totalPrice.toFixed(2)}</strong>
                </div>
              </div>
              <div className="form-actions">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" loading={isPending} size="lg">Place Order</Button>
              </div>
            </div>
          )}
        </form>

        <div className="checkout-sidebar">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div key={item.product.id} className="sidebar-item">
              <img src={item.product.images?.[0]} alt={item.product.title}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48'; }} />
              <div>
                <p>{item.product.title}</p>
                <p className="sidebar-qty">Qty: {item.quantity}</p>
              </div>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="sidebar-total">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;