# Booking Request Payloads for Each Category

## Important Notes

- `userId` is automatically taken from the authenticated user (req.user.id) - **don't include it in the request body**
- The `protect` middleware must be used to get the authenticated user

## Common Fields (All Categories)

- `vendorId` (required): The ID of the vendor you're booking with
- `category` (required): One of: "hotel", "restaurant", "shortlet", "services", "event"
- `message` (optional): Any special message or notes
- `details` (required): Category-specific booking information (see examples below)

## 1. Hotel Booking

```json
{
  "vendorId": "507f1f77bcf86cd799439011",
  "category": "hotel",
  "message": "Please confirm availability",
  "details": {
    "checkInDate": "2024-12-25",
    "checkOutDate": "2024-12-28",
    "roomType": "Deluxe Suite",
    "numberOfGuests": 2,
    "numberOfRooms": 1,
    "specialRequests": "Late check-in preferred"
  }
}
```

## 2. Restaurant Booking

```json
{
  "vendorId": "507f1f77bcf86cd799439011",
  "category": "restaurant",
  "message": "Anniversary dinner",
  "details": {
    "reservationDate": "2024-12-20",
    "reservationTime": "19:00",
    "numberOfGuests": 4,
    "specialRequests": "Window seat preferred, vegetarian options needed"
  }
}
```

## 3. Shortlet Booking

```json
{
  "vendorId": "507f1f77bcf86cd799439011",
  "category": "shortlet",
  "message": "Weekend getaway",
  "details": {
    "checkInDate": "2024-12-15",
    "checkOutDate": "2024-12-17",
    "numberOfGuests": 3,
    "specialRequests": "Need parking space"
  }
}
```

## 4. Services Booking

```json
{
  "vendorId": "507f1f77bcf86cd799439011",
  "category": "services",
  "message": "Need urgent service",
  "details": {
    "serviceType": "Plumbing",
    "preferredDate": "2024-12-18",
    "preferredTime": "10:00",
    "serviceLocation": "123 Main Street, Lagos",
    "description": "Fixing leaking pipe in kitchen",
    "estimatedDuration": "2 hours"
  }
}
```

## 5. Event Booking

```json
{
  "vendorId": "507f1f77bcf86cd799439011",
  "category": "event",
  "message": "Interested in attending",
  "details": {
    "numberOfTickets": 2,
    "attendeeNames": ["John Doe", "Jane Doe"],
    "specialRequests": "Seats together if possible"
  }
}
```
