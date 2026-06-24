import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CATEGORIES = ['saree', 'lehenga', 'kurti', 'dupatta', 'jewellery', 'fusion', 'other'];

const EMPTY = {
  title: '', description: '', price: '', category: 'saree', image_url: '',
};

export default function SellerProductForm() {
  const { id }        = useParams();         // id exists → edit mode
  const navigate      = useNavigate();
  const isEdit        = Boolean(id);
  const [form,      setForm]      = useState(EMPTY);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/seller/products/${id}`)
      .then((p) => setForm({ title: p.title, description: p.description ?? '', price: String(p.price), category: p.category ?? 'saree', image_url: p.image_url ?? '' }))
      .catch((e) => { showToast(e.message, 'error'); navigate('/seller/products'); })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  function validate() {
    const e = {};
    if (!form.title.trim())   e.title = 'Title is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Enter a valid price';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (isEdit) {
        await api.put(`/seller/products/${id}`, payload);
        showToast('Product updated');
      } else {
        await api.post('/seller/products', payload);
        showToast('Product added');
      }
      navigate('/seller/products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-lg p-8">
      <h1 className="text-2xl font-semibold mb-8">{isEdit ? 'Edit product' : 'Add product'}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs theme-muted block mb-1">Title *</label>
          <input value={form.title} onChange={set('title')} placeholder="Banarasi silk saree" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink" />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="text-xs theme-muted block mb-1">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs theme-muted block mb-1">Price (₹) *</label>
            <input type="number" min="1" step="1" value={form.price} onChange={set('price')} placeholder="1999" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink" />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="text-xs theme-muted block mb-1">Category</label>
            <select value={form.category} onChange={set('category')} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink capitalize">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs theme-muted block mb-1">Image URL</label>
          <input value={form.image_url} onChange={set('image_url')} placeholder="https://…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink" />
          {form.image_url && (
            <img src={form.image_url} alt="preview" className="mt-2 h-24 w-auto rounded-lg object-cover" onError={(e) => e.target.style.display = 'none'} />
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <button type="button" onClick={() => navigate('/seller/products')} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-brand-pink hover:bg-brand-pink-strong text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting && <LoadingSpinner size="sm" />}
            {isEdit ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}
