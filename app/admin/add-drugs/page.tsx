'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, PlusCircle, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { saveNewDrug } from '@/lib/storage';

export default function AddDrugPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Check session storage on mount so refreshing doesn't log you out
  useEffect(() => {
    const authStatus = sessionStorage.getItem('dawa2u_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const [form, setForm] = useState({
    name: '',
    activeIngredient: '',
    strength: '',
    category: 'Pain & Fever',
    prescriptionRequired: false,
    priceKsh: '',
    form: 'Tablets',
    packSize: '',
    inStock: true,
    warningText: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Pain & Fever',
    'Cough, Cold & Allergy',
    'Digestive Health',
    'Antimalarials & Antibiotics',
    'Chronic & Diabetes',
    'Vitamins & Supplements',
    'Medical Devices & First Aid'
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('dawa2u_admin_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageBase64 = undefined;
      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      const newDrug = {
        ...form,
        priceKsh: Number(form.priceKsh),
        id: `MED-${Date.now().toString().slice(-4)}`,
        image: imageBase64
      };

      // Save directly into localStorage for instant customer storefront synchronization
      saveNewDrug(newDrug);

      setSuccessMessage(true);
      setForm({
        name: '',
        activeIngredient: '',
        strength: '',
        category: 'Pain & Fever',
        prescriptionRequired: false,
        priceKsh: '',
        form: 'Tablets',
        packSize: '',
        inStock: true,
        warningText: ''
      });
      setImageFile(null);

      setTimeout(() => setSuccessMessage(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. PASSWORD GATE SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#002040] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-[#007838] rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-[#002040]">Admin & Pharmacist Login</h1>
            <p className="text-xs text-slate-500">Enter secure password to access catalogue inventory.</p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl text-center font-medium">
              Incorrect password. Access denied.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#007838] hover:bg-[#005828] text-white font-bold py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Unlock Admin Panel
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD & ADD DRUG FORM
  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#007838] text-white text-xs py-2 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Dawa2U Admin Portal · Secure Session Active
          </span>
          <Link href="/" className="hover:underline font-bold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> View Customer Storefront
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-[#002040] text-white py-10 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black">Add New Medicine / Product</h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Expand the Dawa2U catalogue. Saved products publish instantly live to the customer storefront.
          </p>
        </div>
      </section>

      {/* Form Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#007838] shrink-0" />
              <div>
                <p className="font-bold">Medicine added successfully!</p>
                <p className="text-xs text-slate-600">The product has been registered and is now live on the customer store.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Brand Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Panadol Extra"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active Ingredient / Generic *</label>
                <input
                  required
                  value={form.activeIngredient}
                  onChange={e => setForm({ ...form, activeIngredient: e.target.value })}
                  placeholder="e.g. Paracetamol, Caffeine"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Strength</label>
                <input
                  value={form.strength}
                  onChange={e => setForm({ ...form, strength: e.target.value })}
                  placeholder="e.g. 500mg/65mg"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Form</label>
                <select
                  value={form.form}
                  onChange={e => setForm({ ...form, form: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838] bg-white"
                >
                  <option value="Tablets">Tablets</option>
                  <option value="Capsules">Capsules</option>
                  <option value="Syrup">Syrup / Suspension</option>
                  <option value="Solution">Solution / Drop</option>
                  <option value="Lozenges">Lozenges</option>
                  <option value="Sachet">Sachet</option>
                  <option value="Device">Medical Device</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pack Size</label>
                <input
                  value={form.packSize}
                  onChange={e => setForm({ ...form, packSize: e.target.value })}
                  placeholder="e.g. 24 tablets"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838] bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Retail Price (KSh) *</label>
                <input
                  required
                  type="number"
                  value={form.priceKsh}
                  onChange={e => setForm({ ...form, priceKsh: e.target.value })}
                  placeholder="e.g. 250"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={form.prescriptionRequired}
                  onChange={e => setForm({ ...form, prescriptionRequired: e.target.checked })}
                  className="w-4 h-4 text-[#007838] rounded focus:ring-[#007838]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#002040]">Requires Prescription (Rx)</span>
                  <span className="text-[11px] text-slate-500">Requires pharmacist verification before dispatch</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={e => setForm({ ...form, inStock: e.target.checked })}
                  className="w-4 h-4 text-[#007838] rounded focus:ring-[#007838]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#002040]">In Stock</span>
                  <span className="text-[11px] text-slate-500">Available for immediate purchase / fulfillment</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Warning / Notice (Optional)</label>
              <input
                value={form.warningText}
                onChange={e => setForm({ ...form, warningText: e.target.value })}
                placeholder="e.g. Chronic Medication Management item. Pharmacist approval required."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Image (PNG, JPG)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center text-slate-500 hover:border-[#007838] transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#007838] hover:file:bg-emerald-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007838] hover:bg-[#005828] text-white font-bold py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Save & Publish to Customer Store
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#002040] text-slate-400 text-xs py-6 text-center mt-12">
        <p>© 2026 Dawa To You. Admin Portal.</p>
      </footer>
    </div>
  );
}