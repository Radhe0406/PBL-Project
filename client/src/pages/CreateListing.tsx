import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Tag, Gift, ArrowRightLeft, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../api/axios';
import { CATEGORIES, CONDITIONS } from '../types';

export default function CreateListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    listingType: 'Sell',
    title: '', description: '', category: '', condition: 'Good',
    price: '', exchangePreferences: '',
    brand: '', yearOfPurchase: '', originalPrice: '',
    tags: '',
    city: '', area: '', pincode: '',
    pickupPreferences: 'Buyer Collects',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(f.type));
    const newImages = [...images, ...validFiles].slice(0, 10);
    setImages(newImages);
    setPreviews(newImages.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
      images.forEach(img => formData.append('images', img));

      const { data } = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/listings/${data.listing._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;
  const canNext = () => {
    if (step === 1) return !!form.listingType;
    if (step === 2) return form.title.length >= 5 && form.description.length >= 20 && !!form.category && !!form.condition;
    if (step === 3) return true;
    return true;
  };

  const typeOptions = [
    { value: 'Sell', icon: Tag, label: 'Sell', desc: 'List an item for sale at your price', color: 'from-primary-500 to-primary-600' },
    { value: 'Donate', icon: Gift, label: 'Donate', desc: 'Give away an item for free', color: 'from-accent-500 to-accent-600' },
    { value: 'Exchange', icon: ArrowRightLeft, label: 'Exchange', desc: 'Swap your item for something else', color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title text-dark-100 mb-2">Create Listing</h1>
      <p className="text-dark-400 mb-8">List an item to sell, donate, or exchange with your community</p>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${s <= step ? 'bg-gradient-to-r from-primary-500 to-primary-400' : 'bg-dark-700'}`} />
            <p className={`text-xs mt-1 ${s <= step ? 'text-primary-400' : 'text-dark-500'}`}>
              {s === 1 ? 'Type' : s === 2 ? 'Details' : s === 3 ? 'Photos' : 'Location'}
            </p>
          </div>
        ))}
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>}

      {/* Step 1: Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">What would you like to do?</h2>
          <div className="grid gap-4">
            {typeOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <button key={opt.value} onClick={() => setForm({ ...form, listingType: opt.value })}
                  className={`glass-card p-5 flex items-center gap-4 text-left transition-all ${form.listingType === opt.value ? 'border-primary-500/50 shadow-glow' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-100">{opt.label}</p>
                    <p className="text-sm text-dark-400">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">Item Details</h2>
          <div>
            <label className="input-label">Title <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Sony WH-1000XM4 Wireless Headphones" className="input-field" maxLength={100} />
            <p className="text-xs text-dark-500 mt-1">{form.title.length}/100 characters</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category <span className="text-red-400">*</span></label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Condition <span className="text-red-400">*</span></label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input-field">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Description <span className="text-red-400">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your item in detail..." rows={5} className="input-field" maxLength={2000} />
            <p className="text-xs text-dark-500 mt-1">{form.description.length}/2000 characters</p>
          </div>
          {form.listingType === 'Sell' && (
            <div>
              <label className="input-label">Price (₹) <span className="text-red-400">*</span></label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Enter price" className="input-field" min="1" />
            </div>
          )}
          {form.listingType === 'Exchange' && (
            <div>
              <label className="input-label">What are you looking for?</label>
              <input name="exchangePreferences" value={form.exchangePreferences} onChange={handleChange} placeholder="Describe the item you'd like in exchange" className="input-field" />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div><label className="input-label">Brand</label><input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" className="input-field" /></div>
            <div><label className="input-label">Year of Purchase</label><input name="yearOfPurchase" type="number" value={form.yearOfPurchase} onChange={handleChange} placeholder="2024" className="input-field" /></div>
            <div><label className="input-label">Original Price (₹)</label><input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="MRP" className="input-field" /></div>
          </div>
          <div>
            <label className="input-label">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. electronics, wireless, sony" className="input-field" />
          </div>
        </div>
      )}

      {/* Step 3: Photos */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">Photos</h2>
          <div className="border-2 border-dashed border-dark-600/50 rounded-2xl p-8 text-center hover:border-primary-500/50 transition-colors">
            <Upload className="w-10 h-10 text-dark-400 mx-auto mb-3" />
            <p className="text-dark-300 mb-2">Drag and drop or click to upload</p>
            <p className="text-xs text-dark-500 mb-4">JPG, PNG, WebP • Max 5MB each • Up to 10 photos</p>
            <label className="btn-primary cursor-pointer inline-block">
              Choose Files
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full">Primary</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Location */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">Location & Pickup</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="input-label">City</label><input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className="input-field" /></div>
            <div><label className="input-label">Area / Locality</label><input name="area" value={form.area} onChange={handleChange} placeholder="Andheri West" className="input-field" /></div>
          </div>
          <div><label className="input-label">PIN Code</label><input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400053" className="input-field" /></div>
          <div>
            <label className="input-label">Pickup Preference</label>
            <select name="pickupPreferences" value={form.pickupPreferences} onChange={handleChange} className="input-field">
              <option value="Buyer Collects">Buyer Collects</option>
              <option value="Seller Delivers">I'll Deliver</option>
              <option value="Both Available">Both Available</option>
            </select>
          </div>

          {/* Preview */}
          <div className="glass-card p-6 mt-6">
            <h3 className="font-semibold text-dark-200 mb-3 flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</h3>
            <div className="text-sm space-y-2">
              <p><span className="text-dark-500">Type:</span> <span className="text-dark-200">{form.listingType}</span></p>
              <p><span className="text-dark-500">Title:</span> <span className="text-dark-200">{form.title || '—'}</span></p>
              <p><span className="text-dark-500">Category:</span> <span className="text-dark-200">{form.category || '—'}</span></p>
              <p><span className="text-dark-500">Condition:</span> <span className="text-dark-200">{form.condition}</span></p>
              {form.listingType === 'Sell' && <p><span className="text-dark-500">Price:</span> <span className="text-dark-200">₹{form.price || '—'}</span></p>}
              <p><span className="text-dark-500">Location:</span> <span className="text-dark-200">{[form.area, form.city].filter(Boolean).join(', ') || '—'}</span></p>
              <p><span className="text-dark-500">Photos:</span> <span className="text-dark-200">{images.length} uploaded</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
          className="btn-secondary flex items-center gap-1 disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < totalSteps ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary flex items-center gap-1">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || !canNext()} className="btn-primary">
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        )}
      </div>
    </div>
  );
}
