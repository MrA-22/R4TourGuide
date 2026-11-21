"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getTourById,
  createBooking,
  simulatePaymentPaid,
  formatRupiah,
  Tour,
  BookingResponse,
  PaymentMethodType,
} from "@/lib/api";

const PAYMENT_METHODS = [
  {
    id: "qris" as const,
    label: "QRIS",
    desc: "Scan semua aplikasi bank & e-wallet",
    channels: [{ value: "qris_universal", label: "QRIS (Instant)" }],
  },
  {
    id: "va" as const,
    label: "Virtual Account",
    desc: "Transfer otomatis via nomor VA bank",
    channels: [
      { value: "bca_va", label: "BCA Virtual Account" },
      { value: "mandiri_va", label: "Mandiri Virtual Account" },
      { value: "bni_va", label: "BNI Virtual Account" },
      { value: "bri_va", label: "BRI Virtual Account" },
      { value: "permata_va", label: "Permata Virtual Account" },
    ],
  },
  {
    id: "ewallet" as const,
    label: "E-Wallet",
    desc: "Dompet digital populer di Indonesia",
    channels: [
      { value: "gopay", label: "GoPay" },
      { value: "ovo", label: "OVO" },
      { value: "dana", label: "DANA" },
      { value: "shopeepay", label: "ShopeePay" },
    ],
  },
  {
    id: "card" as const,
    label: "Kartu Kredit / Debit",
    desc: "Visa, Mastercard & JCB",
    channels: [
      { value: "visa_mastercard", label: "Visa / Mastercard" },
      { value: "jcb", label: "JCB" },
    ],
  },
  {
    id: "retail" as const,
    label: "Gerai Retail",
    desc: "Bayar tunai di minimarket terdekat",
    channels: [
      { value: "alfamart", label: "Alfamart" },
      { value: "indomaret", label: "Indomaret" },
    ],
  },
  {
    id: "paylater" as const,
    label: "PayLater / Cicilan",
    desc: "Bayar nanti atau cicilan ringan",
    channels: [
      { value: "kredivo", label: "Kredivo" },
      { value: "akulaku", label: "Akulaku PayLater" },
    ],
  },
];

