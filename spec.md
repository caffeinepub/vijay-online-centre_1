# Specification

## Summary
**Goal:** Add an automatic payment receipt system so that once an admin marks a customer's payment as successful, a digital receipt is instantly generated and viewable/printable by the customer.

**Planned changes:**
- Extend the backend `Customer` record with `paymentStatus` (pending/success), `paymentDate` (timestamp), and `receiptId` (VOC + numeric digits) fields; add `markPaymentSuccess(customerId)` function
- Add `useMarkPaymentSuccess` React Query mutation hook that calls the backend and invalidates the customers cache on success
- Add a "Mark as Paid" button in AdminPage for each unpaid customer row; show a green "Paid" badge and `receiptId` after success
- Create a new `ReceiptPage` at `/receipt` (public route) displaying a clean, white, print-optimized receipt with customer details, payment details (UPI ID: 8173064549@okicici, Receiver: Vijay Online Centre), and receipt number
- Show a pending/polling state on ReceiptPage (polls every 5 seconds) until payment is confirmed, then auto-render the receipt
- Add a mobile number search input on ReceiptPage to look up any receipt by 10-digit mobile number
- Add "Print Receipt" (window.print()) and "Download Slip" (PDF via html2canvas + jsPDF, named VOC-Receipt-{receiptId}.pdf) buttons on ReceiptPage
- Apply `@media print` CSS to hide navigation, buttons, and non-receipt content when printing
- Automatically redirect customers from PaymentPage to ReceiptPage (with customerId param) after the payment step
- Register the `/receipt` route in App.tsx without admin authentication

**User-visible outcome:** After an admin marks a payment as paid, the customer's receipt page instantly shows a styled digital receipt with all payment details, a receipt number, and options to print or download the slip as a PDF. Customers can also look up their receipt anytime by entering their mobile number.
