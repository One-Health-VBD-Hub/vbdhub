# Repository Guidelines

## Tooling
- use `pnpm` over `npm`

## System Design & Architecture
- follow modern and best practices
- prefer simple, robust, maintainable designs; do not over-engineer
- challenge technical direction when a clearly better solution exists

## Coding
- write simple, modern, efficient, idiomatic code following best practices and patterns of the given technology/language/library/framework
- the less lines of code the better (within reason), as long as it does not compromise quality (readability, maintainability, or performance)
  - however, avoid over-abstractions and "clever" code
- avoid useless ceremony
- whenever the code is not trivial or self-explanatory, add light comments
- do not create custom solutions or little helpers when a standard library or well-known package already exists
  - however, if considering a less-known or niche package, ask for approval

## Backend
- type Fastify routes with `@fastify/type-provider-json-schema-to-ts`, JSON schemas using `as const`, and `FastifyPluginAsyncJsonSchemaToTs`
- use Zod for runtime validation outside Fastify routes and infer corresponding types with `z.infer`

## Frontend
- minimise frontend maintenance overhead and developer cognitive load
- prefer Carbon Design System (https://carbondesignsystem.com/) components
  - before building a custom UI element, check whether an appropriate Carbon component exists
  - use Carbon components with minimal customisation
  - only build a custom component when Carbon does not provide a suitable option
- aim for a sleek, modern, and minimal UI using simple, maintainable patterns