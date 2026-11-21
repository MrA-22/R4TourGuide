package routes

import (
	"backend-api/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "R4TourGuide API"})
	})

	api.Get("/tours", handlers.GetTours)
	api.Get("/tours/:id", handlers.GetTourByID)
	api.Post("/tours", handlers.CreateTour)
	api.Delete("/tours/:id", handlers.DeleteTour)

	api.Get("/bookings", handlers.GetBookings)
	api.Post("/bookings", handlers.CreateBooking)
	api.Patch("/bookings/:code/status", handlers.UpdateBookingStatus)

	api.Post("/payments/midtrans/webhook", handlers.MidtransWebhook)
	api.Get("/payments/:code/status", handlers.CheckMidtransPaymentStatus)
}
