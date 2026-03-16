/**
 * Mock for the `sanity` package in Vitest
 *
 * The real `sanity` package transitively imports `styled-components` via
 * `@sanity/ui`, which triggers a CJS/ESM named-export error on Node 18.
 * This mock provides the schema-definition helpers (`defineField`,
 * `defineType`, `defineArrayMember`) as identity functions so that
 * schema unit tests can import and validate schema objects without
 * loading the full Sanity runtime.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Identity function — returns the schema definition as-is. */
export const defineField = (field: any) => field;
export const defineType = (type: any) => type;
export const defineArrayMember = (member: any) => member;
export const defineConfig = (config: any) => config;
