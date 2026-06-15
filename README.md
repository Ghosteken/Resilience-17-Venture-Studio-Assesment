# Creator Card Microservice API

A production-ready microservice for managing **Creator Cards**, built with Node.js, Express, and MongoDB. This service allows creators to build and share their rate cards with brands, supporting both public and private access.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (see [.env.example](.env.example)):
   ```bash
   cp .env.example .env
   # Update MONGODB_URI in .env with your connection string
   ```

### Running the App

- **Development**: `npm start` (Runs via `bootstrap.js`)
- **Tests**: `npm test` (Runs comprehensive test suite with mock models)

---

## 🛠 API Endpoints

All endpoints are available at the root level of the application.

### 1. Create Creator Card
**POST** `/creator-cards`

Creates a new card. If `slug` is omitted, it will be auto-generated from the `title`.

**Request Body:**
```json
{
  "title": "George Cooks",
  "description": "Weekly cooking podcast",
  "slug": "george-cooks",
  "creator_reference": "crt_8f2k1m9x4p7w3q5z",
  "status": "published",
  "access_type": "public",
  "links": [
    { "title": "YouTube", "url": "https://youtube.com/@georgecooks" }
  ],
  "service_rates": {
    "currency": "NGN",
    "rates": [
      { "name": "IG Story", "description": "One story mention", "amount": 50000 }
    ]
  }
}
```

### 2. Retrieve Public Card
**GET** `/creator-cards/:slug`

Retrieves a published card. If the card is `private`, an `access_code` must be provided in the headers or query params.

**Headers (for private cards):**
- `access_code`: `123456`

### 3. Delete Creator Card
**DELETE** `/creator-cards/:slug`

Soft-deletes a card. Requires `creator_reference` in the request body for authorization.

**Request Body:**
```json
{
  "creator_reference": "crt_8f2k1m9x4p7w3q5z"
}
```

---

## 🏗 Architecture

The codebase follows a clean, layered architecture:

- **Endpoints**: Handle HTTP routing and input extraction.
- **Services**: Contain business logic, VSL validation, and core rules.
- **Models**: Mongoose schemas for data persistence.
- **Core**: Shared utilities for logging, validation, and error handling.

### Key Features

- **VSL Validation**: Uses a custom Domain Specific Language for robust schema validation.
- **Soft Deletion**: Records are marked with a `deleted` timestamp instead of being removed.
- **Slug Resiliency**: Auto-generates unique, URL-friendly slugs with collision handling.
- **Security**: PIN-based access for private cards.

---

## 🧪 Testing

The project includes a full suite of unit and integration tests using **Mocha** and **Mock Models**.

```bash
# Run all tests
npm test
```

Test cases include:
- Slug auto-generation logic
- Private access code enforcement
- Draft status protection
- Unauthorized deletion prevention

---

## 📄 License

This project is licensed under the ISC License.
