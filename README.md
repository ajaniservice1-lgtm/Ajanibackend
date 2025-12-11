openapi: 3.0.0

info:
title: Ajani API (Supabase MVP)
version: 1.0.0
description: API specification for Ajani MVP backend using Supabase.

servers:

- url: https://your-supabase-url.supabase.co
  description: Production Supabase

paths:
/auth/register:
post:
summary: Register a new user
requestBody:
required: true
content:
application/json:
schema:
type: object
properties:
firstName:
type: string
lastName:
type: string
email:
type: string
phone:
type: string
password:
type: string
responses:
'200':
description: User registered successfully

/auth/login:
post:
summary: Login user
requestBody:
required: true
content:
application/json:
schema:
type: object
properties:
email:
type: string
password:
type: string
responses:
'200':
description: Login successful

/listings:
get:
summary: Get all listings
parameters: - in: query
name: category
schema:
type: string - in: query
name: district
schema:
type: string - in: query
name: sort
schema:
type: string
responses:
'200':
description: List of listings

/listings/{id}:
get:
summary: Get a single listing
parameters: - name: id
in: path
required: true
schema:
type: string
responses:
'200':
description: Listing details

/booking-requests:
post:
summary: Create a booking request
requestBody:
required: true
content:
application/json:
schema:
type: object
properties:
vendorId:
type: string
fullName:
type: string
phone:
type: string
email:
type: string
serviceType:
type: string
preferredDate:
type: string
preferredTime:
type: string
notes:
type: string
responses:
'200':
description: Booking request created

/messages:
post:
summary: Send a chat message
requestBody:
required: true
content:
application/json:
schema:
type: object
properties:
senderId:
type: string
receiverId:
type: string
text:
type: string
responses:
'200':
description: Message sent

/chat/ajani:
post:
summary: Send user message to Ajani chatbot via n8n
requestBody:
required: true
content:
application/json:
schema:
type: object
properties:
message:
type: string
userId:
type: string
responses:
'200':
description: Chatbot response

components:
schemas:
User:
type: object
properties:
id:
type: string
firstName:
type: string
lastName:
type: string
email:
type: string
phone:
type: string
createdAt:
type: string

    Listing:
      type: object
      properties:
        id:
          type: string
        vendorId:
          type: string
        name:
          type: string
        category:
          type: string
        priceMin:
          type: number
        priceMax:
          type: number
        description:
          type: string

    BookingRequest:
      type: object
      properties:
        id:
          type: string
        vendorId:
          type: string
        fullName:
          type: string
        phone:
          type: string
        serviceType:
          type: string
        createdAt:
          type: string




-------------------------

supabase DB password: SecurePass@2025
