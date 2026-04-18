"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Smartphone, Monitor, Download, Chrome, Apple, Star,
  Shield, Zap, Wifi, Bell, ShoppingBag, ArrowRight,
  CheckCircle, Play, Globe, Package, Sparkles, ChevronDown,
  ExternalLink,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ─── Static data ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,       title: "Lightning Fast",    desc: "Instant load times with offline support",       color: "from-yellow-400 to-orange-500" },
  { icon: Bell,      title: "Push Notifications",desc: "Never miss a deal or order update",             color: "from-purple-400 to-pink-500"   },
  { icon: Wifi,      title: "Works Offline",     desc: "Browse products even without internet",         color: "from-blue-400 to-cyan-500"     },
  { icon: Shield,    title: "Secure & Private",  desc: "Bank-grade security for your data",             color: "from-green-400 to-emerald-500" },
  { icon: ShoppingBag, title: "One-tap Shopping",desc: "Checkout faster than ever before",              color: "from-rose-400 to-red-500"      },
  { icon: Star,      title: "Exclusive Deals",   desc: "App-only offers and early access sales",        color: "from-amber-400 to-yellow-500"  },
];

const STEPS_IOS = [
  { step: "1", text: 'Tap the Share button (□↑) at the bottom of Safari' },
  { step: "2", text: 'Scroll down and tap "Add to Home Screen"' },
  { step: "3", text: 'Tap "Add" in the top-right corner' },
];

const STEPS_ANDROID = [
  { step: "1", text: 'Tap the three-dot menu (⋮) in Chrome' },
  { step: "2", text: 'Tap "Add to Home screen" or "Install app"' },
  { step: "3", text: 'Tap "Add" or "Install" to confirm' },
];

const STEPS_DESKTOP = [
  { step: "1", text: 'Look for the install icon (⊕) in the address bar' },
  { step: "2", text: 'Click "Install EasyShop" in the popup' },
  { step: "3", text: 'The app opens in its own window — enjoy!' },
];

