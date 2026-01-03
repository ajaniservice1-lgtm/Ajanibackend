# Listing API Documentation

## Overview

The Listing API lets you get, create, update, and delete listings. Listings are things like hotels, restaurants, shortlets, services, and events that vendors can post.

**Base URL:** `http://localhost:<PORT>/api/v1/listings`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Get All Listings](#1-get-all-listings)
2. [Filtering Listings](#2-filtering-listings)
3. [Sorting Listings](#3-sorting-listings)
4. [Pagination](#4-pagination)
5. [Field Selection](#5-field-selection)
6. [Get Single Listing](#6-get-single-listing)
7. [Get Listings by Vendor](#7-get-listings-by-vendor)
8. [Listing Response Format](#8-listing-response-format)
9. [ReactJS Implementation Guide](#9-reactjs-implementation-guide)

---

## 1. Get All Listings

Gets a list of all listings with options to filter, sort, and paginate.

**Endpoint:** `GET /api/v1/listings`

**Authentication:** Not required

### Basic Request

```bash
GET /api/v1/listings
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "status": "success",
  "message": "Listings retrieved successfully",
  "results": 10,
  "data": {
    "listings": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Luxury Hotel Suite",
        "category": "hotel",
        "description": "Beautiful hotel room with ocean view",
        "price": 50000,
        "location": {
          "address": "123 Beach Road",
          "area": "Lagos Island",
          "geolocation": {
            "lat": 6.5244,
            "lng": 3.3792
          }
        },
        "images": [
          {
            "url": "https://example.com/image1.jpg",
            "public_id": "image1"
          }
        ],
        "vendorId": {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 2. Filtering Listings

You can filter listings by any field in the listing. Filters are added as query parameters in the URL.

### Basic Filtering

Filter by exact match:

```
GET /api/v1/listings?category=hotel
GET /api/v1/listings?status=approved
GET /api/v1/listings?category=restaurant&status=approved
```

### Advanced Filtering (Numbers)

For number fields like `price`, you can use special operators:

- `gte` = greater than or equal (≥)
- `gt` = greater than (>)
- `lte` = less than or equal (≤)
- `lt` = less than (<)

**Examples:**

```
GET /api/v1/listings?price[gte]=10000
GET /api/v1/listings?price[lte]=50000
GET /api/v1/listings?price[gte]=10000&price[lte]=50000
```

This gets listings with price between 10,000 and 50,000.

### Filtering by Category

```
GET /api/v1/listings?category=hotel
GET /api/v1/listings?category=restaurant
GET /api/v1/listings?category=shortlet
GET /api/v1/listings?category=services
GET /api/v1/listings?category=event
```

### Filtering by Status

```
GET /api/v1/listings?status=rejected
GET /api/v1/listings?status=pending
GET /api/v1/listings?status=approved
```

### Filtering by Location

```
GET /api/v1/listings?location.area=Lagos Island
GET /api/v1/listings?location.address=Beach Road
```

### Combining Multiple Filters

You can combine multiple filters:

```
GET /api/v1/listings?category=hotel&status=approved&price[gte]=20000
```

This gets active hotels with price ≥ 20,000.

### Complete Filter Example

```bash
curl "http://localhost:3000/api/v1/listings?category=hotel&status=active&price[gte]=10000&price[lte]=100000"
```

---

## 3. Sorting Listings

Sort listings by any field. Use `-` (minus) for descending order.

### Basic Sorting

```
GET /api/v1/listings?sort=price          # Sort by price (low to high)
GET /api/v1/listings?sort=-price         # Sort by price (high to low)
GET /api/v1/listings?sort=createdAt      # Sort by newest first
GET /api/v1/listings?sort=-createdAt     # Sort by oldest first
GET /api/v1/listings?sort=title          # Sort by title (A to Z)
```

### Default Sorting

If you don't specify sorting, listings are sorted by `-createdAt` (newest first).

### Multiple Field Sorting

Sort by multiple fields (separate with comma):

```
GET /api/v1/listings?sort=category,price
GET /api/v1/listings?sort=-price,createdAt
```

### Sorting Examples

```bash
# Sort by price (cheapest first)
curl "http://localhost:3000/api/v1/listings?sort=price"

# Sort by price (most expensive first)
curl "http://localhost:3000/api/v1/listings?sort=-price"

# Sort by newest first
curl "http://localhost:3000/api/v1/listings?sort=-createdAt"
```

---

## 4. Pagination

Pagination lets you get listings in smaller chunks (pages).

### Pagination Parameters

- `page` - Which page to get (starts at 1)
- `limit` - How many listings per page (default: 100)

### Basic Pagination

```
GET /api/v1/listings?page=1&limit=10    # First page, 10 listings
GET /api/v1/listings?page=2&limit=10    # Second page, 10 listings
GET /api/v1/listings?page=1&limit=20    # First page, 20 listings
```

### Pagination Example

```bash
# Get first 10 listings
curl "http://localhost:3000/api/v1/listings?page=1&limit=10"

# Get next 10 listings
curl "http://localhost:3000/api/v1/listings?page=2&limit=10"
```

### Calculating Total Pages

The API returns the number of results. To calculate total pages:

```
totalPages = Math.ceil(totalResults / limit)
```

---

## 5. Field Selection

Choose which fields to get back. This makes responses smaller and faster.

### Basic Field Selection

```
GET /api/v1/listings?fields=title,price,category
GET /api/v1/listings?fields=title,description,images
```

### Excluding Fields

By default, the `__v` field is excluded. You can select specific fields to include only what you need.

### Field Selection Example

```bash
# Get only title, price, and category
curl "http://localhost:3000/api/v1/listings?fields=title,price,category"
```

---

## 6. Get Single Listing

Get one listing by its ID.

**Endpoint:** `GET /api/v1/listings/:id`

**Authentication:** Not required

### Request

```bash
GET /api/v1/listings/507f1f77bcf86cd799439011
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "Listing retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Luxury Hotel Suite",
    "category": "hotel",
    "description": "Beautiful hotel room with ocean view",
    "price": 50000,
    "location": {
      "address": "123 Beach Road",
      "area": "Lagos Island",
      "geolocation": {
        "lat": 6.5244,
        "lng": 3.3792
      }
    },
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "public_id": "image1"
      }
    ],
    "vendorId": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response

**Status Code:** `404 Not Found`

```json
{
  "status": "error",
  "message": "Listing not found"
}
```

---

## 7. Get Listings by Vendor

Get all listings from a specific vendor.

**Endpoint:** `GET /api/v1/listings/vendor/:vendorId`

**Authentication:** Not required

### Request

```bash
GET /api/v1/listings/vendor/507f1f77bcf86cd799439012
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "Listings retrieved successfully",
  "results": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Luxury Hotel Suite",
      "category": "hotel",
      "price": 50000,
      ...
    }
  ]
}
```

---

## 8. Listing Response Format

### Listing Object Structure

```json
{
  "_id": "ObjectId",
  "vendorId": "ObjectId or Populated User Object",
  "category": "hotel | restaurant | shortlet | services | event",
  "title": "String",
  "description": "String",
  "price": "Number",
  "location": {
    "address": "String",
    "area": "String",
    "geolocation": {
      "lat": "Number",
      "lng": "Number"
    }
  },
  "contactInformation": {
    "phone": "String",
    "whatsapp": "String"
  },
  "images": [
    {
      "url": "String",
      "public_id": "String"
    }
  ],
  "status": "active | inactive | pending | rejected | approved",
  "details": "Object (varies by category)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Category-Specific Details

Each category has different details:

**Hotel:**
```json
{
  "roomTypes": [
    {
      "name": "basic | standard | premium | luxury",
      "pricePerNight": 50000,
      "capacity": 2,
      "amenities": ["wifi", "pool"]
    }
  ],
  "checkInTime": "14:00",
  "checkOutTime": "11:00"
}
```

**Shortlet:**
```json
{
  "pricePerNight": 30000,
  "maxGuests": 4,
  "amenities": ["wifi", "kitchen"]
}
```

**Restaurant:**
```json
{
  "cuisines": ["Italian", "Pizza"],
  "openingHours": "9am - 10pm",
  "acceptsReservations": true,
  "maxGuestsPerReservation": 8
}
```

**Services:**
```json
{
  "priceType": "fixed | hourly | negotiable",
  "price": 15000,
  "availability": ["Monday", "Tuesday", "Wednesday"]
}
```

**Event:**
```json
{
  "eventDate": "2024-12-25T00:00:00.000Z",
  "venue": "Convention Center",
  "ticketPrice": 5000,
  "capacity": 500
}
```

---

## 9. ReactJS Implementation Guide

Here's how to use the Listing API in a React app.

### Step 1: Create API Service

Create a file `src/services/listingService.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1/listings';

// Build query string from filters
const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  
  // Add filters
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.minPrice) params.append('price[gte]', filters.minPrice);
  if (filters.maxPrice) params.append('price[lte]', filters.maxPrice);
  if (filters.area) params.append('location.area', filters.area);
  
  // Add sorting
  if (filters.sort) params.append('sort', filters.sort);
  
  // Add pagination
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  return params.toString();
};

// Get all listings with filters
export const getListings = async (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch listings');
  }
  
  return data;
};

// Get single listing by ID
export const getListingById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch listing');
  }
  
  return data;
};

// Get listings by vendor
export const getListingsByVendor = async (vendorId) => {
  const response = await fetch(`${API_BASE_URL}/vendor/${vendorId}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch vendor listings');
  }
  
  return data;
};
```

### Step 2: Create Custom Hook

Create a file `src/hooks/useListings.js`:

```javascript
import { useState, useEffect } from 'react';
import { getListings } from '../services/listingService';

export const useListings = (filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getListings(filters);
        setListings(data.data.listings);
        setTotalResults(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [JSON.stringify(filters)]); // Re-fetch when filters change

  return { listings, loading, error, totalResults };
};
```

### Step 3: Create Listings Component

Create a file `src/components/Listings.jsx`:

```javascript
import { useState } from 'react';
import { useListings } from '../hooks/useListings';

const Listings = () => {
  const [filters, setFilters] = useState({
    category: '',
    status: 'active',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1,
    limit: 10
  });

  const { listings, loading, error, totalResults } = useListings(filters);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handleSortChange = (sortValue) => {
    setFilters(prev => ({ ...prev, sort: sortValue }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(totalResults / filters.limit);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Listings</h1>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Category:
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All</option>
            <option value="hotel">Hotel</option>
            <option value="restaurant">Restaurant</option>
            <option value="shortlet">Shortlet</option>
            <option value="services">Services</option>
            <option value="event">Event</option>
          </select>
        </label>

        <label style={{ marginLeft: '10px' }}>
          Min Price:
          <input 
            type="number" 
            value={filters.minPrice} 
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="0"
          />
        </label>

        <label style={{ marginLeft: '10px' }}>
          Max Price:
          <input 
            type="number" 
            value={filters.maxPrice} 
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="1000000"
          />
        </label>

        <label style={{ marginLeft: '10px' }}>
          Sort By:
          <select 
            value={filters.sort} 
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="title">Title: A to Z</option>
          </select>
        </label>
      </div>

      {/* Results Count */}
      <p>Found {totalResults} listings</p>

      {/* Listings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {listings.map(listing => (
          <div key={listing._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            {listing.images && listing.images[0] && (
              <img 
                src={listing.images[0].url} 
                alt={listing.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            <h3>{listing.title}</h3>
            <p>{listing.category}</p>
            <p><strong>₦{listing.price?.toLocaleString()}</strong></p>
            <p>{listing.location?.area}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => handlePageChange(filters.page - 1)}
          disabled={filters.page === 1}
        >
          Previous
        </button>
        <span>Page {filters.page} of {totalPages}</span>
        <button 
          onClick={() => handlePageChange(filters.page + 1)}
          disabled={filters.page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Listings;
```

### Step 4: Use in Your App

In your main App component:

```javascript
import Listings from './components/Listings';

function App() {
  return (
    <div className="App">
      <Listings />
    </div>
  );
}

export default App;
```

### Advanced Example with React Query

For better caching and state management, use React Query:

```javascript
import { useQuery } from '@tanstack/react-query';
import { getListings } from '../services/listingService';

export const useListingsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => getListings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage in component
const { data, isLoading, error } = useListingsQuery(filters);
const listings = data?.data?.listings || [];
```

### Complete Example with All Features

Here's a complete example with all features:

```javascript
import { useState } from 'react';
import { useListings } from '../hooks/useListings';

const ListingsPage = () => {
  const [filters, setFilters] = useState({
    category: '',
    status: 'active',
    minPrice: '',
    maxPrice: '',
    area: '',
    sort: '-createdAt',
    page: 1,
    limit: 12
  });

  const { listings, loading, error, totalResults } = useListings(filters);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: 'active',
      minPrice: '',
      maxPrice: '',
      area: '',
      sort: '-createdAt',
      page: 1,
      limit: 12
    });
  };

  if (loading) {
    return <div className="loading">Loading listings...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="listings-page">
      <div className="filters">
        <select 
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="hotel">Hotels</option>
          <option value="restaurant">Restaurants</option>
          <option value="shortlet">Shortlets</option>
          <option value="services">Services</option>
          <option value="event">Events</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => updateFilter('minPrice', e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => updateFilter('maxPrice', e.target.value)}
        />

        <input
          type="text"
          placeholder="Area"
          value={filters.area}
          onChange={(e) => updateFilter('area', e.target.value)}
        />

        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="title">Title: A-Z</option>
        </select>

        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="results-info">
        <p>Showing {listings.length} of {totalResults} listings</p>
      </div>

      <div className="listings-grid">
        {listings.map(listing => (
          <div key={listing._id} className="listing-card">
            {listing.images?.[0]?.url && (
              <img src={listing.images[0].url} alt={listing.title} />
            )}
            <div className="listing-info">
              <h3>{listing.title}</h3>
              <p className="category">{listing.category}</p>
              <p className="price">₦{listing.price?.toLocaleString()}</p>
              <p className="location">{listing.location?.area}</p>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="no-results">No listings found</div>
      )}

      <div className="pagination">
        <button
          onClick={() => updateFilter('page', filters.page - 1)}
          disabled={filters.page === 1}
        >
          Previous
        </button>
        <span>
          Page {filters.page} of {Math.ceil(totalResults / filters.limit)}
        </span>
        <button
          onClick={() => updateFilter('page', filters.page + 1)}
          disabled={filters.page >= Math.ceil(totalResults / filters.limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ListingsPage;
```

---

## Quick Reference

### Common Filter Examples

```javascript
// Get active hotels
{ category: 'hotel', status: 'active' }

// Get listings between 10,000 and 50,000
{ minPrice: 10000, maxPrice: 50000 }

// Get restaurants in Lagos Island
{ category: 'restaurant', area: 'Lagos Island' }

// Get newest listings
{ sort: '-createdAt' }

// Get cheapest first
{ sort: 'price' }
```

### URL Examples

```
GET /api/v1/listings?category=hotel&status=active
GET /api/v1/listings?price[gte]=10000&price[lte]=50000&sort=-createdAt
GET /api/v1/listings?category=restaurant&page=1&limit=20
GET /api/v1/listings?location.area=Lagos Island&sort=price
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Images are returned as objects with `url` and `public_id`
- Vendor information is automatically populated (includes vendor details)
- Default limit is 100 listings per page
- Default sort is by newest first (`-createdAt`)
- Filtering is case-sensitive for exact matches
- Price filters use MongoDB operators (`gte`, `gt`, `lte`, `lt`)

---

## Support

For issues or questions, refer to the main project documentation or contact the development team.
