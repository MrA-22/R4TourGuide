export interface Tour {
  id: string;
  title: string;
  location: string;
  duration: string;
  price_idr: number;
  image_url: string;
  highlights: string[];
  description: string;
}

export type PaymentMethodType = "qris" | "va" | "ewallet" | "card" | "retail" | "paylater";

export interface BookingPayload {
  tour_id: string;
  customer_name: string;
  email: string;
  phone: string;
  travel_date: string;
  participants: number;
  payment_method: PaymentMethodType;
  payment_channel: string;
}

export interface BookingResponse {
  booking_code: string;
  tour_title: string;
  customer_name: string;
  travel_date: string;
  participants: number;
  total_idr: number;
  payment_method: string;
  payment_channel: string;
  gateway: string;
  snap_token?: string;
  payment_url?: string;
  status: string;
}

export async function simulatePaymentPaid(code: string): Promise<void> {
  const res = await fetch(`${API_URL}/payments/${code}/simulate-paid`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Gagal mengonfirmasi pembayaran");
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function getTours(search = ""): Promise<Tour[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);

  const res = await fetch(`${API_URL}/tours?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Gagal mengambil data paket wisata");
  const json = await res.json();
  return json.data || [];
}

export async function getTourById(id: string): Promise<Tour | null> {
  const res = await fetch(`${API_URL}/tours/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Gagal membuat booking");
  }
  return json.data;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}