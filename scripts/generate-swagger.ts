/** @format */

/**
 * Generates public/openapi.json by statically parsing route files (via the
 * TypeScript compiler API) and converting the Zod schemas they reference
 * into JSON Schema. Nothing here imports controllers/services, so it never
 * touches the DB connection or the agenda job scheduler.
 *
 * Run with: yarn docs:generate
 */

import fs from "fs"
import path from "path"
import ts from "typescript"
import { zodToJsonSchema } from "zod-to-json-schema"

const SRC_DIR = path.join(__dirname, "..", "src")
const V1_DIR = path.join(SRC_DIR, "modules", "v1")
const OUTPUT_PATH = path.join(__dirname, "..", "public", "openapi.json")

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete"])

type RouteBinding = {
    method: string
    path: string
    auth: boolean
    handlerName?: string
    bodySchemaName?: string
    querySchemaName?: string
}

function parseSourceFile(filePath: string): ts.SourceFile {
    const content = fs.readFileSync(filePath, "utf8")
    return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true)
}

function getDefaultExportIdentifier(sourceFile: ts.SourceFile): string | null {
    let name: string | null = null
    sourceFile.forEachChild((node) => {
        if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression)) {
            name = node.expression.text
        }
    })
    return name
}

/** Walks a source file for `<targetIdentifier>.get/post/put/patch/delete(...)` calls. */
function extractRouteBindings(sourceFile: ts.SourceFile, targetIdentifier: string): RouteBinding[] {
    const routes: RouteBinding[] = []

    function visit(node: ts.Node) {
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === targetIdentifier &&
            HTTP_METHODS.has(node.expression.name.text)
        ) {
            const [pathArg, ...rest] = node.arguments
            if (pathArg && ts.isStringLiteral(pathArg)) {
                const binding: RouteBinding = {
                    method: node.expression.name.text,
                    path: pathArg.text,
                    auth: false,
                }

                rest.forEach((arg) => {
                    if (ts.isIdentifier(arg)) {
                        if (arg.text === "Authenticate") {
                            binding.auth = true
                        } else {
                            // Convention in this codebase: the terminal argument is the
                            // controller handler, so the last identifier wins.
                            binding.handlerName = arg.text
                        }
                        return
                    }

                    if (
                        ts.isCallExpression(arg) &&
                        ts.isPropertyAccessExpression(arg.expression) &&
                        ts.isIdentifier(arg.expression.expression) &&
                        arg.expression.expression.text === "validator"
                    ) {
                        const location = arg.expression.name.text
                        const schemaArg = arg.arguments[0]
                        if (schemaArg && ts.isIdentifier(schemaArg)) {
                            if (location === "body") binding.bodySchemaName = schemaArg.text
                            if (location === "query") binding.querySchemaName = schemaArg.text
                        }
                    }
                })

                routes.push(binding)
            }
        }
        ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return routes
}

