const { PrismaClient } = require("@prisma/client");

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Verify that Prisma client is properly initialized
if (!prisma || !prisma.user) {
  console.error(
    "ERROR: Prisma client is not properly initialized. Please run: npm run prisma:generate"
  );
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

module.exports = { prisma };
