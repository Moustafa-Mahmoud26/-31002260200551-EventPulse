# EventPulse API V1.0.0 Release

Real-time Event Management Platform API built with Node.js, Express, MongoDB (Mongoose) and Socket.io.

## Tech Stack

- Node.js / Express.js
- MongoDB Atlas / Mongoose
- JWT authentication + bcrypt password hashing
- Socket.io for real-time announcements
- express-validator for input validation
- Swagger (OpenAPI) for API documentation
- Jest + Supertest for unit and integration testing

## Project Structure

```
31002260200551-EventPulse/
├── config/         # Database and Swagger configuration
├── controllers/    # Business logic
├── middleware/      # Auth, role, validation, error handling
├── models/         # Mongoose schemas
├── routes/         # Express routes + Swagger docs
├── tests/          # Unit and integration tests
├── utils/          # AppError, asyncHandler
├── postman/        # Postman collection and environment
├── app.js          # Express app setup
├── server.js       # HTTP server + Socket.io bootstrap
└── seed.js         # Database seed script
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default 3000) |
| `NODE_ENV` | `development`, `production`, or `test` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign JWTs |
| `JWT_EXPIRES_IN` | JWT expiry, e.g. `7d` |

### 3. Seed the database

```bash
npm run seed
```

This creates 3 categories, 4 sample events, an admin user, an attendee user, and one sample registration.

- Admin login: `admin@eventpulse.com` / `Admin@123`
- Attendee login: `attendee@eventpulse.com` / `Attendee@123`

### 4. Run the server

```bash
npm run dev     # with nodemon
npm start        # production
```

The API will be available at `http://localhost:3000`.

- Swagger docs: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/health`

### 5. Run tests

```bash
npm test
```

> Integration tests use `mongodb-memory-server`, which downloads a MongoDB binary the first time it runs. This requires an internet connection.

## API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive a JWT | Public |
| GET | `/api/events` | List events (filter/search/sort/paginate) | Public |
| GET | `/api/events/:id` | Get a single event | Public |
| GET | `/api/events/:id/status` | Get capacity/seats-left info | Public |
| POST | `/api/events` | Create an event | Admin |
| PATCH | `/api/events/:id` | Update an event | Admin |
| DELETE | `/api/events/:id` | Delete an event | Admin |
| GET | `/api/categories` | List categories | Public |
| POST | `/api/categories` | Create a category | Admin |
| POST | `/api/registrations` | Register for an event | Attendee |
| GET | `/api/registrations/my` | List my registrations | Authenticated |
| DELETE | `/api/registrations/:id` | Cancel my registration | Authenticated |
| POST | `/api/announcements` | Send a real-time announcement | Admin |
| GET | `/api/announcements/:eventId` | Get announcement history | Public |
| GET | `/health` | Server/DB health check | Public |

### Events query parameters

`?category=<id>&city=<city>&startDate=<date>&endDate=<date>&search=<keyword>&sortBy=date|registrations|createdAt&order=asc|desc&page=<n>&limit=<n>`

## Socket.io

- Clients connect and emit `join-event` with an `eventId` to join that event's room.
- Admins sending `POST /api/announcements` broadcast an `announcement` event to `event_<eventId>` room only.
- Clients emit `leave-event` to leave a room.

## Deployment

- Database: MongoDB Atlas
- Hosting: Vercel
- Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `NODE_ENV=production` as environment variables on Vercel.

## Git Workflow

This repository follows Conventional Commits (`feat:`, `fix:`, `docs:`, etc.) and is tagged `v1.0.0` for the first release.