// ─── Floating particle component ─────────────────────────────────────────────
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute rounded-full opacity-20 animate-pulse pointer-events-none"
    style={style}
  />
);

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [activeTab, setActiveTab] = useState<"pwa" | "android">("pwa");
  const [showSteps, setShowSteps] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Detect platform
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");
  }, []);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Animated counter
  const [counts, setCounts] = useState({ users: 0, products: 0, rating: 0 });
  useEffect(() => {
    const targets = { users: 50000, products: 120000, rating: 49 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        users:    Math.round(targets.users    * ease),
        products: Math.round(targets.products * ease),
        rating:   Math.round(targets.rating   * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      setInstalling(false);
    } else {
      setShowSteps(true);
    }
  };

  const currentSteps =
    platform === "ios" ? STEPS_IOS :
    platform === "android" ? STEPS_ANDROID :
    STEPS_DESKTOP;

  const particles = Array.from({ length: 12 }, (_, i) => ({
    width:  `${20 + (i * 17) % 40}px`,
    height: `${20 + (i * 17) % 40}px`,
    top:    `${(i * 31) % 90}%`,
    left:   `${(i * 23) % 90}%`,
    background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#ec4899" : "#f59e0b",
    animationDelay: `${i * 0.3}s`,
    animationDuration: `${2 + (i % 3)}s`,
  }));

  return (
    <div className="min-h-screen bg-[#f1f1f1] overflow-x-hidden">

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white"
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-20 animate-[spin_20s_linear_infinite]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500 rounded-full opacity-20 animate-[spin_25s_linear_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600 rounded-full opacity-10 animate-pulse" />
          {particles.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-medium animate-bounce">
            <Sparkles size={16} className="text-yellow-400" />
            Now available as an app
          </div>

          {/* App icon */}
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-[bounce_3s_ease-in-out_infinite]">
              <ShoppingBag size={56} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle size={18} className="text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                EasyShop
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl">
              Install the app for a faster, richer shopping experience — right on your device.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-2">
            {[
              { value: `${(counts.users / 1000).toFixed(0)}K+`, label: "Happy Shoppers" },
              { value: `${(counts.products / 1000).toFixed(0)}K+`, label: "Products" },
              { value: `${(counts.rating / 10).toFixed(1)}★`,    label: "App Rating" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-yellow-400">{value}</div>
                <div className="text-sm text-white/60">{label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {installed ? (
            <div className="flex items-center gap-3 bg-green-500/20 border border-green-400/40 rounded-2xl px-8 py-4 text-green-300 text-lg font-semibold">
              <CheckCircle size={24} />
              EasyShop is installed!
            </div>
          ) : (
            <button
              onClick={handleInstall}
              disabled={installing}
              className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 text-black font-black text-lg px-10 py-4 rounded-2xl shadow-2xl shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center gap-3">
                {installing ? (
                  <span className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                ) : (
                  <Download size={22} />
                )}
                {installing ? "Installing…" : "Install EasyShop"}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            </button>
          )}

          <ChevronDown size={28} className="text-white/40 animate-bounce mt-4" />
        </div>
      </section>

      {/* ── Tab switcher: PWA vs Android APK ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex bg-white rounded-2xl shadow-md p-1.5 gap-1">
          {[
            { key: "pwa",     icon: Globe,       label: "Install as App (PWA)"   },
            { key: "android", icon: Smartphone,  label: "Android APK"            },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "pwa" | "android")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── PWA Install Panel ── */}
      {activeTab === "pwa" && (
        <section className="max-w-4xl mx-auto px-4 pb-12 space-y-8">

          {/* Platform cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Apple,
                title: "iPhone / iPad",
                subtitle: "iOS Safari",
                gradient: "from-gray-800 to-gray-900",
                steps: STEPS_IOS,
                active: platform === "ios",
              },
              {
                icon: Smartphone,
                title: "Android",
                subtitle: "Chrome Browser",
                gradient: "from-green-600 to-emerald-700",
                steps: STEPS_ANDROID,
                active: platform === "android",
              },
              {
                icon: Monitor,
                title: "Desktop",
                subtitle: "Chrome / Edge",
                gradient: "from-indigo-600 to-purple-700",
                steps: STEPS_DESKTOP,
                active: platform === "desktop",
              },
            ].map(({ icon: Icon, title, subtitle, gradient, steps, active }) => (
              <div
                key={title}
                className={`relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  active ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                }`}
              >
                {active && (
                  <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Your device
                  </div>
                )}
                <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center gap-3`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon size={26} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{title}</div>
                    <div className="text-white/70 text-sm">{subtitle}</div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {steps.map(({ step, text }) => (
                    <div key={step} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                        {step}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* One-click install button (shows when prompt available) */}
          {deferredPrompt && !installed && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-xl shadow-indigo-200">
              <Download size={40} className="mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-black mb-2">Ready to install!</h3>
              <p className="text-white/80 mb-6">Your browser supports one-click installation.</p>
              <button
                onClick={handleInstall}
                disabled={installing}
                className="bg-white text-indigo-700 font-black px-10 py-3 rounded-xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {installing ? "Installing…" : "Install Now"}
              </button>
            </div>
          )}

          {installed && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl">
              <CheckCircle size={48} className="mx-auto mb-4" />
              <h3 className="text-2xl font-black mb-2">Successfully Installed!</h3>
              <p className="text-white/90">EasyShop is now on your device. Enjoy the full app experience!</p>
            </div>
          )}
        </section>
      )}

      {/* ── Android APK Panel ── */}
      {activeTab === "android" && (
        <section className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Android APK</h2>
                <p className="text-gray-500">Direct install for Android devices</p>
              </div>
            </div>

            {/* Coming soon / placeholder for APK links */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6 flex gap-3">
              <Sparkles size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm">
                APK download links will be added here. You can link to Google Drive, direct APK files, or any other source below.
              </p>
            </div>

            {/* APK download slots — you can fill these in */}
            <div className="space-y-4">
              {[
                { label: "EasyShop v1.0 — Google Drive", icon: ExternalLink, href: "#", available: false },
                { label: "EasyShop v1.0 — Direct Download", icon: Download,    href: "#", available: false },
              ].map(({ label, icon: Icon, href, available }) => (
                <a
                  key={label}
                  href={available ? href : undefined}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                    available
                      ? "border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 cursor-pointer"
                      : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${available ? "bg-green-500" : "bg-gray-300"}`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-700">{label}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${available ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {available ? "Download" : "Coming Soon"}
                  </span>
                </a>
              ))}
            </div>

            {/* How to install APK */}
            <div className="mt-8">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <Play size={18} className="text-indigo-600" />
                How to install an APK
              </h3>
              <div className="space-y-3">
                {[
                  "Download the APK file to your Android device",
                  'Go to Settings → Security → Enable "Unknown Sources" or "Install unknown apps"',
                  "Open the downloaded APK file from your Downloads folder",
                  'Tap "Install" and wait for the installation to complete',
                  "Open EasyShop from your app drawer and enjoy!",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Features grid ── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-2">
          Why install the app?
        </h2>
        <p className="text-center text-gray-500 mb-10">Everything you love about EasyShop, supercharged.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-10 text-white text-center shadow-2xl">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative z-10">
            <ShoppingBag size={48} className="mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-black mb-3">Start shopping smarter</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Install EasyShop today and get access to exclusive app-only deals, faster checkout, and real-time order tracking.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleInstall}
                disabled={installing || installed}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black px-8 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-60"
              >
                {installed ? <CheckCircle size={20} /> : <Download size={20} />}
                {installed ? "Installed!" : installing ? "Installing…" : "Install Now"}
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                <ShoppingBag size={20} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
