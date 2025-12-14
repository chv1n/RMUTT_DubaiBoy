# Database Seeding

This project includes a seed script to populate the database with:
- Master Data (Users, Materials, Units, Suppliers)
- Historical Demo Data (6 months of inventory transactions)

## How to Run

1. **Clean Database** (Optional but recommended for fresh demo)
   - Drop tables or delete data if needed.
   - `npm run schema:drop` (if command exists) or manually.

2. **Run Seeder**
   ```bash
   npm run seed
   ```
   
   This command executes `src/database/seeds/seed.ts` using `ts-node`.

## What it generates
- **Materials**: Semiconductors (Wafers, Resists, Gases) with realistic prices.
- **Inventory**: Random initial stock levels.
- **Transactions**: Daily IN/OUT transactions for the last 6 months to visualize charts.
- **Plans**: Various production plans (PENDING, COMPLETED, CANCELLED).

## Troubleshooting
- If you see `Relation '...' does not exist`, ensure migrations are run first:
  ```bash
  npm run migration:run
  ```