function TourDetailContent() {
  const params = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [participants, setParticipants] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("qris");
  const [paymentChannel, setPaymentChannel] = useState("qris_universal");

  const [submitting, setSubmitting] = useState(false);
  const [confirmingPaid, setConfirmingPaid] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    getTourById(params.id)
      .then((data) => setTour(data))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const selectedMethodObj =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[0];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const result = await createBooking({
        tour_id: tour.id,
        customer_name: customerName,
        email,
        phone,
        travel_date: travelDate,
        participants,
        payment_method: paymentMethod,
        payment_channel: paymentChannel,
      });
      setBookingResult(result);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatePaid = async () => {
    if (!bookingResult) return;
    setConfirmingPaid(true);
    setErrorMsg("");
    try {
      await simulatePaymentPaid(bookingResult.booking_code);
      setBookingResult({ ...bookingResult, status: "PAID" });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal mengonfirmasi pembayaran",
      );
    } finally {
      setConfirmingPaid(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        Memuat detail paket wisata...
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <p className="font-bold text-lg text-slate-900 mb-2">
          Paket wisata tidak ditemukan
        </p>
        <Link
          href="/"
          className="text-sm font-semibold text-teal-700 hover:underline"
        >
          &larr; Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isRajaAmpat = tour.location.toLowerCase().includes("raja ampat");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 transition"
        >
          <span>&larr;</span>
          <span>Kembali ke Daftar Paket</span>
        </Link>

        {isRajaAmpat && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300/70">
            ✦ Raja Ampat Signature Experience
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Detail Destinasi */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="relative h-72 sm:h-80">
            <img
              src={tour.image_url}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
                {tour.location} &bull; {tour.duration}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                {tour.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 mb-2">
              Tentang Perjalanan
            </h2>
            <p className="text-slate-600 leading-relaxed mb-7">
              {tour.description}
            </p>

            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 mb-3">
              Spot &amp; Highlight Utama
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tour.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-cyan-50/70 border border-cyan-900/10 text-sm font-semibold text-slate-800"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kartu Booking */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 lg:sticky lg:top-24">
          <div className="pb-4 mb-5 border-b border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase block">
                Harga per Peserta
              </span>
              <span className="text-2xl font-extrabold text-teal-800">
                {formatRupiah(tour.price_idr)}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800">
              {tour.duration}
            </span>
          </div>

          {bookingResult ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-teal-200 space-y-2.5 text-sm">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-700 text-white text-xs font-bold">
                Booking Tercatat • {bookingResult.gateway || "Midtrans"}
              </div>
              <p className="font-extrabold text-slate-900 text-base">
                Kode: {bookingResult.booking_code}
              </p>
              <div className="text-slate-700 space-y-1 pt-1">
                <p>
                  Paket: <strong>{bookingResult.tour_title}</strong>
                </p>
                <p>Nama: {bookingResult.customer_name}</p>
                <p>Tanggal: {bookingResult.travel_date}</p>
                <p>Peserta: {bookingResult.participants} orang</p>
                <p>
                  Metode:{" "}
                  <strong className="uppercase">
                    {bookingResult.payment_method}
                  </strong>{" "}
                  ({bookingResult.payment_channel})
                </p>
                {bookingResult.snap_token && (
                  <p className="text-xs text-slate-500 break-all">
                    Ref Token: <code>{bookingResult.snap_token}</code>
                  </p>
                )}
                <p>
                  Total:{" "}
                  <strong className="text-teal-800">
                    {formatRupiah(bookingResult.total_idr)}
                  </strong>
                </p>
                <p>
                  Status:{" "}
                  <span
                    className={`font-bold ${
                      bookingResult.status === "PAID"
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {bookingResult.status}
                  </span>
                </p>
              </div>

              {bookingResult.payment_url && (
                <a
                  href={bookingResult.payment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block w-full text-center py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition"
                >
                  Lanjut ke Halaman Pembayaran &rarr;
                </a>
              )}

              {bookingResult.status !== "PAID" && (
                <button
                  type="button"
                  disabled={confirmingPaid}
                  onClick={handleSimulatePaid}
                  className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {confirmingPaid
                    ? "Mengonfirmasi..."
                    : "Konfirmasi Pembayaran (Simulasi)"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setBookingResult(null)}
                className="mt-2 w-full py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Buat Booking Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Arif Rasyid"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp / HP
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Berangkat
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Peserta
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={participants}
                    onChange={(e) =>
                      setParticipants(Math.max(1, Number(e.target.value)))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Pilihan Kategori Pembayaran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Metode Pembayaran (via Midtrans)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id);
                          setPaymentChannel(m.channels[0].value);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          active
                            ? "border-teal-600 bg-teal-50/90 text-teal-950 ring-1 ring-teal-600"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {m.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pilihan Bank / Provider */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Bank / Provider
                </label>
                <select
                  value={paymentChannel}
                  onChange={(e) => setPaymentChannel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-teal-600"
                >
                  {selectedMethodObj.channels.map((ch) => (
                    <option key={ch.value} value={ch.value}>
                      {ch.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">
                  Estimasi Total
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatRupiah(tour.price_idr * participants)}
                </span>
              </div>



              <button
                type="submit"
                disabled={submitting}
                className="group/submit relative w-full py-3.5 rounded-xl bg-gradient-to-r from-[#06283D] via-teal-700 to-cyan-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-teal-900/20 overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <span>
                    {submitting ? "Memproses Pesanan..." : "Pesan Sekarang"}
                  </span>
                  {!submitting && (
                    <span className="transition-transform duration-300 group-hover/submit:translate-x-1">
                      &rarr;
                    </span>
                  )}
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover/submit:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TourDetailPage() {
  return (
    <main className="min-h-screen bg-[#F7FAFC] text-slate-900 py-8 px-4 sm:px-6">
      <Suspense
        fallback={
          <div className="py-16 text-center text-slate-500">
            Memuat halaman...
          </div>
        }
      >
        <TourDetailContent />
      </Suspense>
    </main>
  );
}