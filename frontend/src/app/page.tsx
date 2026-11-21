"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getTours, formatRupiah, Tour } from "@/lib/api";

const QUICK_FILTERS = ["Semua", "Raja Ampat", "Komodo", "Bromo", "Bali"];

const RAJA_AMPAT_SPOTS = [
  {
    name: "Piaynemo & Telaga Bintang",
    tag: "Iconic Karst Viewpoint",
    desc: "Pemandangan gugusan pulau karst dan laguna berbentuk bintang dari puncak kayu ikonik.",
  },
  {
    name: "Wayag Lagoon",
    tag: "Northern Raja Ampat",
    desc: "Gugusan puncak batu kapur di ujung utara dengan gradasi air laut biru toska.",
  },
  {
    name: "Misool Reef & Lagoon",
    tag: "Marine Biodiversity",
    desc: "Surga snorkeling dan laguna tersembunyi dengan terumbu karang warna-warni.",
  },
];

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [activeSpotIdx, setActiveSpotIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTours = useCallback(async (keyword = "", showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError("");
    try {
      const data = await getTours(keyword);
      setTours(data);
    } catch {
      setError("Gagal terhubung ke backend Go Fiber (pastikan server port 8080 aktif).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getTours("");
        if (!active) return;
        setTours(data);
        setError("");
      } catch {
        if (!active) return;
        setError("Gagal terhubung ke backend Go Fiber (pastikan server port 8080 aktif).");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilter("Semua");
    fetchTours(search, true);
  };

  const handleQuickFilter = (label: string) => {
    setActiveFilter(label);
    const query = label === "Semua" ? "" : label;
    setSearch(label === "Semua" ? "" : label);
    fetchTours(query, true);
  };

  const currentSpot = RAJA_AMPAT_SPOTS[activeSpotIdx];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F8FA] text-slate-900 selection:bg-teal-600 selection:text-white">
      {/* Floating Glass Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-cyan-950/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#041C2C] via-teal-600 to-amber-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-900/20 overflow-hidden">
              <span className="relative z-10">R4</span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            </span>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                R4Tour<span className="text-teal-700">Guide</span>
              </span>
              <span className="hidden sm:block text-[11px] font-semibold text-cyan-900/70 -mt-1">
                Raja Ampat &amp; Nusantara
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickFilter("Raja Ampat")}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold bg-amber-400/15 text-amber-950 hover:bg-amber-400/25 border border-amber-500/30 active:scale-[0.98] transition cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              Raja Ampat Edition
            </button>

            <Link
              href="/tours/tour-04"
              className="group relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-teal-900 text-white text-xs sm:text-sm font-semibold shadow-sm overflow-hidden active:scale-[0.98] transition-all"
            >
              <span className="relative z-10">Booking Raja Ampat</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                &rarr;
              </span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section dengan Raja Ampat Interactive Spot Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#031521] via-[#07475B] to-[#0E8388] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="pointer-events-none absolute -top-20 -right-16 w-[26rem] h-[26rem] rounded-full bg-amber-300/20 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 w-[28rem] h-[28rem] rounded-full bg-cyan-300/20 blur-3xl animate-float-reverse" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-amber-200 mb-5">
                <span>✦</span>
                <span>Raja Ampat • Papua Barat Daya</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] mb-4">
                Jelajahi Laguna{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-cyan-200">
                  Raja Ampat
                </span>{" "}
                &amp; Destinasi Terbaik
              </h1>

              <p className="text-base text-cyan-50/90 leading-relaxed mb-7 max-w-2xl">
                Temukan paket perjalanan terkurasi lengkap dengan pemandu lokal, rute laut dan
                daratan yang rapi, serta pemesanan instan langsung ke sistem.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="p-2 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-cyan-950/35 ring-1 ring-white/40 flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari destinasi (Piaynemo, Wayag, Komodo, Bromo, Bali)..."
                  className="flex-1 px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="relative z-10">Cari Paket</span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </button>
              </form>

              {/* Quick Filter Pills */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-cyan-100/80 mr-1 font-medium">Destinasi:</span>
                {QUICK_FILTERS.map((item) => {
                  const active = activeFilter === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleQuickFilter(item)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold active:scale-[0.97] transition-all cursor-pointer ${
                        active
                          ? "bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/15 backdrop-blur-sm"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Raja Ampat Spot Showcase */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                    ✦ Raja Ampat Highlight
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-100 text-[11px] font-semibold">
                    {currentSpot.tag}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-white mb-2">{currentSpot.name}</h2>
                <p className="text-sm text-cyan-50/85 leading-relaxed mb-5 min-h-[3.75rem]">
                  {currentSpot.desc}
                </p>

                {/* Spot Switcher Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {RAJA_AMPAT_SPOTS.map((spot, idx) => (
                    <button
                      key={spot.name}
                      type="button"
                      onClick={() => setActiveSpotIdx(idx)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        idx === activeSpotIdx
                          ? "bg-amber-300 text-slate-950 shadow-sm"
                          : "bg-white/10 text-cyan-100 hover:bg-white/15"
                      }`}
                    >
                      Spot 0{idx + 1}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-cyan-200/80 block">Paket Unggulan</span>
                    <span className="text-sm font-extrabold text-amber-200">
                      Piaynemo, Wayag &amp; Misool
                    </span>
                  </div>
                  <Link
                    href="/tours/tour-04"
                    className="group/cta inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-xs font-extrabold transition active:scale-[0.98]"
                  >
                    <span>Lihat Paket</span>
                    <span className="transition-transform group-hover/cta:translate-x-0.5">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Bento Strip */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/[0.04] hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center mb-3">
                01
              </div>
              <h2 className="font-bold text-slate-900 text-sm mb-1">Pemandu Lokal Terpercaya</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rute laut &amp; darat terarah dengan pendampingan lokal di setiap destinasi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/[0.04] hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center mb-3">
                02
              </div>
              <h2 className="font-bold text-slate-900 text-sm mb-1">Harga Transparan &amp; Instan</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estimasi biaya dihitung otomatis sesuai jumlah peserta sebelum booking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-cyan-500/25 shadow-lg shadow-cyan-900/[0.05] hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#041C2C] to-teal-700 text-amber-200 font-bold text-xs flex items-center justify-center mb-3">
                ✦
              </div>
              <h2 className="font-bold text-slate-900 text-sm mb-1">Kurasi Raja Ampat &amp; Nusantara</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilihan trip bahari, pegunungan, dan budaya dengan detail itinerary jelas.
              </p>
            </div>
          </div>
        </section>

        {/* Daftar Paket Wisata */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700">
                Eksplorasi Paket
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Paket Wisata Pilihan
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Menampilkan <strong className="text-slate-900">{tours.length}</strong> paket tersedia
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-96 rounded-3xl bg-white border border-slate-200/80 animate-pulse p-5"
                />
              ))}
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-14 px-4 rounded-3xl bg-white border border-slate-200/80">
              <p className="font-bold text-slate-900 mb-1">Paket wisata tidak ditemukan</p>
              <p className="text-sm text-slate-500 mb-4">
                Coba kata kunci lain atau tampilkan semua paket.
              </p>
              <button
                type="button"
                onClick={() => handleQuickFilter("Semua")}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold active:scale-[0.98] transition cursor-pointer"
              >
                Tampilkan Semua Paket
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {tours.map((tour) => {
                const isRajaAmpat = tour.location.toLowerCase().includes("raja ampat");
                return (
                  <article
                    key={tour.id}
                    className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
                      isRajaAmpat
                        ? "border-cyan-500/40 shadow-lg shadow-cyan-900/10 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-900/15"
                        : "border-slate-200/80 shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/10"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={tour.image_url}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />

                      <div className="absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2">
                        {isRajaAmpat ? (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-slate-950 text-[11px] font-extrabold shadow-sm">
                            ✦ Raja Ampat Signature
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="px-3 py-1 rounded-full bg-slate-950/65 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                          {tour.duration}
                        </span>
                      </div>

                      <div className="absolute bottom-3.5 left-4 right-4 text-white text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                        <span>{tour.location}</span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors mb-2 leading-snug">
                          {tour.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                          {tour.description}
                        </p>

                        {tour.highlights && tour.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {tour.highlights.slice(0, 3).map((hl, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-cyan-50/90 border border-cyan-900/10 text-cyan-950 text-[11px] font-semibold"
                              >
                                {hl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                            Mulai dari
                          </span>
                          <span className="text-base font-extrabold text-teal-800">
                            {formatRupiah(tour.price_idr)}
                          </span>
                        </div>

                        <Link
                          href={`/tours/${tour.id}`}
                          className="group/btn relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-800 hover:to-cyan-800 text-white text-xs sm:text-sm font-bold shadow-sm shadow-teal-900/15 overflow-hidden active:scale-[0.97] transition-all"
                        >
                          <span className="relative z-10">Booking</span>
                          <span className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5">
                            &rarr;
                          </span>
                          <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#031521] text-cyan-100/80 py-8 px-4 sm:px-6 border-t border-cyan-900/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-semibold text-white">
            R4TourGuide <span className="text-amber-300">&bull;</span> Raja Ampat &amp; Nusantara
          </p>
          <p>Go (Fiber) + Next.js App Router</p>
        </div>
      </footer>
    </div>
  );
}