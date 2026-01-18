const getEnv = (key: string) => {
  const isClient = typeof window !== "undefined";
  const isPublic = key.startsWith("NEXT_PUBLIC_");

  // Prevent leaking private env on client
  if (isClient && !isPublic) {
    return;
  }

  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

// REQUIRED ENV
export const BASE_URL = getEnv("BASE_URL")!;
export const DATABASE_URL = getEnv("DATABASE_URL")!;

// OPTIONAL ENV
export const NODE_ENV = process.env.NODE_ENV;
