# 📚 Library Management System API

A production-ready RESTful backend for managing a library — books, members, borrowing, and returns — built with Node.js, Express, and MongoDB.

---

## Features

- JWT-based authentication with role-based access control
- Two roles: **Member** and **Librarian** with distinct permissions
- Full book CRUD (librarians only)
- Borrow and return books (members only)
- Duplicate borrow prevention and availability tracking
- Centralized error handling with consistent JSON responses
- Input validation via `express-validator`

---

## Tech Stack

| Layer         | Technology                  |
|---------------|-----------------------------|
| Runtime       | Node.js v18+                |
| Framework     | Express.js                  |
| Database      | MongoDB + Mongoose          |
| Auth          | JWT (jsonwebtoken)          |
| Passwords     | bcryptjs                    |
| Validation    | express-validator           |
| Dev server    | nodemon                     |

---

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/library-management-system.git
cd library-management-system

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

---

## Folder Structure

```
library-management-system/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js   # Register & Login logic
│   ├── bookController.js   # Book CRUD + Borrow/Return
│   └── memberController.js # Member management
├── middleware/
│   ├── authMiddleware.js   # JWT verification
│   ├── roleMiddleware.js   # Role-based authorization
│   └── errorMiddleware.js  # Centralized error handler
├── models/
│   ├── User.js             # User schema (member/librarian)
│   ├── Book.js             # Book schema
│   └── Borrow.js           # Borrow record schema
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   └── memberRoutes.js
├── validators/
│   └── validationRules.js  # express-validator rules
├── .env.example
├── postman_collection.json
├── server.js               # App entry point
└── package.json
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Access  | Description         |
|--------|----------------------|---------|---------------------|
| POST   | /api/auth/register   | Public  | Register a new user |
| POST   | /api/auth/login      | Public  | Login & get token   |

### Books

| Method | Endpoint                  | Access           | Description         |
|--------|---------------------------|------------------|---------------------|
| GET    | /api/books                | Authenticated    | Get all books       |
| GET    | /api/books/:id            | Authenticated    | Get single book     |
| POST   | /api/books                | Librarian only   | Add a book          |
| PUT    | /api/books/:id            | Librarian only   | Update a book       |
| DELETE | /api/books/:id            | Librarian only   | Delete a book       |
| POST   | /api/books/:id/borrow     | Member only      | Borrow a book       |
| POST   | /api/books/:id/return     | Member only      | Return a book       |

### Members

| Method | Endpoint                  | Access         | Description              |
|--------|---------------------------|----------------|--------------------------|
| GET    | /api/members              | Librarian only | List all members         |
| DELETE | /api/members/:id          | Librarian only | Delete a member          |
| GET    | /api/members/me/books     | Member only    | My currently borrowed books |

---

## Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned on successful register or login.

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "..."
}
```

---

## Testing with Postman

1. Import `postman_collection.json` into Postman.
2. The collection uses variables `{{baseUrl}}`, `{{memberToken}}`, and `{{librarianToken}}`.
3. Run **Login Member** and **Login Librarian** first — tokens are saved automatically via test scripts.
4. Use **bookId** variable (auto-set on Add Book) for subsequent book operations.

---

## Deployment

### Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add the environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`) in the Render dashboard.

### Railway

1. Create a new project on [railway.app](https://railway.app).
2. Add a **MongoDB** plugin from the Railway marketplace.
3. Connect your GitHub repository.
4. Add environment variables in the Railway dashboard.
5. Railway will auto-detect `npm start` as the start command.

---

## Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds: 10).
- The `password` field is excluded from all query results by default (`select: false`).
- JWT tokens include only `id` and `role`.
- All inputs are validated and sanitized before processing.
- Duplicate borrows and invalid token attacks are handled gracefully.
