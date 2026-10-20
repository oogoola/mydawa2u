'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  ShieldCheck,
  Phone,
  ShoppingBag,
  Building2,
  Search,
  ShoppingCart,
  UploadCloud,
  FileText,
  AlertTriangle,
  X,
  Plus,
  Minus,
  Trash2,
  Camera,
  CheckCircle2,
  Truck,
  Stethoscope,
  CreditCard,
  Smartphone,
  MessageCircle,
  Clock,
  Pill
} from 'lucide-react';
import { getStoredDrugs, Drug as MedicineProduct } from '@/lib/storage';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface CartItem {
  product: MedicineProduct;
  quantity: number;
  pendingVerification: boolean;
}

const CATEGORIES = [
  'all',
  'Pain & Fever',
  'Cough, Cold & Allergy',
  'Digestive Health',
  'Antimalarials & Antibiotics',
  'Chronic & Diabetes',
  'Vitamins & Supplements',
  'Medical Devices & First Aid'
];

const WHOLESALE_DISCOUNT = 0.15; 
const DELIVERY_FEE_KSH = 250;    
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const formatKsh = (n: number) => `KSh ${Math.round(n).toLocaleString('en-KE')}`;

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [catalogue, setCatalogue] = useState<MedicineProduct[]>([]);
  const [accountMode, setAccountMode] = useState<'b2c' | 'b2b'>('b2c');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Prescription pipeline
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [pendingRxProduct, setPendingRxProduct] = useState<MedicineProduct | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientName: '', phone: '', location: '', instructions: ''
  });
  const [rxSubmitted, setRxSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ask a Pharmacist
  const [askForm, setAskForm] = useState({ name: '', phone: '', question: '' });
  const [askSent, setAskSent] = useState(false);

  // Load inventory from localStorage on mount so admin updates reflect live
  useEffect(() => {
    setCatalogue(getStoredDrugs());
  }, []);

  /* ---------- pricing ---------- */
  const unitPrice = (p: MedicineProduct) =>
    accountMode === 'b2b' ? p.priceKsh * (1 - WHOLESALE_DISCOUNT) : p.priceKsh;

  /* ---------- cart handlers ---------- */
  const openPrescriptionModal = (product: MedicineProduct | null = null) => {
    setPendingRxProduct(product);
    setRxSubmitted(false);
    setIsPrescriptionModalOpen(true);
  };

  const addToCartInternal = (product: MedicineProduct, pendingVerification: boolean) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, pendingVerification }];
    });
  };

  const handleAddToCart = (product: MedicineProduct) => {
    if (!product.inStock) return;
    if (product.prescriptionRequired) {
      openPrescriptionModal(product);
      return;
    }
    addToCartInternal(product, false);
    setOrderPlaced(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => (i.product.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) =>
    setCart(prev => prev.filter(i => i.product.id !== id));

  /* ---------- prescription handlers ---------- */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Unsupported file. Please upload a PDF, JPG or PNG.');
      setUploadedFile(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('File is too large. Maximum size is 10MB.');
      setUploadedFile(null);
      return;
    }
    setUploadedFile(file);
  };

  const rxFormValid =
    !!uploadedFile &&
    prescriptionForm.patientName.trim().length > 1 &&
    /^(\+?254|0)?[17]\d{8}$/.test(prescriptionForm.phone.replace(/\s/g, '')) &&
    prescriptionForm.location.trim().length > 2;

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxFormValid) return;
    if (pendingRxProduct) addToCartInternal(pendingRxProduct, true);
    setRxSubmitted(true);
  };

  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setPendingRxProduct(null);
    if (rxSubmitted) {
      setUploadedFile(null);
      setPrescriptionForm({ patientName: '', phone: '', location: '', instructions: '' });
      setRxSubmitted(false);
    }
    setFileError('');
  };

  /* ---------- ask a pharmacist ---------- */
  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askForm.question.trim().length < 10) return;
    setAskSent(true);
    setAskForm({ name: '', phone: '', question: '' });
  };

  /* ---------- checkout ---------- */
  const handleCheckout = () => {
    setOrderPlaced(true);
    setCart([]);
  };

  /* ---------- derived ---------- */
  const filteredProducts = useMemo(
    () =>
      catalogue.filter(product => {
        const q = searchQuery.toLowerCase().trim();
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch =
          !q ||
          product.name.toLowerCase().includes(q) ||
          product.activeIngredient.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      }),
    [catalogue, searchQuery, activeCategory]
  );

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const otcItems = cart.filter(i => !i.pendingVerification);
  const rxItems = cart.filter(i => i.pendingVerification);
  const otcSubtotal = otcItems.reduce((s, i) => s + unitPrice(i.product) * i.quantity, 0);
  const rxEstimate = rxItems.reduce((s, i) => s + unitPrice(i.product) * i.quantity, 0);
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE_KSH : 0;

  /* ---------------------------------------------------------------- */
  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased flex flex-col min-h-screen">

      {/* Top Bar */}
      <div className="bg-[#007838] text-white text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="font-semibold">PPB Registered: Dawa To You · Reg No: PPB/ONLINE/2026</span>
          </div>
          <div className="hidden sm:flex items-center space-x-6">
            <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> FEFO Batch Monitored</span>
            <a href="#ask-pharmacist" className="hover:underline font-bold flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1" /> Ask a Pharmacist
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#007838] flex items-center justify-center text-white font-black text-xl shadow-md">D</div>
              <div>
                <span className="text-2xl font-black tracking-tight text-[#002040]">Dawa<span className="text-[#007838]">2U</span></span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">Healthcare Delivered</span>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setAccountMode('b2c')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${accountMode === 'b2c' ? 'bg-white text-[#002040] shadow-sm' : 'text-slate-600'}`}>
                <ShoppingBag className="w-3.5 h-3.5 text-[#007838]" />
                <span>Retail (B2C)</span>
              </button>
              <button onClick={() => setAccountMode('b2b')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${accountMode === 'b2b' ? 'bg-white text-[#002040] shadow-sm' : 'text-slate-600'}`}>
                <Building2 className="w-3.5 h-3.5" />
                <span>Wholesale (B2B)</span>
              </button>
            </div>

            <div className="hidden lg:block flex-1 max-w-md mx-8 relative">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search brand names, generics, active ingredients..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838] focus:bg-white transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <a href="/admin/add-drugs" className="text-xs font-bold text-slate-600 hover:text-[#007838] px-3 py-2 rounded-xl hover:bg-slate-100 transition hidden sm:inline-block">
                Admin Panel
              </a>
              <button onClick={() => openPrescriptionModal(null)} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#007838] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4" /> <span className="hidden sm:inline">Upload Script</span>
              </button>
              <button onClick={() => setIsCartOpen(true)} aria-label="Open cart" className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#007838] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="bg-[#002040] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black">Pharmaceutical Product Catalogue</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl">
            Explore our certified live medicine catalogue, OTC remedies, and medical devices in Kenyan Shillings. Backed by strict FEFO batch rotation and pharmacist verification.
          </p>
          {accountMode === 'b2b' && (
            <p className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" /> Wholesale pricing active ({WHOLESALE_DISCOUNT * 100}% off retail)
            </p>
          )}
        </div>
      </section>

      {/* Main grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-[#002040] text-sm uppercase tracking-wider">Categories</h3>
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible text-xs font-semibold pb-1 lg:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-3 py-2 rounded-xl transition whitespace-nowrap lg:whitespace-normal ${
                    activeCategory === cat ? 'bg-[#002040] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#007838]">
              <FileText className="w-4 h-4" /> Have a prescription?
            </div>
            <p>Upload it once and a registered pharmacist will review, confirm your medicines and send a quotation.</p>
            <button onClick={() => openPrescriptionModal(null)} className="w-full bg-[#007838] hover:bg-[#005828] text-white font-bold py-2 rounded-xl transition">
              Upload Prescription
            </button>
          </div>
        </aside>

        {/* Product grid */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold text-[#002040]">{filteredProducts.length}</span> product{filteredProducts.length !== 1 && 's'}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <Pill className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-[#002040]">No medicines found</p>
              <p className="text-sm text-slate-500 mt-1">
                Try a different name, or{' '}
                <a href="#ask-pharmacist" className="text-[#007838] font-semibold underline">ask a pharmacist</a>{' '}
                to help you find it.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <article key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
                  <div className="h-44 bg-emerald-50/60 flex items-center justify-center relative p-4">
                    <span className={`absolute top-3 left-3 text-[10px] font-black px-2 py-1 rounded-full z-10 ${
                      product.prescriptionRequired ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#007838]'
                    }`}>
                      {product.prescriptionRequired ? 'Rx REQUIRED' : 'OTC'}
                    </span>

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Pill className="w-12 h-12 text-[#007838]/60" />
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{product.category}</p>
                      <h2 className="font-extrabold text-[#002040] mt-1 text-base">{product.name}</h2>
                      <p className="text-xs text-slate-500">{product.activeIngredient}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {[product.strength, product.form, product.packSize].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    {product.warningText && (
                      <div className="flex gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-lg p-2.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>{product.warningText}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-black text-[#002040]">{formatKsh(unitPrice(product))}</p>
                        {accountMode === 'b2b' && (
                          <p className="text-[10px] text-slate-400 line-through">{formatKsh(product.priceKsh)}</p>
                        )}
                        <p className={`text-[11px] font-semibold ${product.inStock ? 'text-[#007838]' : 'text-red-600'}`}>
                          {product.inStock ? 'In stock' : 'Out of stock'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                          !product.inStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : product.prescriptionRequired
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-[#007838] hover:bg-[#005828] text-white'
                        }`}
                      >
                        {product.prescriptionRequired ? 'Upload Rx to Order' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* How it works */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-black text-[#002040] text-center">How Dawa2U works</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { icon: Search, title: '1. Find your medicine', text: 'Search by brand, generic or active ingredient.' },
              { icon: Stethoscope, title: '2. Pharmacist verifies', text: 'Prescription items are reviewed by a registered pharmacist.' },
              { icon: CreditCard, title: '3. Pay securely', text: 'Pay with M-Pesa or card once your order is confirmed.' },
              { icon: Truck, title: '4. Delivered to you', text: 'We pack, dispatch and track your order to your door.' }
            ].map(step => (
              <div key={step.title} className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#007838] flex items-center justify-center mx-auto">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#002040] text-sm">{step.title}</h3>
                <p className="text-xs text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ask a Pharmacist */}
      <section id="ask-pharmacist" className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <MessageCircle className="w-6 h-6 text-[#007838]" />
              <h2 className="text-xl font-black text-[#002040]">Ask a Pharmacist</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Questions about a medicine, dosage or side effects? A registered pharmacist will respond. For emergencies, visit the nearest health facility.
            </p>

            {askSent ? (
              <div className="flex gap-3 items-start bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-[#007838] shrink-0" />
                <div>
                  <p className="font-bold">Question received</p>
                  <p>A pharmacist will get back to you shortly.</p>
                  <button onClick={() => setAskSent(false)} className="mt-2 underline font-semibold text-[#007838]">Ask another question</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAskSubmit} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={askForm.name} onChange={e => setAskForm({ ...askForm, name: e.target.value })} placeholder="Your name" className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]" />
                  <input value={askForm.phone} onChange={e => setAskForm({ ...askForm, phone: e.target.value })} placeholder="Phone (e.g. 0712 345 678)" className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]" />
                </div>
                <textarea value={askForm.question} onChange={e => setAskForm({ ...askForm, question: e.target.value })} rows={4} placeholder="Type your medicine question (minimum 10 characters)..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007838]" />
                <button type="submit" disabled={askForm.question.trim().length < 10} className="bg-[#007838] hover:bg-[#005828] disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">
                  Send to Pharmacist
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002040] text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-white font-black text-lg">Dawa<span className="text-emerald-400">2U</span></p>
            <p className="mt-1">Healthcare Delivered</p>
            <p className="mt-3">Registered business: Dawa To You</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold mb-2">Shop</p>
            <p>Medicine Catalogue</p><p>Prescription Upload</p><p>Ask a Pharmacist</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold mb-2">Company</p>
            <p>About Us</p><p>Contact Us</p><p>FAQs</p><p>Delivery Policy</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold mb-2">Legal</p>
            <p>Terms &amp; Conditions</p><p>Privacy Policy</p><p>Returns/Refund Policy</p><p>Prescription Policy</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 px-4 text-center">
          <p className="flex items-center justify-center gap-2 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Regulated by the Pharmacy and Poisons Board (PPB) · Reg No: PPB/ONLINE/2026
          </p>
          <p className="mt-1 text-slate-400 text-[10px]">© 2026 Dawa To You. All rights reserved. Prescription medicines dispensed only after pharmacist verification.</p>
        </div>
      </footer>

      {/* Cart Drawer & Prescription Modals can remain appended here... */}
    </div>
  );
}