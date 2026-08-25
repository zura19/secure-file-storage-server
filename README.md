# Secure File Storage Service - Backend API

A secure RESTful backend API for managing, uploading, and sharing files with user authentication and visibility controls.

---

## 📌 Project Overview

The **Secure File Storage Service** backend provides a robust and secure foundation for storing and managing user files. It handles user authentication, password hashing, file uploads via Cloudinary, and metadata persistence with PostgreSQL and Prisma.

### Key Features
- **User Authentication**: Secure registration, login, logout, and session management via JWT stored in HTTP-only cookies.
- **User Analytics & Stats**: Aggregate user metrics (total uploaded files, total storage size used, shared vs private file count).
- **Password Security**: Strong password hashing powered by **Argon2**.
- **File Management**: Upload, retrieve, delete, and manage files securely.
- **Cloud Storage**: Cloudinary integration for scalable cloud asset storage.
- **Access Control & Sharing**: Public/Private visibility settings and unique shareable link tokens.

---

## 🛠 Tech Stack

- **Runtime & Language:** Node.js, TypeScript
- **Framework:** Express.js
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Cloud Storage:** Cloudinary
- **Authentication & Security:** JWT (`jsonwebtoken`), `cookie-parser`, `argon2`, `cors`
- **File Uploads:** Multer
- **Dev Tooling:** `tsx` (live reload), `typescript`

---

## 🏗 Architecture

The backend follows a modular, layered structure:

```
server/
├── prisma/               # Prisma schema & migrations
│   └── schema.prisma
├── src/
│   ├── config/           # Cloudinary & environment configs
│   ├── controllers/      # Request handlers (auth, file, user)
│   ├── middleware/       # Auth guards, upload validation & error handlers
│   ├── routes/           # Express route definitions (/api/auth, /api/files, /api/users)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper utilities (JWT, Argon2, cookies, DB queries)
│   ├── lib/              # Prisma client instance
│   ├── app.ts            # Express app configuration & middleware pipeline
│   └── index.ts          # Server entry point
├── .env.example          # Sample environment variables
└── package.json          # Dependencies and scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- Cloudinary account

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT`: Server port (default: `5000`)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., `7d`)
- `CLIENT_URL`: Allowed frontend origin for CORS
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary API credentials
- `MAX_FILE_SIZE_MB`: Maximum file upload size in MB (e.g., `100`)

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts development server with hot-reloading using `tsx watch` |
| `npm run build` | Generates Prisma client and compiles TypeScript to `dist/` |
| `npm start` | Starts the production server from compiled code (`dist/index.js`) |
| `npm run typecheck` | Runs TypeScript compiler checks without emitting files |
| `npm run prisma:migrate` | Runs Prisma migrations in development mode |
| `npm run prisma:studio` | Opens Prisma Studio GUI to inspect and manage database records |
