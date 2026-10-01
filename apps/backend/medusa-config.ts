import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const REDIS_URL = process.env.REDIS_URL
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL

// Uploaded files are stored on disk and linked from the public backend URL
// (the default links to localhost, which only works in development)
const fileModule = BACKEND_URL
  ? [
      {
        resolve: "@medusajs/medusa/file",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/file-local",
              id: "local",
              options: { backend_url: `${BACKEND_URL}/static` },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Production runs Redis; local development falls back to in-memory
    redisUrl: REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  admin: {
    backendUrl: BACKEND_URL,
  },
  modules: [
    ...fileModule,
    ...(REDIS_URL
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: { redisUrl: REDIS_URL },
          },
          {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: { redis: { redisUrl: REDIS_URL } },
          },
          {
            resolve: "@medusajs/medusa/locking",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/locking-redis",
                  id: "locking-redis",
                  is_default: true,
                  options: { redisUrl: REDIS_URL },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
