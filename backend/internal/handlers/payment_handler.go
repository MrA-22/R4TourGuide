package handlers

import (
	"bytes"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"backend-api/internal/models"

	"github.com/gofiber/fiber/v2"
)

type MidtransWebhookPayload struct {
	OrderID           string `json:"order_id"`
	StatusCode        string `json:"status_code"`
	GrossAmount       string `json:"gross_amount"`
	SignatureKey      string `json:"signature_key"`
	TransactionStatus string `json:"transaction_status"`
	FraudStatus       string `json:"fraud_status"`
}

func midtransBaseURL() string {
	if strings.EqualFold(os.Getenv("MIDTRANS_IS_PRODUCTION"), "true") {
		return "https://app.midtrans.com"
	}
	return "https://app.sandbox.midtrans.com"
}

func midtransAPIBaseURL() string {
	if strings.EqualFold(os.Getenv("MIDTRANS_IS_PRODUCTION"), "true") {
		return "https://api.midtrans.com"
	}
	return "https://api.sandbox.midtrans.com"
}

func mapMidtransPaymentType(method, channel string) []string {
	switch strings.ToLower(method) {
	case "qris":
		return []string{"qris"}
	case "va":
		return []string{"bank_transfer"}
	case "ewallet":
		switch strings.ToLower(channel) {
		case "shopeepay":
			return []string{"shopeepay"}
		default:
			return []string{"gopay", "qris"}
		}
	case "card":
		return []string{"credit_card"}
	case "retail":
		return []string{"cstore"}
	case "paylater":
		return []string{"akulaku", "kredivo"}
	default:
		return []string{"qris", "bank_transfer", "gopay", "shopeepay", "credit_card", "cstore"}
	}
}

func createMidtransSnapTransaction(record models.BookingRecord) (token string, redirectURL string, err error) {
	serverKey := strings.TrimSpace(os.Getenv("MIDTRANS_SERVER_KEY"))
	if serverKey == "" {
		return "", "", errors.New("MIDTRANS_SERVER_KEY belum dikonfigurasi di server")
	}

	endpoint := midtransBaseURL() + "/snap/v1/transactions"
	unitPrice := record.TotalIDR / maxInt(1, record.Participants)

	payload := map[string]any{
		"transaction_details": map[string]any{
			"order_id":     record.BookingCode,
			"gross_amount": record.TotalIDR,
		},
		"enabled_payments": mapMidtransPaymentType(record.PaymentMethod, record.PaymentChannel),
		"customer_details": map[string]any{
			"first_name": record.CustomerName,
			"email":      record.Email,
			"phone":      record.Phone,
		},
		"item_details": []map[string]any{
			{
				"id":       record.TourID,
				"price":    unitPrice,
				"quantity": record.Participants,
				"name":     record.TourTitle,
			},
		},
	}

	rawBody, err := json.Marshal(payload)
	if err != nil {
		return "", "", err
	}

	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(rawBody))
	if err != nil {
		return "", "", err
	}
	req.SetBasicAuth(serverKey, "")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", "", errors.New("gagal membuat transaksi di Midtrans")
	}

	var snapResp struct {
		Token       string `json:"token"`
		RedirectURL string `json:"redirect_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&snapResp); err != nil {
		return "", "", err
	}

	return snapResp.Token, snapResp.RedirectURL, nil
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func verifyMidtransSignature(orderID, statusCode, grossAmount, signatureKey, serverKey string) bool {
	if serverKey == "" || signatureKey == "" {
		return false
	}
	raw := orderID + statusCode + grossAmount + serverKey
	sum := sha512.Sum512([]byte(raw))
	expected := hex.EncodeToString(sum[:])
	return strings.EqualFold(expected, signatureKey)
}

func mapTransactionStatus(txStatus, fraudStatus string) string {
	switch txStatus {
	case "capture":
		if fraudStatus == "accept" || fraudStatus == "" {
			return "PAID"
		}
		return "PENDING_PAYMENT"
	case "settlement":
		return "PAID"
	case "deny", "cancel", "expire":
		return "CANCELLED"
	default:
		return "PENDING_PAYMENT"
	}
}

func MidtransWebhook(c *fiber.Ctx) error {
	var payload MidtransWebhookPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payload webhook tidak valid"})
	}

	serverKey := strings.TrimSpace(os.Getenv("MIDTRANS_SERVER_KEY"))
	if !verifyMidtransSignature(
		payload.OrderID,
		payload.StatusCode,
		payload.GrossAmount,
		payload.SignatureKey,
		serverKey,
	) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Signature webhook tidak valid"})
	}

	newStatus := mapTransactionStatus(payload.TransactionStatus, payload.FraudStatus)

	for i := range bookings {
		if bookings[i].BookingCode == payload.OrderID {
			bookings[i].Status = newStatus
			return c.JSON(fiber.Map{
				"message":  "Webhook diproses",
				"order_id": payload.OrderID,
				"status":   newStatus,
			})
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order ID tidak ditemukan"})
}

// Mengecek status pembayaran langsung ke Midtrans Core/Status API berdasarkan kode booking
func CheckMidtransPaymentStatus(c *fiber.Ctx) error {
	code := c.Params("code")
	serverKey := strings.TrimSpace(os.Getenv("MIDTRANS_SERVER_KEY"))
	if serverKey == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "MIDTRANS_SERVER_KEY belum dikonfigurasi",
		})
	}

	url := midtransAPIBaseURL() + "/v2/" + code + "/status"
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal membuat request status"})
	}
	req.SetBasicAuth(serverKey, "")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 12 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "Gagal menghubungi Midtrans"})
	}
	defer resp.Body.Close()

	var midtransStatus struct {
		TransactionStatus string `json:"transaction_status"`
		FraudStatus       string `json:"fraud_status"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&midtransStatus); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal membaca respons Midtrans"})
	}

	mapped := mapTransactionStatus(midtransStatus.TransactionStatus, midtransStatus.FraudStatus)

	for i := range bookings {
		if bookings[i].BookingCode == code {
			bookings[i].Status = mapped
			return c.JSON(fiber.Map{
				"booking_code": code,
				"status":       mapped,
				"data":         bookings[i],
			})
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Booking tidak ditemukan"})
}