function discoverModuleDirs(): string[] {
    return fs
        .readdirSync(V1_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
}

function findRouteFile(moduleDir: string): string | null {
    for (const candidate of ["route.ts", "routes.ts"]) {
        const candidatePath = path.join(V1_DIR, moduleDir, candidate)
        if (fs.existsSync(candidatePath)) return candidatePath
    }
    return null
}

type MountInfo = { prefix: string; authAtMount: boolean }

/** Parses src/modules/v1/index.ts for router.use(prefix, [Authenticate], subRouter) mounts. */
function parseMountInfo(): { mounts: Record<string, MountInfo>; extraRoutes: RouteBinding[] } {
    const indexPath = path.join(V1_DIR, "index.ts")
    const source = parseSourceFile(indexPath)

    const identifierToFolder: Record<string, string> = {}
    source.forEachChild((node) => {
        if (
            ts.isImportDeclaration(node) &&
            node.importClause?.name &&
            ts.isStringLiteral(node.moduleSpecifier)
        ) {
            const spec = node.moduleSpecifier.text
            if (spec.startsWith("./")) {
                const folder = spec.split("/")[1]
                if (folder) identifierToFolder[node.importClause.name.text] = folder
            }
        }
    })

    const mounts: Record<string, MountInfo> = {}

    function visit(node: ts.Node) {
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === "router" &&
            node.expression.name.text === "use"
        ) {
            const [pathArg, ...rest] = node.arguments
            if (pathArg && ts.isStringLiteral(pathArg)) {
                const authAtMount = rest.some((arg) => ts.isIdentifier(arg) && arg.text === "Authenticate")
                const routerArg = rest.find((arg) => ts.isIdentifier(arg) && identifierToFolder[arg.text])
                if (routerArg && ts.isIdentifier(routerArg)) {
                    mounts[identifierToFolder[routerArg.text]] = { prefix: pathArg.text, authAtMount }
                }
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(source)

    const extraRoutes = extractRouteBindings(source, "router")
    return { mounts, extraRoutes }
}

/** Parses src/routes.ts for router.use("/v1", v1). */
function parseGlobalPrefix(): string {
    const routesPath = path.join(SRC_DIR, "routes.ts")
    const source = parseSourceFile(routesPath)
    let prefix = ""

    function visit(node: ts.Node) {
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === "router" &&
            node.expression.name.text === "use"
        ) {
            const [pathArg, second] = node.arguments
            if (pathArg && ts.isStringLiteral(pathArg) && second && ts.isIdentifier(second) && second.text === "v1") {
                prefix = pathArg.text
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(source)
    return prefix
}

function loadValidationSchemas(moduleDir: string): Record<string, any> {
    const validationPath = path.join(V1_DIR, moduleDir, "validation.ts")
    if (!fs.existsSync(validationPath)) return {}
    // Safe: validation.ts files only import "zod", never the DB layer.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(validationPath)
}

function schemaToOpenApi(schema: any): any {
    if (!schema) return undefined
    const jsonSchema = zodToJsonSchema(schema, { target: "openApi3", $refStrategy: "none" }) as any
    delete jsonSchema.$schema
    return jsonSchema
}

function querySchemaToParams(schema: any): any[] {
    const openApiSchema = schemaToOpenApi(schema)
    if (!openApiSchema?.properties) return []
    const required: string[] = openApiSchema.required || []
    return Object.entries(openApiSchema.properties).map(([name, propSchema]) => ({
        name,
        in: "query",
        required: required.includes(name),
        schema: propSchema,
    }))
}

function pathParamsToParams(paramNames: string[]): any[] {
    return paramNames.map((name) => ({
        name,
        in: "path",
        required: true,
        schema: { type: "string" },
    }))
}

function joinPaths(...parts: string[]): string {
    const segments = parts
        .filter(Boolean)
        .flatMap((part) => part.split("/"))
        .filter(Boolean)
    return `/${segments.join("/")}`
}

function toOpenApiPath(expressPath: string): { openApiPath: string; params: string[] } {
    const params: string[] = []
    const openApiPath = expressPath.replace(/:([A-Za-z0-9_]+)/g, (_match, name) => {
        params.push(name)
        return `{${name}}`
    })
    return { openApiPath, params }
}

function humanize(name?: string): string {
    if (!name) return ""
    return name
        .replace(/[-_]/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .trim()
        .replace(/^./, (c) => c.toUpperCase())
}

function summarize(routePath: string, fallback: string): string {
    const lastSegment = routePath.split("/").filter((segment) => segment && !segment.startsWith(":")).pop()
    return lastSegment ? humanize(lastSegment) : humanize(fallback)
}

function generate() {
    const globalPrefix = parseGlobalPrefix()
    const { mounts, extraRoutes } = parseMountInfo()
    const moduleDirs = discoverModuleDirs()

    const paths: Record<string, any> = {}
    const tags: { name: string }[] = []

    function addOperation(
        fullExpressPath: string,
        binding: RouteBinding,
        tagName: string,
        bodyOpenApiSchema?: any,
        queryParams: any[] = []
    ) {
        const { openApiPath, params } = toOpenApiPath(fullExpressPath)
        paths[openApiPath] = paths[openApiPath] || {}

        const parameters = [...pathParamsToParams(params), ...queryParams]

        const operation: any = {
            tags: [tagName],
            summary: summarize(binding.path, tagName),
            operationId: `${binding.method}_${openApiPath}`.replace(/[{}/]/g, "_").replace(/_+/g, "_"),
            ...(binding.handlerName && { description: `Controller: ${binding.handlerName}` }),
            ...(parameters.length && { parameters }),
        }

        if (bodyOpenApiSchema) {
            operation.requestBody = {
                required: true,
                content: { "application/json": { schema: bodyOpenApiSchema } },
            }
        }

        if (binding.auth) {
            operation.security = [{ BearerAuth: [] }]
        }

        paths[openApiPath][binding.method] = operation
    }

    moduleDirs.forEach((moduleDir) => {
        const routeFile = findRouteFile(moduleDir)
        if (!routeFile) return

        const source = parseSourceFile(routeFile)
        const routerIdentifier = getDefaultExportIdentifier(source)
        if (!routerIdentifier) return

        const bindings = extractRouteBindings(source, routerIdentifier)
        const mount = mounts[moduleDir] || { prefix: `/${moduleDir}`, authAtMount: false }
        const schemas = loadValidationSchemas(moduleDir)
        const tagName = humanize(moduleDir)
        tags.push({ name: tagName })

        bindings.forEach((binding) => {
            const fullPath = joinPaths(globalPrefix, mount.prefix, binding.path)
            const bodySchema = binding.bodySchemaName ? schemas[binding.bodySchemaName] : undefined
            const querySchema = binding.querySchemaName ? schemas[binding.querySchemaName] : undefined

            addOperation(
                fullPath,
                { ...binding, auth: binding.auth || mount.authAtMount },
                tagName,
                schemaToOpenApi(bodySchema),
                querySchemaToParams(querySchema)
            )
        })
    })

    if (extraRoutes.length) {
        tags.push({ name: "Misc" })
        extraRoutes.forEach((binding) => {
            const fullPath = joinPaths(globalPrefix, binding.path)
            addOperation(fullPath, binding, "Misc")
        })
    }

    const doc = {
        openapi: "3.0.3",
        info: {
            title: "Fantasy Predict Backend API",
            version: "1.0.0",
            description:
                "Use the schemas and endpoints below for integration",
        },
        servers: [{ url: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}` }],
        tags,
        paths,
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    description: "Send the token as: Authorization: Bearer <token>",
                },
            },
        },
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(doc, null, 2))
    console.log(
        `OpenAPI spec written to ${path.relative(process.cwd(), OUTPUT_PATH)} (${Object.keys(paths).length} paths)`
    )
}

generate()
