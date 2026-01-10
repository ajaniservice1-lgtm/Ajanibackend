# Featured Listings API Documentation

## Overview

The Featured Listings API provides endpoints to retrieve a daily rotated selection of high-quality listings for each category (Hotels, Shortlets, Restaurants, Services, Events).

**Base URL:** `http://localhost:<PORT>/api/v1/listings`

## Endpoints

| Category        | Endpoint                | Method |
| --------------- | ----------------------- | ------ |
| **Hotels**      | `/featured-hotels`      | `GET`  |
| **Shortlets**   | `/featured-shortlets`   | `GET`  |
| **Restaurants** | `/featured-restaurants` | `GET`  |
| **Services**    | `/featured-services`    | `GET`  |
| **Events**      | `/featured-events`      | `GET`  |

---

## Acceptance Criteria

To be eligible for the featured section, a listing must meet **ALL** of the following criteria:

1.  **Status**: Must be `"approved"`.
2.  **Images**: Must have at least **1** image.
3.  **Contact Info**: Must have a valid **Phone Number** OR **WhatsApp Number**.
4.  **Location**: Must have both **Address** AND **Area** populated.

## Rotation Logic

- **Daily Rotation**: The featured listings change automatically every 24 hours (based on the current day of the year).
- **Limit**: A maximum of **6** listings are returned per category.
- **Fairness**: The system rotates through all eligible listings sequentially so every qualified listing gets exposure over time.

---

## Response Format

**Status Code:** `200 OK`

```json
{
  "status": "success",
  "message": "Featured listings retrieved successfully",
  "results": 2,
  "data": [
    {
      "_id": "67816dcb0003023e10750c82",
      "vendorId": "675865e902b66244400e9803",
      "category": "hotel",
      "title": "Luxury Ocean View Suite",
      "description": "Experience the ultimate comfort with our luxury suites overlooking the ocean.",
      "price": 150000,
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "public_id": "..."
        }
      ],
      "location": {
        "address": "123 Coastal Road",
        "area": "Victoria Island",
        "geolocation": {
          "lat": null,
          "lng": null
        }
      },
      "contactInformation": {
        "phone": "+2348012345678",
        "whatsapp": "+2348012345678"
      },
      "status": "approved",
      "details": {
        "roomTypes": [
          {
            "name": "premium",
            "pricePerNight": 150000,
            "capacity": 2,
            "amenities": ["WiFi", "Pool", "Gym"]
          }
        ],
        "checkInTime": "14:00",
        "checkOutTime": "11:00"
      },
      "createdAt": "2025-01-10T19:00:00.000Z",
      "updatedAt": "2025-01-10T19:15:00.000Z"
    },
    {
      ...
    }
  ]
}
```

## Error Handling

If no listings meet the criteria, the API returns an empty array with a 200 status code:

```json
{
  "status": "success",
  "message": "Featured listings retrieved successfully",
  "results": 0,
  "data": []
}
```
