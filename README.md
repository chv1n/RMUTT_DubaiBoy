# 🏭 Material Core

> Sony Smart Factory Hackathon 2025 - ทีมหนุ่มดูไบ

ระบบจัดการโรงงานอัจฉริยะ สำหรับบริหารจัดการวัตถุดิบ ผลิตภัณฑ์ และแผนการผลิต พร้อมระบบ Dashboard สำหรับติดตามสถานะการผลิตแบบ Real-time

---

## 👥 Team Members

- **Natapong Thongkom** — Team Lead & Backend Developer  
- **Peenapat Jangjai** — Backend Developer  
- **Nithis Manora** — Frontend Developer

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication & Authorization** | ระบบยืนยันตัวตนและจัดการสิทธิ์ด้วย JWT (Access Token + Refresh Token) |
| 🤖 **AI Forecasting** | คาดการณ์ความต้องการวัสดุในอนาคตจากข้อมูลการใช้งานย้อนหลัง |
| 📋 **Plan Management** | จัดการแผนการผลิต สร้าง/แก้ไข/ติดตามสถานะแผนงาน |
| 📦 **Material Management** | จัดการวัตถุดิบ สต๊อก และ BOM (Bill of Materials) |
| 💡 **Product Management** | จัดการผลิตภัณฑ์ หมวดหมู่ และข้อมูลสินค้า |
| 📊 **Dashboard** | แสดงผลข้อมูลการผลิต สถิติ และรายงานแบบ Real-time |

---

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Cache**: Redis
- **ORM**: TypeORM
- **Authentication**: JWT + Passport

### Frontend
- **Framework**: Next.js 15
- **UI Library**: HeroUI + TailwindCSS

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- **PostgreSQL** >= 15
- **Redis** >= 7

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/RMUTT_DubaiBoy.git
cd RMUTT_DubaiBoy
```

---

## ⚙️ Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=matcore_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Application
PORT=3001
NODE_ENV=development

# JWT Secrets (change these in production!)
JWT_SECRET_ACCESS=your_access_token_secret
JWT_SECRET_REFRESH=your_refresh_token_secret
```

### 3. Setup Database

```bash
# Run migrations
npm run migration:run

# Seed initial data
npm run seed
```

### 4. Run Backend

```bash
# Development mode (with hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend will be available at: **http://localhost:3001**

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 3. Run Frontend

```bash
# Development mode (with hot-reload)
npm run dev

# Production build
npm run build
npm run start
```

Frontend will be available at: **http://localhost:3000**

---

## 🐳 Docker Setup (Optional)

### Using Docker Compose

```bash
# Start all services (DB, Redis, Backend, Frontend)
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Adminer (DB UI) | http://localhost:8080 |

---

## 📜 Available Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot-reload |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run migration:run` | Run database migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run seed` | Seed database with initial data |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

---

## 👥 Team - ทีมหนุ่มดูไบ

Sony Smart Factory Hackathon 2025

---

