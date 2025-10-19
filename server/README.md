# Yoruwear Store Server

This is the backend API for the Yoruwear Store, built with Bun, Elysia, and Drizzle ORM with MySQL.

## Prerequisites

- Bun
- Docker and Docker Compose (for MySQL)

## Quick Start

1. **Start the database:**
   ```bash
   docker compose up mysql -d
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Push the database schema:**
   ```bash
   bun run db:push
   ```

5. **Seed the database (optional):**
   ```bash
   bun run db:seed
   ```

6. **Start the development server:**
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:3000`

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run db:generate` - Generate migration files
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema changes to database (development)
- `bun run db:studio` - Open Drizzle Studio for database management
- `bun run db:seed` - Seed the database with sample data

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/categories` - Get all categories
- `GET /api/users` - Get all users

## Database Schema

The database includes the following tables:
- `users` - Customer information
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items

## Development

The server uses:
- **Bun** - Runtime and package manager
- **Elysia** - Web framework
- **Drizzle ORM** - Database toolkit
- **MySQL** - Database

For database management, you can use Drizzle Studio:
```bash
bun run db:studio
```

This will open a web interface at `https://local.drizzle.studio` where you can view and edit your database.