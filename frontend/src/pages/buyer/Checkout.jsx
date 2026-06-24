import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '@/stores/cartStore';
import { api } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Checkout() {
  const { items, total, clear } = useCartStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', pincode: '', state: '',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.phone.trim())   e.phone   = 'Phone is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim())    e.city    = 'City is required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit PIN';
    if (!form.state.trim())   e.state   = 'State is required';
    return e;
  }

  async function handlePlaceOrder() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    try {
      const order = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        total,
        shippingAddress: form,
      });
      clear();
      showToast('Order placed!');
      navigate(`/orders?highlight=${order.id}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="text-xs theme-muted block mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

      <div className="flex flex-col gap-6">
        <div className="theme-card rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-medium">Delivery details</h2>
          {field('name',    'Full name',     'text', 'Priya Sharma')}
          {field('phone',   'Phone',         'tel',  '+91 9876543210')}
          {field('address', 'Address',       'text', 'House No., Street, Area')}
          <div className="grid grid-cols-2 gap-4">
            {field('city',    'City',    'text', 'Jaipur')}
            {field('pincode', 'PIN code', 'text', '302001')}
          </div>
          {field('state', 'State', 'text', 'Rajasthan')}
        </div>

        {/* Order summary */}
        <div className="theme-card rounded-xl p-6">
          <h2 className="font-medium mb-4">Order summary</h2>
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
              <span className="theme-muted truncate mr-4">{i.title} × {i.quantity}</span>
              <span>₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold mt-4">
            <span>Total</span>
            <span className="text-brand-pink">₹{Number(total).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <p className="text-xs theme-muted text-center">
          Payment on delivery — we'll confirm your order via phone.
        </p>

        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full bg-brand-pink hover:bg-brand-pink-strong text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting && <LoadingSpinner size="sm" />}
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </div>
    </div>
  );
}
