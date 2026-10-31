'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Building2,
  Search,
  ShoppingCart,
  UploadCloud,
  Menu,
  X,
  Phone,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react';

interface HeaderProps {
  accountMode: 'b2c' | 'b2b';
  setAccountMode: (mode: 'b2c' | 'b2b') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenPrescription: () => void;
}

export default function Header({
  accountMode,
  setAccountMode,
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  onOpenPrescription
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Banner (Regulatory Notice) */}
      <div className="bg-[#007838] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="font-semibold text-[11px] sm:text-xs">
              PPB Registered: Dawa To You · Reg No: PPB/ONLINE/2026[cite: 2]
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-xs">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> FEFO Monitored
            </span>
            <Link href="/#ask-pharmacist" className="hover:underline font-bold flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1" /> Ask a Pharmacist
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#007838] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md">
              D
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002040]">
                Dawa<span className="text-[#007838]">2U</span>
              </span>
              <span className="block text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">
                Healthcare Delivered[cite: 2]
              </span>
            </div>
          </Link>

          {/* Desktop B2C / B2B Mode Toggle */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setAccountMode('b2c')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                accountMode === 'b2c' ? 'bg-white text-[#002040] shadow-sm' : 'text-slate-600'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#007838]" />
              <span>Retail (B2C)</span>
            </button>
            <button
              onClick={() => setAccountMode('b2b')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                accountMode === 'b2b' ? 'bg-white text-[#002040] shadow-sm' : 'text-slate-600'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Wholesale (B2B)</span>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-md mx-2 relative">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search generics, brand names..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#007838] focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenPrescription}
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#007838] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Script</span>
            </button>

            <button
              onClick={onOpenCart}
              aria-label="Open cart"
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#007838] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Field */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search medicines..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#007838]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setAccountMode('b2c')}
              className={`flex-1 py-1.5 rounded-lg ${
                accountMode === 'b2c' ? 'bg-white text-[#002040] shadow-sm' : 'text-slate-600'
              }`}
            >
              Retail (B2C)
            </button>
            <button
              onClick={() => setAccountMode('b2b')}
              className={`flex-1 py-1.5 rounded-lg ${
                accountMode === 'b2b' ? 'bg-white text-[#002040] shadow-sm' : 'text-slate-600'
              }`}
            >
              Wholesale (B2B)
            </button>
          </div>

          <nav className="space-y-2 text-sm font-semibold text-slate-700">
            <Link href="/" className="block py-2 border-b border-slate-100 hover:text-[#007838]">
              Catalogue Home
            </Link>
            <Link href="/about" className="block py-2 border-b border-slate-100 hover:text-[#007838]">
              About Dawa2U[cite: 1]
            </Link>
            <Link href="/prescription-policy" className="block py-2 border-b border-slate-100 hover:text-[#007838]">
              Prescription Policy
            </Link>
            <Link href="/contact" className="block py-2 hover:text-[#007838]">
              Contact Us & Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}