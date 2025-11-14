## Project Structure

```
├── app                                 # Main application source code
│ ├── config
│ │   └── index.ts                      # Centralized configuration (e.g., env vars, constants)
│ ├── controllers                       # Request handlers: business logic per route
│ │   ├── 404.ts                        # Handles all undefined routes (404 Not Found)
│ │   ├── health.ts                     # Health check controller for service monitoring
│ ├── index.ts                          # Entry point for the app
│ ├── middlewares                       # Custom Express middlewares
│ │   ├── errorHandler.ts               # Centralized error handling middleware
│ │   ├── streamLogger.ts               # Logs request and response streams for debugging
│ ├── prisma                            # Prisma ORM configuration
│ │   └── schema.prisma                 # Database schema definition (models, relationships, etc.)
│ ├── routes                            # API route definitions
│ │   ├── health.ts                     # Route for health check endpoint (/health)
│ │   ├── index.ts                      # Main router that aggregates and exports all routes
│ ├── services                          # Business logic and reusable domain services
│ └── utils                             # Utility/helper functions and shared modules
│     ├── AppError.ts                   # Custom error class for handling operational errors
│     ├── db.ts                         # Initializes and exports Prisma DB client
│     ├── JWT.ts                        # JWT signing, verification, and token helpers
│     ├── logger.ts                     # Logger setup using Winston.
│     ├── types                         # Global/custom TypeScript types
│     │   └── index.ts                  # Main types index file (e.g., Request types, User payloads)
│     └── validator.ts                  # JSON body validator (using Zod)
├── index.d.ts                          # Global type declarations (custom Express Request)
├── package.json                        
├── package-lock.json                   
├── README.md                           
└── tsconfig.json                       # TypeScript compiler configuration
```