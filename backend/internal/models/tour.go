package models

type Tour struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Location    string   `json:"location"`
	Duration    string   `json:"duration"`
	PriceIDR    int      `json:"price_idr"`
	ImageURL    string   `json:"image_url"`
	Highlights  []string `json:"highlights"`
	Description string   `json:"description"`
}

type BookingRequest struct {
	TourID         string `json:"tour_id"`
	CustomerName   string `json:"customer_name"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	TravelDate     string `json:"travel_date"`
	Participants   int    `json:"participants"`
	PaymentMethod  string `json:"payment_method"`  // qris, va, ewallet, card, retail, paylater
	PaymentChannel string `json:"payment_channel"` // bca_va, gopay, dana, visa_mastercard, alfamart, kredivo, dll.
}

type BookingResponse struct {
	BookingCode    string `json:"booking_code"`
	TourTitle      string `json:"tour_title"`
	CustomerName   string `json:"customer_name"`
	TravelDate     string `json:"travel_date"`
	Participants   int    `json:"participants"`
	TotalIDR       int    `json:"total_idr"`
	PaymentMethod  string `json:"payment_method"`
	PaymentChannel string `json:"payment_channel"`
	Gateway        string `json:"gateway"`
	SnapToken      string `json:"snap_token,omitempty"`
	PaymentURL     string `json:"payment_url,omitempty"`
	Status         string `json:"status"`
}

type BookingRecord struct {
	BookingCode    string `json:"booking_code"`
	TourID         string `json:"tour_id"`
	TourTitle      string `json:"tour_title"`
	CustomerName   string `json:"customer_name"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	TravelDate     string `json:"travel_date"`
	Participants   int    `json:"participants"`
	TotalIDR       int    `json:"total_idr"`
	PaymentMethod  string `json:"payment_method"`
	PaymentChannel string `json:"payment_channel"`
	Gateway        string `json:"gateway"`
	Status         string `json:"status"`
}
