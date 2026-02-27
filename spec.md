# Specification

## Summary
**Goal:** Fix admin login authentication, add application rejection flow, enforce confirm-first QR reveal logic, and ensure correct payment verification flow for the Vijay Online Centre app.

**Planned changes:**
- Reset backend admin authentication so only username `vijay@123` / password `vijay@123456` are valid; return a session token on success and a clear error on failure; ensure all protected admin endpoints validate this token correctly.
- Add a `rejectApplication(appId, adminToken)` backend function that validates the token, removes the application from the data store, and stores a rejection message retrievable by the customer's polling mechanism.
- In the Admin Dashboard "Active Requests" tab, add a green "CONFIRM" and red "REJECT" button per application row; clicking "REJECT" removes the row after a successful backend call; clicking "CONFIRM" reveals the fee input and "Set Price & Generate QR" button.
- Display all uploaded documents as inline image thumbnails or download links in each admin application row so the admin can review before acting.
- Update the customer PaymentPage polling logic: if status is "Rejected", stop polling and show the rejection message "Your request was rejected by Vijay Ji. Please contact for details." with no QR code shown.
- Enforce confirm-first QR reveal: the UPI QR code is only shown to the customer once the backend status reaches "PriceSet" (after admin sets fee and clicks "CONFIRM").
- After the customer clicks "I Have Paid", update status to "PaymentPendingVerification" and show a waiting spinner message.
- In the admin "Payments to Verify" tab, show a "DONE" button per row; clicking it calls `confirmPayment` and moves the application to "Completed".
- Once status is "Completed", the customer's screen transitions to "Payment Successful ✅" with a receipt showing Customer Name, Service Name, Amount Paid, and Application ID.

**User-visible outcome:** Admins can log in without errors, review uploaded documents, and choose to confirm or reject each request. Customers see the payment QR only after admin confirmation, receive a clear rejection message if rejected, and see a success receipt once the admin marks payment as done.
