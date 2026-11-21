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

export interface NewTourPayload {
  title: string;
  location: string;
  duration: string;
  price_idr: number;
  image_url: string;
  highlights: string[];
  description: string;
}

export interface BookingRecord {
  booking_code: string;
  tour_id: string;
  tour_title: string;
  customer_name: string;
  email: string;
  phone: string;
  travel_date: string;
  participants: number;
  total_idr: number;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function getTours(): Promise<Tour[]> {
  const res = await fetch(`${API_URL}/tours`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat paket wisata");
  const json = await res.json();
  return json.data || [];
}

export async function createTour(payload: NewTourPayload): Promise<Tour> {
  const res = await fetch(`${API_URL}/tours`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Gagal menambah paket wisata");
  return json.data;
}

export async function deleteTour(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tours/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Gagal menghapus paket wisata");
  }
}

export async function getBookings(): Promise<BookingRecord[]> {
  const res = await fetch(`${API_URL}/bookings`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat data booking");
  const json = await res.json();
  return json.data || [];
}

export async function updateBookingStatus(
  code: string,
  status: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/bookings/${code}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Gagal memperbarui status booking");
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
