"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getTours,
  createTour,
  deleteTour,
  getBookings,
  updateBookingStatus,
  formatRupiah,
  Tour,
  BookingRecord,
} from "@/lib/api";

const STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function AdminDashboardPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Filter & Search di Admin
  const [tourQuery, setTourQuery] = useState("");
  const [bookingFilter, setBookingFilter] = useState("ALL");

  // Form tambah paket wisata
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Raja Ampat, Papua Barat Daya");
  const [duration, setDuration] = useState("4 Hari 3 Malam");
  const [priceIDR, setPriceIDR] = useState(4500000);
  const [imageURL, setImageURL] = useState(
    "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf"
  );
  const [highlightsText, setHighlightsText] = useState("Piaynemo, Telaga Bintang, Wayag");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAllData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const [tourData, bookingData] = await Promise.all([getTours(), getBookings()]);
      setTours(tourData);
      setBookings(bookingData);
    } catch {
      setError("Gagal terhubung ke Backend Go Fiber (http://localhost:8080).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [tourData, bookingData] = await Promise.all([getTours(), getBookings()]);
        if (!active) return;
        setTours(tourData);
        setBookings(bookingData);
        setError("");
      } catch {
        if (!active) return;
        setError("Gagal terhubung ke Backend Go Fiber (http://localhost:8080).");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredTours = useMemo(() => {
    const q = tourQuery.trim().toLowerCase();
    if (!q) return tours;
    return tours.filter(
      (t) => t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q)
    );
  }, [tours, tourQuery]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "ALL") return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  const handleAddTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const highlights = highlightsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createTour({
        title,
        location,
        duration,
        price_idr: Number(priceIDR),
        image_url: imageURL,
        highlights,
        description,
      });

      setTitle("");
      setDescription("");
      setMessage("Paket wisata baru berhasil ditambahkan dan langsung tersedia di website travel.");
      await loadAllData(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menambah paket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTour = async (id: string) => {
    setMessage("");
    setError("");
    try {
      await deleteTour(id);
      setMessage("Paket wisata berhasil dihapus.");
      await loadAllData(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus paket");
    }
  };

  const handleStatusChange = async (code: string, status: string) => {
    setMessage("");
    setError("");
    try {
      await updateBookingStatus(code, status);
      setMessage(`Status booking ${code} diperbarui menjadi ${status}.`);
      await loadAllData(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-100">
      {/* Topbar */}
      <header className="border-b border-cyan-900/40 bg-[#071322]/85 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-400 to-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-md shadow-cyan-500/20">
              R4
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white">R4TourGuide</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                  RAJA AMPAT ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pusat Kelola Paket Wisata &amp; Reservasi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadAllData(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-200 border border-slate-700 active:scale-[0.98] transition cursor-pointer"
          >
            ↻ Sync Data
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#081221] border border-cyan-900/40">
            <span className="text-xs text-slate-400 font-medium">Total Paket Wisata</span>
            <p className="text-3xl font-extrabold text-white mt-1">{tours.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#081221] border border-amber-500/25">
            <span className="text-xs text-slate-400 font-medium">Total Booking Masuk</span>
            <p className="text-3xl font-extrabold text-amber-300 mt-1">{bookings.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#081221] border border-teal-500/25">
            <span className="text-xs text-slate-400 font-medium">Estimasi Omzet</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-300 mt-1">
              {formatRupiah(bookings.reduce((acc, b) => acc + b.total_idr, 0))}
            </p>
          </div>
        </div>

        {/* Form Tambah Paket + Daftar Paket */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form
            onSubmit={handleAddTour}
            className="p-6 rounded-3xl bg-[#0A1628] border border-slate-800/90 space-y-3.5 shadow-xl"
          >
            <h2 className="text-lg font-extrabold text-white">Tambah Paket Wisata</h2>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Judul Paket</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Wayag & Piaynemo Explorer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Lokasi</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Durasi</label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  min={10000}
                  required
                  value={priceIDR}
                  onChange={(e) => setPriceIDR(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">URL Gambar</label>
              <input
                type="url"
                value={imageURL}
                onChange={(e) => setImageURL(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Highlights (pisahkan koma)
              </label>
              <input
                type="text"
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Deskripsi</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat perjalanan..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 hover:brightness-105 text-slate-950 font-extrabold text-sm overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="relative z-10">
                {submitting ? "Menyimpan..." : "+ Simpan Paket Wisata"}
              </span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            </button>
          </form>

          {/* Tabel Paket Wisata */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0A1628] border border-slate-800/90 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-extrabold text-white">Daftar Paket Wisata Aktif</h2>
              <input
                type="text"
                value={tourQuery}
                onChange={(e) => setTourQuery(e.target.value)}
                placeholder="Filter paket / lokasi..."
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {loading ? (
              <p className="text-sm text-slate-400">Memuat data...</p>
            ) : filteredTours.length === 0 ? (
              <p className="text-sm text-slate-400">Tidak ada paket yang cocok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 pr-4">Paket</th>
                      <th className="py-2.5 pr-4">Lokasi</th>
                      <th className="py-2.5 pr-4">Harga</th>
                      <th className="py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredTours.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-white">{t.title}</td>
                        <td className="py-3.5 pr-4 text-slate-300 text-xs">{t.location}</td>
                        <td className="py-3.5 pr-4 text-cyan-300 font-bold">
                          {formatRupiah(t.price_idr)}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTour(t.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/25 text-xs font-semibold active:scale-[0.97] transition cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Tabel Booking Masuk */}
        <div className="p-6 rounded-3xl bg-[#0A1628] border border-slate-800/90 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-extrabold text-white">Data Booking Wisatawan</h2>

            <div className="flex flex-wrap gap-1.5">
              {["ALL", "PENDING_PAYMENT", "CONFIRMED", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setBookingFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    bookingFilter === st
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <p className="text-sm text-slate-400">
              Belum ada booking untuk filter ini. Coba buat booking dari website travel (`:3000`).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 pr-4">Kode</th>
                    <th className="py-2.5 pr-4">Wisatawan</th>
                    <th className="py-2.5 pr-4">Paket</th>
                    <th className="py-2.5 pr-4">Tanggal</th>
                    <th className="py-2.5 pr-4">Total</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredBookings.map((b) => (
                    <tr key={b.booking_code} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 pr-4 font-mono text-xs font-bold text-amber-300">
                        {b.booking_code}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-white">{b.customer_name}</div>
                        <div className="text-xs text-slate-400">{b.phone}</div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-200">{b.tour_title}</td>
                      <td className="py-3.5 pr-4 text-slate-300 text-xs">{b.travel_date}</td>
                      <td className="py-3.5 pr-4 font-bold text-cyan-300">
                        {formatRupiah(b.total_idr)}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              STATUS_BADGE[b.status] ||
                              "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {b.status}
                          </span>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.booking_code, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white"
                          >
                            <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}