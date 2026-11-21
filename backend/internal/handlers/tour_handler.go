package handlers

import (
	"fmt"
	"strings"
	"time"

	"backend-api/internal/models"

	"github.com/gofiber/fiber/v2"
)

type BookingRecord struct {
	BookingCode  string `json:"booking_code"`
	TourID       string `json:"tour_id"`
	TourTitle    string `json:"tour_title"`
	CustomerName string `json:"customer_name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	TravelDate   string `json:"travel_date"`
	Participants int    `json:"participants"`
	TotalIDR     int    `json:"total_idr"`
	Status       string `json:"status"`
}

var bookings = []BookingRecord{}

var tours = []models.Tour{
	{
		ID:          "tour-04",
		Title:       "Piaynemo, Wayag & Misool Lagoon",
		Location:    "Raja Ampat, Papua Barat Daya",
		Duration:    "4 Hari 3 Malam",
		PriceIDR:    5400000,
		ImageURL:    "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf",
		Highlights:  []string{"Puncak Piaynemo", "Telaga Bintang", "Arborek Village", "Snorkeling Misool"},
		Description: "Menjelajahi gugusan karst ikonik, laguna biru jernih, dan terumbu karang terbaik di jantung Raja Ampat.",
	},
}

func GetTours(c *fiber.Ctx) error {
	location := strings.ToLower(strings.TrimSpace(c.Query("location")))
	search := strings.ToLower(strings.TrimSpace(c.Query("search")))

	var result []models.Tour
	for _, t := range tours {
		matchLoc := location == "" || strings.Contains(strings.ToLower(t.Location), location)
		matchSearch := search == "" || strings.Contains(strings.ToLower(t.Title), search) || strings.Contains(strings.ToLower(t.Description), search)

		if matchLoc && matchSearch {
			result = append(result, t)
		}
	}

	if result == nil {
		result = []models.Tour{}
	}

	return c.JSON(fiber.Map{
		"data":  result,
		"total": len(result),
	})
}

func GetTourByID(c *fiber.Ctx) error {
	id := c.Params("id")
	for _, t := range tours {
		if t.ID == id {
			return c.JSON(fiber.Map{"data": t})
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"error": "Paket wisata tidak ditemukan",
	})
}

func CreateBooking(c *fiber.Ctx) error {
	var req models.BookingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format request JSON tidak valid",
		})
	}

	if req.TourID == "" || req.CustomerName == "" || req.Email == "" || req.TravelDate == "" || req.Participants < 1 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Semua data wajib diisi dengan benar",
		})
	}

	var selectedTour *models.Tour
	for i := range tours {
		if tours[i].ID == req.TourID {
			selectedTour = &tours[i]
			break
		}
	}

	if selectedTour == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Paket wisata tidak ditemukan",
		})
	}

	bookingCode := fmt.Sprintf("R4-%d", time.Now().Unix()%1000000)
	totalIDR := selectedTour.PriceIDR * req.Participants

	record := BookingRecord{
		BookingCode:  bookingCode,
		TourID:       selectedTour.ID,
		TourTitle:    selectedTour.Title,
		CustomerName: req.CustomerName,
		Email:        req.Email,
		Phone:        req.Phone,
		TravelDate:   req.TravelDate,
		Participants: req.Participants,
		TotalIDR:     totalIDR,
		Status:       "PENDING_PAYMENT",
	}
	bookings = append(bookings, record)

	res := models.BookingResponse{
		BookingCode:  bookingCode,
		TourTitle:    selectedTour.Title,
		CustomerName: req.CustomerName,
		TravelDate:   req.TravelDate,
		Participants: req.Participants,
		TotalIDR:     totalIDR,
		Status:       record.Status,
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Booking berhasil dibuat",
		"data":    res,
	})
}

func GetBookings(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"data":  bookings,
		"total": len(bookings),
	})
}

func UpdateBookingStatus(c *fiber.Ctx) error {
	code := c.Params("code")
	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil || body.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Status wajib diisi",
		})
	}

	for i := range bookings {
		if bookings[i].BookingCode == code {
			bookings[i].Status = body.Status
			return c.JSON(fiber.Map{
				"message": "Status booking diperbarui",
				"data":    bookings[i],
			})
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"error": "Booking tidak ditemukan",
	})
}

func CreateTour(c *fiber.Ctx) error {
	var req models.Tour
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	if req.Title == "" || req.Location == "" || req.PriceIDR <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title, location, dan price_idr wajib diisi dengan benar",
		})
	}

	if req.ID == "" {
		req.ID = fmt.Sprintf("tour-%d", time.Now().Unix()%100000)
	}
	if req.ImageURL == "" {
		req.ImageURL = "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf"
	}
	if len(req.Highlights) == 0 {
		req.Highlights = []string{"Destinasi Utama", "Pemandu Lokal"}
	}

	tours = append([]models.Tour{req}, tours...)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Paket wisata berhasil ditambahkan",
		"data":    req,
	})
}

func DeleteTour(c *fiber.Ctx) error {
	id := c.Params("id")
	for i, t := range tours {
		if t.ID == id {
			tours = append(tours[:i], tours[i+1:]...)
			return c.JSON(fiber.Map{
				"message": "Paket wisata berhasil dihapus",
			})
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"error": "Paket wisata tidak ditemukan",
	})
}
