/** @format */

import fs from "fs"
import path from "path"
import cors from "cors"
import helmet from "helmet"
import express from "express"
import swaggerUi from "swagger-ui-express"
import "./modules/common/utils/config"
import "./modules/common/jobs/auto-jobs"

import routes from "./routes"
import { errorHandler } from "./modules/common/utils"
import compression from "compression"

const app = express()

// const apiLimiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 10 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: "Too many request from this IP, please try again after 10 minutes",
// })

// Middlewares
// @ts-ignore
app.use(compression())

app.use(
    helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            fontSrc: ["'self'"],
            imgSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            frameSrc: ["'self'"],
          },
          reportOnly: true, // Set
        },
    })
);

app.use(
    cors({
        origin: (_origin, callback) => {
            callback(null, true)
        },
        credentials: true,
    })
)

app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.json({ limit: "10mb" }))
app.use(express.static("public"))
app.disable("x-powered-by")

app.set("view engine", "ejs")

// API docs, generated from routes + Zod schemas via `yarn docs:generate`
try {
    const openapiPath = path.join(process.cwd(), "public", "openapi.json")
    const openapiDocument = JSON.parse(fs.readFileSync(openapiPath, "utf8"))
    // swagger-ui-express ships its own (newer) @types/express, which conflicts
    // with this project's @types/express@4 — cast at the boundary.
    app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(openapiDocument) as any)
} catch (error) {
    console.log("\x1b[33m", "API docs not mounted: run `yarn docs:generate` to generate public/openapi.json")
}

app.use("/", routes)

// Error handlers
app.use(errorHandler)

export default app
