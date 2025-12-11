# Barter King

A Node.js application built with Express and Prisma, using PostgreSQL as the database.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/barter_king?schema=public"
PORT=5000
NODE_ENV=development
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:push` - Push schema changes to database without migrations

## Project Structure

```
Barter_King/
├── src/
│   ├── index.js          # Express server entry point
│   └── prisma.js         # Prisma client instance
├── prisma/
│   └── schema.prisma     # Prisma schema file
├── .env                  # Environment variables
├── .gitignore
├── package.json
├── nodemon.json
└── README.md
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint (checks database connection)

## Database Setup

1. Make sure PostgreSQL is running
2. Create a database named `barter_king` (or update the DATABASE_URL)
3. Update the `.env` file with your PostgreSQL credentials
4. Run migrations: `npm run prisma:migrate`

## Next Steps

1. Define your database models in `prisma/schema.prisma`
2. Run migrations to create tables
3. Add your API routes in `src/index.js` or create separate route files
4. Start building your application!

